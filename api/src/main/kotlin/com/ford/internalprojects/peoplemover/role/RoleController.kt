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

package com.ford.internalprojects.peoplemover.role

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/spaces/{spaceUuid}/roles")
class RoleController(
    private val roleService: RoleService,
    private val logger: BasicLogger
) {
    @GetMapping
    fun getRolesForSpace(@PathVariable spaceUuid: String): ResponseEntity<Set<SpaceRole>> {
        val rolesForSpace = roleService.getRolesForSpace(spaceUuid)
        logger.logInfoMessage("All role retrieved for space: [$spaceUuid].")
        return ResponseEntity.ok(rolesForSpace)
    }

    @PostMapping
    fun addRoleForSpace(
        @PathVariable spaceUuid: String,
        @RequestBody request: RoleAddRequest
    ): ResponseEntity<SpaceRole> {
        val spaceRole: SpaceRole = roleService.addRoleToSpace(
            spaceUuid,
            request.name,
            request.colorId
        )
        logger.logInfoMessage("Role [${request.name}] created for space: [$spaceUuid].")
        return ResponseEntity.ok(spaceRole)
    }

    @DeleteMapping("/{roleId}")
    fun deleteRole(
        @PathVariable spaceUuid: String,
        @PathVariable roleId: Int
    ): ResponseEntity<Unit> {
        roleService.deleteRole(roleId)
        logger.logInfoMessage("Role id [$roleId] deleted.")
        return ResponseEntity.ok().build()
    }

    @PutMapping
    fun editRole(
        @PathVariable spaceUuid: String,
        @RequestBody roleEditRequest: RoleEditRequest
    ): ResponseEntity<SpaceRole> {
        val updatedRole: SpaceRole = roleService.editRole(spaceUuid, roleEditRequest)
        logger.logInfoMessage("Role with id [${roleEditRequest.id}] edited to: " +
                        "[${roleEditRequest.name}] in space [$spaceUuid].")
        return ResponseEntity.ok(updatedRole)
    }
}