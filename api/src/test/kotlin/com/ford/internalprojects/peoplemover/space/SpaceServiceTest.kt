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
import com.ford.internalprojects.peoplemover.auth.createMockJwt
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkStatic
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.mockito.Mockito.times
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
class SpaceServiceTest {

    @Autowired
    lateinit var underTest: SpaceService

    @MockBean
    lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @BeforeEach
    fun before() {
        mockkStatic(SecurityContextHolder::class)
    }

    @AfterEach
    fun after() {
        unmockkStatic(SecurityContextHolder::class)
        Mockito.clearInvocations(userSpaceMappingRepository)
    }

    @Test
    fun `getSpacesForUser should return no spaces given a token that has no Principal name and no appId name`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        every { SecurityContextHolder.getContext().authentication.credentials } returns createMockJwt(true)
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verifyNoMoreInteractions(userSpaceMappingRepository)
    }

    @Test
    fun `getSpacesForUser should use the principal name if a token has a Principal name and an appId`() {
        every { SecurityContextHolder.getContext().authentication.name } returns "Bob"
        every { SecurityContextHolder.getContext().authentication.credentials } returns createMockJwt(false)
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verify(userSpaceMappingRepository, times(1)).findAllByUserId("Bob")
    }

    @Test
    fun `getSpacesForUser should use the principal name if a token has a Principal name and no appId`() {
        every { SecurityContextHolder.getContext().authentication.name } returns "Bob"
        every { SecurityContextHolder.getContext().authentication.credentials } returns createMockJwt(true)
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verify(userSpaceMappingRepository, times(1)).findAllByUserId("Bob")
    }

    @Test
    fun `getSpacesForUser should use the appId if a token has an appId name but no principal name`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        every { SecurityContextHolder.getContext().authentication.credentials } returns createMockJwt(false)
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verify(userSpaceMappingRepository, times(1)).findAllByUserId("APP_ID")
    }

    @Test
    fun `getSpacesForUser should return no spaces given a token that doesn't have jwt credentials`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        every { SecurityContextHolder.getContext().authentication.credentials } returns null
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verifyNoMoreInteractions(userSpaceMappingRepository)
    }
}
