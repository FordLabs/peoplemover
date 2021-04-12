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

import com.ford.internalprojects.peoplemover.utilities.ListPattern
import javax.validation.constraints.NotEmpty

data class AuthInviteUsersToSpaceRequest(
        @field:NotEmpty(message = "user ids cannot be empty")
        @field:ListPattern(value = "^[a-zA-Z][a-zA-Z0-9]{1,8}$", message = "must be valid cdsid")
        val userIds: List<String>
)
