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
import com.ford.internalprojects.peoplemover.user.exceptions.InvalidUserModification
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RequestMapping("/api/spaces")
@RestController
class UserController(private val userService: UserService) {

    @PreAuthorize("hasPermission(#uuid, 'modify')")
    @GetMapping("/{uuid}/users")
    fun getAllUsers(@PathVariable uuid: String): List<UserSpaceMapping> {
        return userService.getUsersForSpace(uuid)
    }

    @PreAuthorize("hasPermission(#uuid, 'modify')")
    @DeleteMapping("/{uuid}/users/{userId}")
    fun deleteUserFromSpace(@PathVariable uuid: String, @PathVariable userId: String) {
        userService.deleteUserFromSpace(uuid, userId)
    }

    @PreAuthorize("hasPermission(#uuid, 'owner')")
    @PutMapping("/{uuid}/users/{userId}")
    fun updateUserForSpace(@PathVariable uuid: String, @PathVariable userId: String) {
        userService.modifyUserPermission(uuid, userId)
    }

    @PreAuthorize("hasPermission(#uuid, 'modify')")
    @PostMapping("/{uuid}/users")
    fun inviteUsersToSpace(
            @Valid @RequestBody request: AuthInviteUsersToSpaceRequest,
            @PathVariable uuid: String
    ): ResponseEntity<List<String>> = ResponseEntity.ok(
            userService.addUsersToSpace(request.userIds, uuid))

}
