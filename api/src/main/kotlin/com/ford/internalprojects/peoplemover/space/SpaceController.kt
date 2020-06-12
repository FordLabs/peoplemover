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

@RestController
class SpaceController(private val spaceService: SpaceService, private val logger: BasicLogger) {
    @PostMapping("/api/space")
    fun createSpace(@RequestBody spaceName: String): ResponseEntity<Space> {
        val createdSpace: Space = spaceService.createSpaceWithName(spaceName)
        logger.logInfoMessage("Space Created.  Name: [$spaceName]")
        return ResponseEntity.ok(createdSpace)
    }

    @GetMapping("/api/space")
    fun allSpaces(): ResponseEntity<List<Space>> {
        val spaces: List<Space> = spaceService.findAll()
        logger.logInfoMessage("All space retrieved.")
        return ResponseEntity.ok(spaces)
    }

    @GetMapping("/api/space/total")
    fun totalSpaces(): ResponseEntity<Int> {
        val spaces: List<Space> = spaceService.findAll()
        logger.logInfoMessage("All space retrieved.")
        return ResponseEntity.ok(spaces.size)
    }

    @PostMapping("/api/user/space")
    fun createUserSpace(
            @RequestBody request: SpaceCreationRequest,
            @RequestHeader(name = "Authorization") token: String
    ): SpaceWithAccessTokenResponse {
        return spaceService.createSpaceWithUser(token.replace("Bearer ", ""), request.spaceName)
    }

    @GetMapping("/api/user/space")
    fun getAllSpacesForUser(@RequestHeader(name = "Authorization") accessToken: String): List<Space> {
        return spaceService.getSpacesForUser(accessToken.replace("Bearer ", ""))
    }

    @GetMapping("/api/space/{spaceName}")
    fun getSpace(@PathVariable spaceName: String): Space {
        return spaceService.getSpace(spaceName)
    }
}