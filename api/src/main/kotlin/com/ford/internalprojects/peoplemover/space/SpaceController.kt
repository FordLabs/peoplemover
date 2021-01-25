/*
 * Copyright (c) 2020 Ford Motor Company
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

import com.ford.internalprojects.peoplemover.auth.AuthInviteUsersToSpaceRequest
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RequestMapping("/api/spaces")
@RestController
class SpaceController(
        private val logger: BasicLogger,
        private val userSpaceMappingRepository: UserSpaceMappingRepository,
        private val spaceService: SpaceService,
        private val spaceRepository: SpaceRepository
) {
    @GetMapping("")
    fun allSpaces(): List<Space> {
        val spaces: List<Space> = spaceService.findAll()
        logger.logInfoMessage("All space retrieved.")
        return spaces
    }

    @GetMapping("/total")
    fun totalSpaces(): ResponseEntity<Int> {
        val spaces: List<Space> = spaceService.findAll()
        logger.logInfoMessage("All space retrieved.")
        return ResponseEntity.ok(spaces.size)
    }

    @PreAuthorize("hasPermission(#uuid, 'read')")
    @GetMapping("/{uuid}")
    fun getSpace(@PathVariable uuid: String): Space {
        return spaceService.getSpace(uuid)
    }

    @PreAuthorize("hasPermission(#uuid, 'write')")
    @PutMapping("/{uuid}")
    fun editSpace(@PathVariable uuid: String, @RequestBody editSpaceRequest: EditSpaceRequest):Space {
        return spaceService.editSpace(uuid, editSpaceRequest)
    }

    @PostMapping("/user")
    fun createSpace(
            @RequestBody request: SpaceCreationRequest,
            @RequestHeader(name = "Authorization") token: String
    ): SpaceResponse {
        return spaceService.createSpaceWithUser(token.replace("Bearer ", ""), request.spaceName)
    }

    @GetMapping("/user")
    fun getAllSpacesForUser(@RequestHeader(name = "Authorization") accessToken: String): List<Space> {
        return spaceService.getSpacesForUser(accessToken.replace("Bearer ", ""))
    }


    @PreAuthorize("hasPermission(#uuid, 'modify')")
    @PutMapping("/{uuid}:invite")
    fun inviteUsersToSpace(
            @Valid @RequestBody request: AuthInviteUsersToSpaceRequest,
            @PathVariable uuid: String
    ): ResponseEntity<ArrayList<String>> {
        val space = spaceRepository.findByUuid(uuid)!!

        val failures = arrayListOf<String>()
        request.emails.forEach { email ->
            val userId = email.substringBefore('@').toUpperCase().trim()
            try {
                userSpaceMappingRepository.save(UserSpaceMapping(userId = userId, spaceUuid = uuid))
            } catch (e: DataIntegrityViolationException) {
                logger.logInfoMessage("$userId already has access to this space.")
            } catch (e: Exception) {
                failures.add(email)
                logger.logException(e)
            }
        }
        return ResponseEntity.ok(failures)
    }
}
