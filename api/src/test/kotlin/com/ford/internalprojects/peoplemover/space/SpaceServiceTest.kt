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

package com.ford.internalprojects.peoplemover.space

import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkStatic
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito
import org.mockito.Mockito.times
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import java.time.Instant

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
class SpaceServiceTest {

    @Autowired
    lateinit var underTest: SpaceService

    @MockBean
    lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Before
    fun before() {
        mockkStatic(SecurityContextHolder::class)
    }

    @After
    fun after() {
        unmockkStatic(SecurityContextHolder::class)
        Mockito.clearInvocations(userSpaceMappingRepository)
    }

    @Test
    fun `getSpacesForUser should handle a token that has no Principal name and no appId name`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        every { SecurityContextHolder.getContext().authentication.credentials } returns Jwt("token", Instant.now(), Instant.now(), mapOf("h" to "h"), mapOf("noAppId" to "Nothing"))
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verifyNoMoreInteractions(userSpaceMappingRepository)
    }

    @Test
    fun `getSpacesForUser should handle a token that has a Principal name`() {
        every { SecurityContextHolder.getContext().authentication.name } returns "Bob"
        every { SecurityContextHolder.getContext().authentication.credentials } returns Jwt("token", Instant.now(), Instant.now(), mapOf("h" to "h"), mapOf("appId" to "Nothing"))
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verify(userSpaceMappingRepository, times(1)).findAllByUserId("Bob")
    }

    @Test
    fun `getSpacesForUser should handle a token that has no Principal name but does have an appId name`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        every { SecurityContextHolder.getContext().authentication.credentials } returns Jwt("token", Instant.now(), Instant.now(), mapOf("h" to "h"), mapOf("appid" to "easyas123"))
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verify(userSpaceMappingRepository, times(1)).findAllByUserId("easyas123")
    }

    @Test
    fun `getSpacesForUser should handle a token that doesn't have jwt credentials`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        every { SecurityContextHolder.getContext().authentication.credentials } returns null
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verifyNoMoreInteractions(userSpaceMappingRepository)
    }
}
