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
import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.auth.AuthService
import com.ford.internalprojects.peoplemover.auth.OAuthVerifyResponse
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.auth.exceptions.InvalidTokenException
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.*

@AutoConfigureMockMvc
@RunWith(SpringRunner::class)
@SpringBootTest
class SpaceControllerApiTest {

    @MockBean
    lateinit var jwtDecoder: JwtDecoder

    @MockBean
    lateinit var authService: AuthService

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    private lateinit var mockMvc: MockMvc


    @After
    fun tearDown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        spaceRepository.deleteAll()
        userSpaceMappingRepository.deleteAll()
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

        val authVerifyResponse = OAuthVerifyResponse("", listOf("SpaceOne", "SpaceTwo"), 1, "", "USER_ID")
        `when`(authService.validateToken(accessToken)).thenReturn(authVerifyResponse)

        val result = mockMvc.perform(post("/api/user/space")
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $accessToken")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk)
                .andReturn()

        val actualSpaceResponse: SpaceResponse = objectMapper.readValue(
                result.response.contentAsString,
                SpaceResponse::class.java
        )
        assertThat(actualSpaceResponse.space.name).isEqualTo(request.spaceName)
        assertThat(spaceRepository.findAll().first().name).isEqualTo(request.spaceName)
        val userSpaceMappings: List<UserSpaceMapping> = userSpaceMappingRepository.findAll()
        assertThat(userSpaceMappings).hasSize(1)
        assertThat(userSpaceMappings[0].userId).isEqualTo("USER_ID")
        assertThat(userSpaceMappings[0].spaceId).isEqualTo(actualSpaceResponse.space.id)
    }

    @Test
    fun `POST should create default product, and unassigned product when creating space`() {
        val result = mockMvc.perform(post("/api/space")
                .content("Ken Carson"))
                .andExpect(status().isOk)
                .andReturn()

        val actualSpaceResponse: Space = objectMapper.readValue(
                result.response.contentAsString,
                Space::class.java
        )

        assertThat(productRepository.count()).isOne()
        checkAutoGeneratedProduct("unassigned", actualSpaceResponse.id!!)
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
        `when`(authService.validateToken(token)).thenThrow(InvalidTokenException())

        mockMvc.perform(post("/api/user/space")
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized)

        assertThat(spaceRepository.count()).isZero()
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
    fun `GET should return the number of spaces`() {
        spaceRepository.save(Space(name = "Ken Masters"))
        spaceRepository.save(Space(name = "KenM"))
        spaceRepository.save(Space(name = "Ken Starr"))

        val result = mockMvc.perform(get("/api/space/total"))
                .andExpect(status().isOk).andReturn()

        val actual: Int = result.response.contentAsString.toInt()

        assertThat(actual).isEqualTo(3)
    }

    @Test
    fun `GET should return all spaces for current user`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))
        val space2: Space = spaceRepository.save(Space(name = "SpaceTwo"))
        spaceRepository.save(Space(name = "SpaceThree"))

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "userId", spaceId = space1.id))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "userId", spaceId = space2.id))

        val accessToken = "TOKEN"
        val authVerifyResponse = OAuthVerifyResponse("", listOf("SpaceOne", "SpaceTwo"), 1, "", "userId")
        `when`(authService.validateToken(accessToken)).thenReturn(authVerifyResponse)

        val result = mockMvc.perform(get("/api/user/space")
                .header("Authorization", "Bearer $accessToken"))
                .andExpect(status().isOk)
                .andReturn()

        val actualUserSpaces: Array<Space> = objectMapper.readValue(
                result.response.contentAsString,
                Array<Space>::class.java
        )

        assertThat(actualUserSpaces).hasSize(2)
        assertThat(actualUserSpaces).contains(space1)
        assertThat(actualUserSpaces).contains(space2)
    }

    @Test
    fun `GET should return correct space for current user`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))

        val result = mockMvc.perform(get("/api/space/${space1.uuid}"))
                .andExpect(status().isOk)
                .andReturn()

        val actualSpace: Space = objectMapper.readValue(
                result.response.contentAsString,
                Space::class.java
        )

        assertThat(actualSpace).isEqualTo(space1)
    }

    @Test
    fun `GET should return 401 when access token is invalid`() {
        val accessToken = "INVALID_TOKEN"
        `when`(authService.validateToken(accessToken)).thenThrow(InvalidTokenException())
        mockMvc.perform(get("/api/user/space")
                .header("Authorization", "Bearer $accessToken"))
                .andExpect(status().isUnauthorized)
    }

    @Test
    fun `GET should return 400 if space does not exist`() {
        mockMvc.perform(get("/api/space/badSpace"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should return 200 if the flipping sweet space is deleted` (){

        val space = spaceRepository.save(Space(name = "flippingsweet", uuid = UUID.randomUUID().toString()))
        spaceRepository.save(Space(name = "spaceNotToBeDeleted", uuid = UUID.randomUUID().toString()))

        val product =  productRepository.save(Product(name = "Product1", spaceId = space.id!!))

        val person = personRepository.save(Person(name = "Henry", spaceId = space.id!!))

        assignmentRepository.save(Assignment(person = person, spaceId = space.id!!, productId = product.id!!, effectiveDate = LocalDate.now(), placeholder = false))

        assertThat(spaceRepository.count()).isEqualTo(2)
        assertThat(assignmentRepository.count()).isEqualTo(1)
        assertThat(personRepository.count()).isEqualTo(1)
        assertThat(productRepository.count()).isEqualTo(1)

        mockMvc.perform(delete("/api/space/deleteFlippingSweet")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk)

        assertThat(spaceRepository.count()).isOne()
        assertThat(assignmentRepository.count()).isZero()
        assertThat(personRepository.count()).isZero()
        assertThat(productRepository.count()).isZero()
    }

    private fun checkAutoGeneratedProduct(name: String, expectedSpaceId: Int) {
        val product: Product = productRepository.findByName(name)!!

        assertThat(product.spaceId).isEqualTo(expectedSpaceId)
        assertThat(product.spaceLocation?.name).isNull()
        assertThat(product.dorf).isNullOrEmpty()
        assertThat(product.notes).isNullOrEmpty()
    }
}
