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

package com.ford.internalprojects.peoplemover.auth

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.labs.authquest.oauth.OAuthAccessTokenResponse
import com.ford.labs.authquest.oauth.OAuthRefreshTokenResponse
import com.ford.labs.authquest.oauth.OAuthVerifyResponse
import com.ford.labs.authquest.user.UserReadResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.web.client.HttpClientErrorException
import java.util.*

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerE2ETest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    lateinit var spaceRepository: SpaceRepository

    @MockBean
    lateinit var authClient: AuthClient

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Value("\${authquest.client_id}")
    lateinit var clientId: String

    @Value("\${authquest.client_secret}")
    lateinit var clientSecret: String

    @Test
    fun `PUT should return NO_CONTENT with a valid invite scope request`() {
        val emails = listOf("EMAIL_1", "EMAIL_2")
        val spaceName = "spaceName"

        `when`(authClient.getUserIdFromEmail("EMAIL_1")).thenReturn(ResponseEntity.ok(UserReadResponse("uuid1")))
        `when`(authClient.getUserIdFromEmail("EMAIL_2")).thenReturn(ResponseEntity.ok(UserReadResponse("uuid2")))
        spaceRepository.save(Space(id = 1, name = spaceName))

        val request = AuthInviteUsersToSpaceRequest(
                spaceName = spaceName,
                emails = emails
        )

        mockMvc.perform(put("/api/user/invite/space")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json")
        ).andExpect(
                status().isNoContent
        )
        val savedIds: List<String> = userSpaceMappingRepository.findAll().map { it.userId!! }

        verify(authClient).inviteUsersToScope(emails, spaceName)
        assertThat(userSpaceMappingRepository.count()).isEqualTo(2)
        assertThat(savedIds).contains("uuid1")
        assertThat(savedIds).contains("uuid2")
    }

    @Test
    fun `PUT should return BAD_REQUEST with an empty space name`() {
        val request = AuthInviteUsersToSpaceRequest(
                spaceName = "",
                emails = listOf("EMAIL_1", "EMAIL_2")
        )
        mockMvc.perform(put("/api/user/invite/space")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json")
        ).andExpect(
                status().isBadRequest
        )
    }

    @Test
    fun `PUT should return BAD_REQUEST with an empty emails list`() {
        val request = AuthInviteUsersToSpaceRequest(
                spaceName = "spaceName",
                emails = listOf()
        )
        mockMvc.perform(put("/api/user/invite/space")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json")
        ).andExpect(
                status().isBadRequest
        )
    }

    @Test
    fun `POST should retrieve an auth token given an access code`() {
        val expectedResult = OAuthAccessTokenResponse("", listOf(), "TOKEN123")

        `when`(authClient.createAccessToken("accessCode123"))
                .thenReturn(Optional.of(expectedResult))

        val request = AccessTokenRequest("accessCode123")

        val result = mockMvc.perform(post("/api/access_token")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isOk)
                .andReturn()

        val response = objectMapper.readValue(result.response.contentAsString, OAuthAccessTokenResponse::class.java)
        assertThat(response).isEqualTo(expectedResult)
        verify(authClient).createAccessToken("accessCode123")
    }

    @Test
    fun `POST should not return token when the access code is not valid`() {
        val request = AccessTokenRequest(accessCode = "")

        mockMvc.perform(post("/api/access_token")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isBadRequest)

        verify(authClient, never()).createAccessToken(ArgumentMatchers.anyString())
    }

    @Test
    fun `POST validate access token - should return OK if access token is valid`() {
        val request = ValidateTokenRequest(accessToken = "access_token")


        `when`(authClient.validateAccessToken("access_token")).thenReturn(Optional.of(
                OAuthVerifyResponse(
                        "",
                        listOf(),
                        1L,
                        "",
                        ""
                )))


        mockMvc.perform(post("/api/access_token/validate")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isOk)

        verify(authClient).validateAccessToken("access_token")
    }

    @Test
    fun `POST validate access token - should return FORBIDDEN if access token is invalid`() {
        val request = ValidateTokenRequest(accessToken = "INVALID_ACCESS_TOKEN")

        `when`(authClient.validateAccessToken(request.accessToken)).thenThrow(HttpClientErrorException(HttpStatus.FORBIDDEN))

        mockMvc.perform(post("/api/access_token/validate")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `POST refresh token - should return a new access_token with a valid request`() {

        val request = RefreshTokenRequest(accessToken = "ACCESS_TOKEN")

        val authResponse = OAuthRefreshTokenResponse("USER_ID", "NEW_ACCESS_TOKEN")

        `when`(authClient.refreshAccessToken(request.accessToken)).thenReturn(
                Optional.of(authResponse)
        )

        val result = mockMvc.perform(post("/api/access_token/refresh")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isOk).andReturn()

        val response = objectMapper.readValue(result.response.contentAsString, OAuthAccessTokenResponse::class.java)

        assertThat(response.access_token).isEqualTo(authResponse.access_token)
    }

    @Test
    fun `POST should return 200 ok if space name is found in access token scopes`() {

        val accessToken = "fake_access_token"
        val authVerifyResponse = OAuthVerifyResponse("USER_ID", listOf("SpaceOne", "SpaceTwo"), 1, "", "")

        `when`(authClient.validateAccessToken(accessToken)).thenReturn(
                Optional.of(authVerifyResponse)
        )

        val request = AuthCheckScopesRequest.builder()
                .accessToken(accessToken)
                .spaceName("spaceOne")
                .build()

        mockMvc.perform(post("/api/access_token/authenticate")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isOk)

        verify(authClient).validateAccessToken(accessToken)
    }

    @Test
    fun `POST should return 403 if space name is not found in access token scopes`() {
        val accessToken = "fake_access_token"

        `when`(authClient.validateAccessToken(accessToken)).thenReturn(Optional.of(
                OAuthVerifyResponse("USER_ID",
                        listOf("SpaceOne", "SpaceTwo"),
                        1,
                        "",
                        ""
                )
        ))

        val request = AuthCheckScopesRequest.builder()
                .accessToken(accessToken)
                .spaceName("SpaceThree")
                .build()

        mockMvc.perform(post("/api/access_token/authenticate")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isForbidden)
    }
}
