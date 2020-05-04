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

package com.ford.internalprojects.peoplemover.user

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.auth.AuthService
import com.ford.internalprojects.peoplemover.auth.ValidateTokenRequest
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    @MockBean
    private lateinit var authService: AuthService

    @Test
    fun `POST should create user`() {
        val request = UserRequest(uuid ="UUID")
        val accessToken = "TOKEN"
        `when`(authService.validateAccessToken(ValidateTokenRequest(accessToken= accessToken)))
                .thenReturn(ResponseEntity.ok().build())

        val result = mockMvc.perform(post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $accessToken"))
                .andExpect(status().isOk)
                .andReturn()

        val actualCreatedUser: UserResponse = objectMapper.readValue(
                result.response.contentAsString,
                UserResponse::class.java
        )

        assertThat(userRepository.count()).isOne()

        val createdUserInDb: User? = userRepository.findAll().first()
        assertThat(createdUserInDb?.id).isNotNull()
        assertThat(createdUserInDb?.uuid).isEqualTo(request.uuid)
        assertThat(createdUserInDb?.uuid).isEqualTo(actualCreatedUser.uuid)
    }

    @Test
    fun `POST should return 401 when trying to create a user with an invalid access token`() {
        val request = UserRequest(uuid ="UUID")
        val accessToken = "TOKEN"
        val tokenRequest = ValidateTokenRequest( accessToken = accessToken)
        `when`(authService.validateAccessToken(tokenRequest)).thenReturn(ResponseEntity.badRequest().build())

        mockMvc.perform(post("/api/user").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $accessToken"))
                .andExpect(status().isUnauthorized)
                .andReturn()

        verify(authService).validateAccessToken(tokenRequest)
    }
}