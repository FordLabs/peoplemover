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

import com.ford.internalprojects.peoplemover.auth.AuthService
import com.ford.internalprojects.peoplemover.auth.ValidateTokenRequest
import com.ford.internalprojects.peoplemover.user.exceptions.InvalidTokenException
import org.springframework.stereotype.Service

@Service
class UserService(private val userRepository: UserRepository,
                  private val authService: AuthService) {

    fun createUser(user: User, accessToken: String): User {
        val validateTokenRequest = ValidateTokenRequest(accessToken)
        if (authService.validateAccessToken(validateTokenRequest).statusCodeValue != 200) {
            throw InvalidTokenException()
        }
        return userRepository.save(User(uuid = user.uuid))
    }

}