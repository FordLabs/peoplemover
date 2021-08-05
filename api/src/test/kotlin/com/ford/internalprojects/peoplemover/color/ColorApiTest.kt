/*
 * Copyright (c) 2021 Ford Motor Company
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

package com.ford.internalprojects.peoplemover.color

import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@AutoConfigureMockMvc
@RunWith(SpringRunner::class)
@ActiveProfiles("test")
@SpringBootTest
class ColorApiTest {
    @Autowired
    private lateinit var mockMvc: MockMvc
    @Autowired
    private lateinit var objectMapper: ObjectMapper
    @Autowired
    private lateinit var colorRepository: ColorRepository

    private val colors = listOf("33", "66")

    @Before
    fun setUp() {
        colorRepository.deleteAll()
    }

    @Test
    fun `POST should add all the colors to the repository`() {
        assertThat(colorRepository.count()).isZero()
        mockMvc.perform(post("/api/color")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(colors)))
                .andExpect(status().isOk)
        assertThat(colorRepository.count()).isEqualTo(2)
    }

    @Test
    fun `POST should 409 when trying to add the same color twice`() {
        assertThat(colorRepository.count()).isZero()
        colors.forEach{ color: String -> colorRepository.save(Color(color = color)) }
        mockMvc.perform(post("/api/color")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(colors)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `GET should return all the colors in the repository in ascending ID order`() {
        colors.forEach{ color: String -> colorRepository.save(Color(color = color)) }
        assertThat(colorRepository.count()).isNotZero()
        val result = mockMvc.perform(get("/api/color")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk)
                .andReturn()
        val response = result.response.contentAsString
        val actualColors = objectMapper.readValue<List<Color>>(
                response,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Color::class.java)
        )
        actualColors.forEach{ color: Color -> assertThat(colors).contains(color.color) }
        assertThat(colors[0]).isEqualTo(actualColors[0].color)
    }
}
