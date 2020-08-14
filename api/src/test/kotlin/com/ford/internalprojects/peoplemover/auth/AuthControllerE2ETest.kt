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
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtException
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.*

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerE2ETest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @MockBean
    lateinit var jwtDecoder: JwtDecoder

    @Autowired
    lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    lateinit var spaceRepository: SpaceRepository

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Before
    fun setUp() {
        userSpaceMappingRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `PUT should return NO_CONTENT with a valid ADFS request`() {
        val emails = listOf("email_1@email.com", "email_2@otheremail.com")
        val spaceName = "spaceName"

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

        assertThat(userSpaceMappingRepository.count()).isEqualTo(2)
        assertThat(savedIds).contains("EMAIL_1")
        assertThat(savedIds).contains("EMAIL_2")
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
    fun `POST validate access token - should return OK if access token valid in ADFS`() {
        val request = ValidateTokenRequest(accessToken = "access_token")

        val headers = HashMap<String, Any>()
        headers["typ"] = "JWT"
        val claims = HashMap<String, Any>()
        claims["sub"] = "USER_ID"
        claims["expiresAt"] = Instant.now()
        claims["iss"] = "https://localhost"
        val fakeJwt = Jwt("access_token", Instant.MIN, Instant.now(), headers, claims)


        `when`(jwtDecoder.decode(request.accessToken)).thenReturn(fakeJwt)

        mockMvc.perform(post("/api/access_token/validate")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isOk)

        verify(jwtDecoder).decode("access_token")
    }

    @Test
    fun `POST validate access token - should return FORBIDDEN if access token is invalid in validator`() {
        val request = ValidateTokenRequest(accessToken = "INVALID_ACCESS_TOKEN")

        `when`(jwtDecoder.decode(request.accessToken)).thenThrow(JwtException("INVALID JWT"))

        mockMvc.perform(post("/api/access_token/validate")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isUnauthorized)
    }

    @Test
    fun `POST should return 200 ok if space name is found in database for user from ADFS`() {

        val accessToken = "fake_access_token"

        val savedSpace = spaceRepository.save(Space("spaceThree"))

        val issuedAt = Instant.now()
        val headers = HashMap<String, Any>()
        headers["typ"] = "JWT"
        val claims = HashMap<String, Any>()
        claims["sub"] = "USER_ID"
        val expiresAt = Instant.now()
        claims["expiresAt"] = expiresAt
        claims["iss"] = "https://localhost"
        val fakeJwt = Jwt(accessToken, issuedAt, expiresAt, headers, claims)

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceId = savedSpace.id))
        `when`(jwtDecoder.decode(accessToken)).thenReturn(fakeJwt)

        val request = AuthCheckScopesRequest(
                accessToken = accessToken,
                spaceName ="spaceThree"
        )

        mockMvc.perform(post("/api/access_token/authenticate")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isOk)
    }

    @Test
    fun `POST should return 403 if space not mapped to user`() {
        val accessToken = "fake_access_token"

        val issuedAt = Instant.now()
        val headers = HashMap<String, Any>()
        headers["typ"] = "JWT"
        val claims = HashMap<String, Any>()
        claims["sub"] = "USER_ID"
        val expiresAt = Instant.now()
        claims["expiresAt"] = expiresAt
        claims["iss"] = "https://localhost"
        val fakeJwt = Jwt(accessToken, issuedAt, expiresAt, headers, claims)

        spaceRepository.save(Space("spaceThree"))
        `when`(jwtDecoder.decode(accessToken)).thenReturn(fakeJwt)

        val request = AuthCheckScopesRequest(
                accessToken = accessToken,
                spaceName = "SpaceThree")

        mockMvc.perform(post("/api/access_token/authenticate")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isForbidden)
    }
}
