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

package com.ford.internalprojects.peoplemover.user

import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.dao.DataIntegrityViolationException

@ExtendWith(MockKExtension::class)
internal class UserServiceTest {
    private lateinit var userService: UserService

    @MockK
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @BeforeEach
    fun setUp() {
        userService = UserService(BasicLogger(), userSpaceMappingRepository)
    }

    @Test
    fun `Invite Users Request should return Ok and an empty list with a valid emails in request`() {
        val emails = listOf("userid1", "userid2", "userid3")

        every { userSpaceMappingRepository.save(ofType(UserSpaceMapping::class)) } returns UserSpaceMapping(
            spaceUuid = "",
            permission = "",
            userId = ""
        ) andThenThrows DataIntegrityViolationException("") andThenThrows RuntimeException()

        val exceptionEmails = userService.addUsersToSpace(emails, "")
        Assertions.assertThat(exceptionEmails).containsExactly("userid3")
        verify(exactly = 3) { userSpaceMappingRepository.save(ofType(UserSpaceMapping::class)) }
    }
}
