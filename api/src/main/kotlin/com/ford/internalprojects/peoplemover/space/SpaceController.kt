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

package com.ford.internalprojects.peoplemover.space

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RequestMapping("/api/spaces")
@RestController
class SpaceController(private val spaceService: SpaceService, private val logger: BasicLogger) {
    @GetMapping("")
    fun allSpaces(): ResponseEntity<List<Space>> {
        val spaces: List<Space> = spaceService.findAll()
        logger.logInfoMessage("All space retrieved.")
        return ResponseEntity.ok(spaces)
    }

    @GetMapping("/total")
    fun totalSpaces(): ResponseEntity<Int> {
        val spaces: List<Space> = spaceService.findAll()
        logger.logInfoMessage("All space retrieved.")
        return ResponseEntity.ok(spaces.size)
    }

    @GetMapping("/{uuid}")
    fun getSpace(@PathVariable uuid: String): Space {
        return spaceService.getSpace(uuid)
    }

    @PutMapping ("/{uuid}")
    fun editSpace(@PathVariable uuid: String, @RequestBody spaceRequest: SpaceRequest) {
        return spaceService.editSpace(uuid, spaceRequest)
    }

    @PostMapping("/user")
    fun createUserSpace(
            @RequestBody request: SpaceCreationRequest,
            @RequestHeader(name = "Authorization") token: String
    ): SpaceResponse {
        return spaceService.createSpaceWithUser(token.replace("Bearer ", ""), request.spaceName)
    }

    @GetMapping("/user")
    fun getAllSpacesForUser(@RequestHeader(name = "Authorization") accessToken: String): List<Space> {
        return spaceService.getSpacesForUser(accessToken.replace("Bearer ", ""))
    }
}