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

package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.security.authentication.TestingAuthenticationToken
import org.springframework.security.core.Authentication
import java.util.*

@ExtendWith(MockKExtension::class)
class AuthInterceptorTest {
    @MockK
    lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @MockK
    lateinit var spaceRepository: SpaceRepository

    lateinit var authServiceTest: AuthServiceTest

    private lateinit var authInterceptor: CustomPermissionEvaluator

    private val target = "target"

    @BeforeEach
    fun setUp() {
        MockKAnnotations.init(this)
        authInterceptor = CustomPermissionEvaluator(userSpaceMappingRepository, spaceRepository)
        authServiceTest = AuthServiceTest()
    }

    @Test
    fun `should deny tokens that are not authenticated`() {
        val auth = TestingAuthenticationToken("Principal", "Credentials")
        auth.isAuthenticated = false
        assertThat(authInterceptor.hasPermission(auth, target, "unknown_permission")).isFalse()
    }

    @Test
    fun `should deny if token doesn't have a subject`() {
        val auth = TestingAuthenticationToken(null, createMockJwt(true))
        auth.isAuthenticated = true
        assertThat(authInterceptor.hasPermission(auth, target, "read")).isFalse()
    }

    @Test
    fun `should deny unknown permissions`() {
        every { spaceRepository.findByUuid(any()) } returns Space(name = "testSpace")
        assertThat(authInterceptor.hasPermission(getUserAuth(), target, "unknown_permission")).isFalse()
    }

    @Test
    fun `read should throw SpaceNotExistsException if space not found`() {
        every { spaceRepository.findByUuid(any()) } returns null
        assertThatThrownBy {
            this.authInterceptor.hasPermission(getUserAuth(), target, "read")
        }.isInstanceOf(
            SpaceNotExistsException::class.java
        )
    }

    @Test
    fun `read should allow if space is public`() {
        every { spaceRepository.findByUuid(any()) } returns Space(name = "testSpace", todayViewIsPublic = true)
        assertThat(authInterceptor.hasPermission(getUserAuth(), target, "read")).isTrue()
    }

    @Test
    fun `read should deny if user does not have permission on space`() {
        setupMockForReadAndWrite(false)
        assertThat(authInterceptor.hasPermission(getUserAuth(), target, "read")).isFalse()
    }

    @Test
    fun `read should allow if user has permission on space`() {
        setupMockForReadAndWrite(true)
        assertThat(authInterceptor.hasPermission(getUserAuth(), target, "read")).isTrue()
    }

    @Test
    fun `read should deny if app does not have permission on space`() {
        setupMockForReadAndWrite(false)
        assertThat(authInterceptor.hasPermission(getAppAuth(), target, "read")).isFalse()
    }

    @Test
    fun `read should allow if app has permission on space`() {
        setupMockForReadAndWrite(true)
        assertThat(authInterceptor.hasPermission(getAppAuth(), target, "read")).isTrue()
    }

    @Test
    fun `write should deny if user does not have permission on space`() {
        setupMockForReadAndWrite(false)
        assertThat(authInterceptor.hasPermission(getUserAuth(), target, "write")).isFalse()
    }

    @Test
    fun `write should allow if user has permission on space`() {
        setupMockForReadAndWrite(true)
        assertThat(authInterceptor.hasPermission(getUserAuth(), target, "write")).isTrue()
    }

    @Test
    fun `write should deny if app does not have permission on space`() {
        setupMockForReadAndWrite(false)
        assertThat(authInterceptor.hasPermission(getAppAuth(), target, "write")).isFalse()
    }

    @Test
    fun `write should allow if app has permission on space`() {
        setupMockForReadAndWrite(true)
        assertThat(authInterceptor.hasPermission(getAppAuth(), target, "write")).isTrue()
    }

    @Test
    fun `owner should throw SpaceNotExistsException if space not found`() {
        every { spaceRepository.findByUuid(any()) } returns null
        assertThatThrownBy { this.authInterceptor.hasPermission(getUserAuth(), target, "owner") }.isInstanceOf(
            SpaceNotExistsException::class.java
        )
    }

    @Test
    fun `owner should deny if user does not own space`() {
        setupMockForOwner(false)
        assertThat(authInterceptor.hasPermission(getUserAuth(), target, "owner")).isFalse()
    }

    @Test
    fun `owner should allow if user owns space`() {
        setupMockForOwner(true)
        assertThat(authInterceptor.hasPermission(getUserAuth(), target, "owner")).isTrue()
    }

    @Test
    fun `owner should deny if app does not own space`() {
        setupMockForOwner(false)
        assertThat(authInterceptor.hasPermission(getAppAuth(), target, "owner")).isFalse()
    }

    @Test
    fun `owner should allow if app owns space`() {
        setupMockForOwner(true)
        assertThat(authInterceptor.hasPermission(getAppAuth(), target, "owner")).isTrue()
    }

    private fun setupMockForReadAndWrite(shouldFindMapping: Boolean) {
        every { spaceRepository.findByUuid(any()) } returns Space(name = "testSpace")
        if (shouldFindMapping) {
            every { userSpaceMappingRepository.findByUserIdAndSpaceUuid(any(), any()) } returns Optional.of(
                UserSpaceMapping(id = 1, userId = "Principal", permission = "yes", spaceUuid = "TestSpace")
            )
        } else {
            every { userSpaceMappingRepository.findByUserIdAndSpaceUuid(any(), any()) } returns Optional.empty()
        }
    }

    private fun setupMockForOwner(shouldFindMapping: Boolean) {
        every { spaceRepository.findByUuid(any()) } returns Space(name = "testSpace")
        if (shouldFindMapping) {
            every {
                userSpaceMappingRepository.findByUserIdAndSpaceUuidAndPermission(
                    any(),
                    any(),
                    any()
                )
            } returns Optional.of(
                UserSpaceMapping(
                    id = 1,
                    userId = "my-app",
                    permission = "yes",
                    spaceUuid = "testSpace"
                )
            )
        } else {
            every {
                userSpaceMappingRepository.findByUserIdAndSpaceUuidAndPermission(
                    any(),
                    any(),
                    any()
                )
            } returns Optional.empty()
        }
    }

    private fun getUserAuth(): Authentication {
        val auth = TestingAuthenticationToken("Principal", "Credentials")
        auth.isAuthenticated = true
        return auth
    }

    private fun getAppAuth(): Authentication {
        val fakeJwt = createMockJwt(false)
        val auth = TestingAuthenticationToken(null, fakeJwt)
        auth.isAuthenticated = true
        return auth
    }
}
