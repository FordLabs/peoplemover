/*
 * Copyright (c) 2020 Ford Motor Company
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
import org.springframework.test.context.ActiveProfiles
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
class AuthControllerTest {

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

    final var uuid: String = "spaceUUID"

    @Before
    fun setUp() {
        userSpaceMappingRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `POST validate access token - should return OK if access token valid`() {
        val request = ValidateTokenRequest(accessToken = "access_token")
        `when`(jwtDecoder.decode(request.accessToken)).thenReturn(getJwt("access_token"))

        mockMvc.perform(post("/api/access_token/validate")
                .header("Authorization", "Bearer access_token")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isOk)
    }

    @Test
    fun `POST validate access token - should return UNAUTHORIZED if access token is invalid in validator`() {
        val request = ValidateTokenRequest(accessToken = "INVALID_ACCESS_TOKEN")

        `when`(jwtDecoder.decode(request.accessToken)).thenThrow(JwtException("INVALID JWT"))

        mockMvc.perform(post("/api/access_token/validate")
                .header("Authorization", "Bearer INVALID_ACCESS_TOKEN")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isUnauthorized)
    }

    @Test
    fun `POST should return 200 ok if space uuid is found in database for user from ADFS`() {
        val accessToken = "fake_access_token"
        `when`(jwtDecoder.decode(accessToken)).thenReturn(getJwt(accessToken))

        val savedSpace = spaceRepository.save(Space(name = "spaceThree", uuid = uuid))

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceId = savedSpace.id))

        val request = AuthCheckScopesRequest(
                accessToken = accessToken,
                uuid = uuid
        )

        mockMvc.perform(post("/api/access_token/authenticate")
                .header("Authorization", "Bearer fake_access_token")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isOk)
    }

    @Test
    fun `POST should return 403 if space not mapped to user`() {
        val accessToken = "fake_access_token"
        `when`(jwtDecoder.decode(accessToken)).thenReturn(getJwt(accessToken))

        spaceRepository.save(Space(name = "spaceThree", uuid = "SpaceUUID"))

        val request = AuthCheckScopesRequest(
                accessToken = accessToken,
                uuid = "SpaceUUID")

        mockMvc.perform(post("/api/access_token/authenticate")
                .header("Authorization", "Bearer fake_access_token")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json"))
                .andExpect(status().isForbidden)
    }

    private fun getJwt(accessToken: String): Jwt {
        val issuedAt = Instant.MIN
        val headers = HashMap<String, Any>()
        headers["typ"] = "JWT"
        val claims = HashMap<String, Any>()
        claims["sub"] = "USER_ID"
        val expiresAt = Instant.now()
        claims["expiresAt"] = expiresAt
        claims["iss"] = "https://localhost"
        return Jwt(accessToken, issuedAt, expiresAt, headers, claims)
    }
}
