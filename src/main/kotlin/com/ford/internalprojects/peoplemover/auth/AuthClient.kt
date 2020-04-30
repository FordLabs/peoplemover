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

import com.ford.labs.authquest.oauth.OAuthAccessTokenResponse
import com.ford.labs.authquest.oauth.OAuthRefreshTokenResponse
import com.ford.labs.authquest.oauth.OAuthVerifyResponse
import java.util.*

interface AuthClient {
    fun createAccessToken(accessCode: String): Optional<OAuthAccessTokenResponse>
    fun validateAccessToken(accessToken: String): Optional<OAuthVerifyResponse>
    fun refreshAccessToken(accessToken: String): Optional<OAuthRefreshTokenResponse>
    fun inviteUsersToScope(emails: List<String>, spaceName: String)
    fun createScope(spaces: List<String>)
    fun updateUserScopes(userUUID: String, spaces: List<String>)
}
