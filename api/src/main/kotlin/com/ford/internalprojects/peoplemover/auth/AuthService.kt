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

import com.ford.internalprojects.peoplemover.auth.exceptions.InvalidTokenException
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.stereotype.Service

@Service
class AuthService (
        @Value("\${com.ford.people-mover.secured-report.users}") val users: String = "none",
        private val jwtDecoder: JwtDecoder
){
    fun validateToken(accessToken: String): OAuthVerifyResponse {
        return try {
            val jwt = jwtDecoder.decode(accessToken)
            OAuthVerifyResponse(jwt.subject, emptyList(), jwt.expiresAt!!.toEpochMilli(), jwt.issuer.toString(), jwt.subject)
        } catch (e: Exception) {
            throw InvalidTokenException()
        }
    }

    fun requestIsAuthorizedFromReportProperties(authentication: Authentication): Boolean {
        val authorizedUsers = users.lowercase().split(",")
        return authorizedUsers.contains(authentication.name.lowercase())
    }
}

fun getUsernameOrAppName(auth: Authentication): String? {
    return try {
        if ((auth.name != null) && auth.name.isNotEmpty()) auth.name
        else (auth.credentials as Jwt).claims["appid"]?.toString()
    } catch(e: Exception) {
        null
    }
}
