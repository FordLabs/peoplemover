/*
 * Copyright (c) 2022 Ford Motor Company
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

package com.ford.internalprojects.peoplemover.tag.role

import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RestController
@RequestMapping("/api/spaces/{spaceUuid}/roles")
class RoleController(
    private val roleService: RoleService,
) {
    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping
    fun getRolesForSpace(@PathVariable spaceUuid: String): ResponseEntity<Set<SpaceRole>> {
        val rolesForSpace = roleService.getRolesForSpace(spaceUuid)
        return ResponseEntity.ok(rolesForSpace)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PostMapping
    fun addRoleForSpace(
        @PathVariable spaceUuid: String,
        @Valid @RequestBody request: RoleRequest
    ): ResponseEntity<SpaceRole> {
        val spaceRole: SpaceRole = roleService.addRoleToSpace(
            spaceUuid,
            request.name,
            request.colorId
        )
        return ResponseEntity.ok(spaceRole)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @DeleteMapping("/{roleId}")
    fun deleteRole(
        @PathVariable spaceUuid: String,
        @PathVariable roleId: Int
    ): ResponseEntity<Unit> {
        roleService.deleteRole(roleId, spaceUuid)
        return ResponseEntity.ok().build()
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PutMapping("/{roleId}")
    fun editRole(
        @PathVariable spaceUuid: String,
        @PathVariable roleId: Int,
        @Valid @RequestBody roleEditRequest: RoleRequest
    ): ResponseEntity<SpaceRole> {
        val updatedRole: SpaceRole = roleService.editRole(spaceUuid, roleId, roleEditRequest)
        return ResponseEntity.ok(updatedRole)
    }
}
