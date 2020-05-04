/*
 * Copyright (c) 2019 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.ford.internalprojects.peoplemover.space

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.auth.*
import com.ford.internalprojects.peoplemover.board.Board
import com.ford.internalprojects.peoplemover.board.BoardRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.labs.authquest.oauth.OAuthRefreshTokenResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.sql.Timestamp
import java.util.*

@AutoConfigureMockMvc
@RunWith(SpringRunner::class)
@SpringBootTest
class SpaceControllerApiTest {
    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var boardRepository: BoardRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var authService: AuthService

    @MockBean
    private lateinit var authClient: AuthClient

    @Autowired
    private lateinit var mockMvc: MockMvc

    @After
    fun tearDown() {
        productRepository.deleteAll()
        boardRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `POST should create space with given name`() {
        val spaceNameToCreate = "Ken Carson"

        val result = mockMvc.perform(post("/api/space")
                .content(spaceNameToCreate))
                .andExpect(status().isOk).andReturn()

        val actualSpace: Space = objectMapper.readValue(
                result.response.contentAsString,
                Space::class.java
        )

        assertThat(spaceRepository.count()).isOne()
        assertThat(spaceRepository.findByNameIgnoreCase(spaceNameToCreate)).isNotNull()
        assertThat(actualSpace.name).isEqualTo(spaceNameToCreate)
    }

    @Test
    fun `POST should create Space and Add Current User to Space`() {
        val request = SpaceCreationRequest(spaceName = "New Space")
        val accessToken = "TOKEN"

        val validateTokenRequest = ValidateTokenRequest(accessToken= accessToken)
        val userRoleRequest = UserRoleRequest.builder()
                .token(accessToken)
                .spaceName(request.spaceName)
                .build()

        val jwtToken = AuthQuestJWT(
                user_id = "userId",
                scopes = listOf(),
                exp = null,
                iss = null,
                sub = null
        )

        `when`(authService.validateAccessToken(validateTokenRequest)).thenReturn(ResponseEntity.ok(jwtToken))
        val updatedToken = "REFRESHED_TOKEN"
        `when`(authClient.refreshAccessToken(accessToken)).thenReturn(Optional.of(OAuthRefreshTokenResponse(
                "",
                updatedToken
        )))

        val result = mockMvc.perform(post("/api/user/space")
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $accessToken")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk)
                .andReturn()

        val actualSpaceWithAccessTokenResponse: SpaceWithAccessTokenResponse = objectMapper.readValue(
                result.response.contentAsString,
                SpaceWithAccessTokenResponse::class.java
        )
        assertThat(actualSpaceWithAccessTokenResponse.space.name).isEqualTo(request.spaceName)
        assertThat(actualSpaceWithAccessTokenResponse.accessToken).isEqualTo(updatedToken)
        assertThat(spaceRepository.findAll().first().name).isEqualTo(request.spaceName)
        verify(authService).validateAccessToken(validateTokenRequest)
        verify(authClient).updateUserScopes(jwtToken.user_id!!, listOf(request.spaceName))
        verify(authClient).createScope(listOf(request.spaceName))
    }

    @Test
    fun `POST should create default board, default product, and unassigned product when creating space`() {
        mockMvc.perform(post("/api/space")
                .content("Ken Carson"))
                .andExpect(status().isOk)
                .andReturn()

        val defaultBoard: Board = boardRepository.findByNameIgnoreCase("My Board")?.get()!!
        assertThat(boardRepository.count()).isOne()

        assertThat(productRepository.count()).isEqualTo(2)
        checkAutoGeneratedProduct("unassigned", defaultBoard.id!!)
        checkAutoGeneratedProduct("My Product", defaultBoard.id!!)
    }

    @Test
    fun `POST should return 400 when not given name or post body`() {
        mockMvc.perform(post("/api/space"))
                .andExpect(status().isBadRequest)
        mockMvc.perform(post("/api/space")
                .content(""))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST should return 401 when token is not valid`() {
        val request = SpaceCreationRequest(spaceName = "New Space")
        val token = "TOKEN"
        val validateTokenRequest = ValidateTokenRequest(accessToken= token)
        `when`(authService.validateAccessToken(validateTokenRequest)).thenReturn(ResponseEntity.badRequest().build())

        mockMvc.perform(post("/api/user/space")
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized)

        assertThat(spaceRepository.count()).isZero()
        verify(authService).validateAccessToken(validateTokenRequest)
        verify(authService, never()).updateUserRole(any())
    }

    @Test
    fun `POST should return 409 when space name already exists`() {
        spaceRepository.save(Space(name = "NaNy NaNd"))

        mockMvc.perform(post("/api/space")
                .content("NaNy NaNd"))
                .andExpect(status().isConflict)
    }

    @Test
    fun `GET should return all spaces`() {
        val space1: Space = spaceRepository.save(Space(name = "Ken Masters"))
        val space2: Space = spaceRepository.save(Space(name = "KenM"))
        val space3: Space = spaceRepository.save(Space(name = "Ken Starr"))

        val result = mockMvc.perform(get("/api/space"))
                .andExpect(status().isOk).andReturn()

        val actual: List<Space> = objectMapper.readValue(result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Space::class.java))

        assertThat(actual[0]).isEqualTo(space1)
        assertThat(actual[1]).isEqualTo(space2)
        assertThat(actual[2]).isEqualTo(space3)
    }

    @Test
    fun `GET should return all spaces for current user`() {
        val spaces = listOf("Reserved", "Reserved", "SpaceOne", "SpaceTwo")
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))
        val space2: Space = spaceRepository.save(Space(name = "SpaceTwo"))

        val validateTokenRequest = ValidateTokenRequest(accessToken= "TOKEN")
        `when`(authService.validateAccessToken(validateTokenRequest))
                .thenReturn(ResponseEntity.ok(AuthQuestJWT(
                        scopes= spaces,
                        user_id = "",
                        exp = "",
                        iss = "",
                        sub = ""
                )))

        val result = mockMvc.perform(get("/api/user/space")
                .header("Authorization", "Bearer ${validateTokenRequest.accessToken}"))
                .andExpect(status().isOk)
                .andReturn()

        val actualUserSpaces: Array<Space> = objectMapper.readValue(
                result.response.contentAsString,
                Array<Space>::class.java
        )

        assertThat(actualUserSpaces).hasSize(2)
        assertThat(actualUserSpaces[0]).isEqualTo(space1)
        assertThat(actualUserSpaces[1]).isEqualTo(space2)
        verify(authService).validateAccessToken(validateTokenRequest)
    }

    @Test
    fun `GET should return 401 when access token is invalid`() {
        val validateTokenRequest = ValidateTokenRequest(accessToken= "INVALID_TOKEN")
        `when`(authService.validateAccessToken(validateTokenRequest)).thenReturn(ResponseEntity.badRequest().build())
        mockMvc.perform(get("/api/user/space")
                .header("Authorization", "Bearer ${validateTokenRequest.accessToken}"))
                .andExpect(status().isUnauthorized)
        verify(authService).validateAccessToken(validateTokenRequest)
    }

    @Test
    fun `GET should return last modified timestamp for a space`() {
        val expectedTimestamp: Timestamp = Timestamp.valueOf("2010-01-12 01:01:01")
        val space: Space = spaceRepository.save(Space(name = "SpaceOne", lastModifiedDate = expectedTimestamp))

        val result = mockMvc.perform(get("/api/space/${space.name}"))
                .andExpect(status().isOk)
                .andReturn()

        val actualTimestampResponse: TimestampResponse = objectMapper.readValue(
                result.response.contentAsString,
                TimestampResponse::class.java)
        val expectedTimestampResponse = TimestampResponse(expectedTimestamp)
        assertThat(actualTimestampResponse).isEqualTo(expectedTimestampResponse)
    }

    @Test
    fun `GET should return 400 if space does not exist`() {
        mockMvc.perform(get("/api/space/badSpace"))
                .andExpect(status().isBadRequest)
    }

    private fun checkAutoGeneratedProduct(name: String, expectedBoardId: Int) {
        val product: Product = productRepository.findByName(name)!!

        assertThat(product.boardId).isEqualTo(expectedBoardId)
        assertThat(product.spaceLocation?.name).isNull()
        assertThat(product.dorf).isNullOrEmpty()
        assertThat(product.notes).isNullOrEmpty()
    }
}
