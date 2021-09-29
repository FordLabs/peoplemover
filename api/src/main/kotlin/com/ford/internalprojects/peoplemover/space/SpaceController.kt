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

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RequestMapping("/api/spaces")
@RestController
class SpaceController(
        private val logger: BasicLogger,
        private val spaceService: SpaceService
) {

    @PreAuthorize("hasPermission(#uuid, 'read')")
    @GetMapping("/{uuid}")
    fun getSpace(@PathVariable uuid: String): Space {
        return spaceService.getSpace(uuid)
    }

    @PreAuthorize("hasPermission(#uuid, 'write')")
    @PutMapping("/{uuid}")
    fun editSpace(@PathVariable uuid: String, @Valid @RequestBody editSpaceRequest: EditSpaceRequest): Space {
        return spaceService.editSpace(uuid, editSpaceRequest)
    }

    @PostMapping("/user")
    fun createSpace(
            @Valid @RequestBody request: SpaceCreationRequest,
            @RequestHeader(name = "Authorization") token: String
    ): SpaceResponse {
        return spaceService.createSpaceWithUser(token.replace("Bearer ", ""), request.spaceName)
    }

    @GetMapping("/user")
    fun getAllSpacesForUser(@RequestHeader(name = "Authorization") accessToken: String): List<Space> {
        return spaceService.getSpacesForUser()
    }
}

