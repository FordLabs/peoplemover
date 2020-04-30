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

package com.ford.internalprojects.peoplemover.role

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/role")
class RoleController(private val roleService: RoleService,
                     private val logger: BasicLogger) {

    @GetMapping("/{spaceName}")
    fun getRolesForSpace(@PathVariable spaceName: String): ResponseEntity<Set<SpaceRole>> {
        val rolesForSpace = roleService.getRolesForSpace(spaceName)
        logger.logInfoMessage("All role retrieved for space: [$spaceName].")
        return ResponseEntity.ok(rolesForSpace)
    }

    @PostMapping("/{spaceName}")
    fun addRoleForSpace(
            @PathVariable spaceName: String,
            @RequestBody request: RoleAddRequest
    ): ResponseEntity<SpaceRole> {
        val spaceRole: SpaceRole = roleService.addRoleToSpace(
                spaceName,
                request.name,
                request.colorId
        )
        logger.logInfoMessage("Role [${request.name}] created for space: [$spaceName].")
        return ResponseEntity.ok(spaceRole)
    }

    @DeleteMapping("/{roleId}")
    fun deleteRole(@PathVariable roleId: Int): ResponseEntity<Unit> {
        roleService.deleteRole(roleId)
        logger.logInfoMessage("Role id [$roleId] deleted.")
        return ResponseEntity.ok().build()
    }

    @PutMapping("/{spaceName}")
    fun editRole(
            @PathVariable spaceName: String,
            @RequestBody roleEditRequest: RoleEditRequest
    ): ResponseEntity<SpaceRole> {
        val updatedRole: SpaceRole = roleService.editRole(spaceName, roleEditRequest)
        logger.logInfoMessage("Role with id [${roleEditRequest.id}] edited to: " +
                        "[${roleEditRequest.updatedName}] in space [$spaceName].")
        return ResponseEntity.ok(updatedRole)
    }

}