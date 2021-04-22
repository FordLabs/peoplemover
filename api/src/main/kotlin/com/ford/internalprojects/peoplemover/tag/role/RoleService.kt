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

package com.ford.internalprojects.peoplemover.tag.role

import com.ford.internalprojects.peoplemover.color.Color
import com.ford.internalprojects.peoplemover.color.ColorRepository
import com.ford.internalprojects.peoplemover.color.exceptions.ColorDoesNotExistException
import com.ford.internalprojects.peoplemover.tag.role.exceptions.RoleAlreadyExistsException
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class RoleService(
        private val spaceRepository: SpaceRepository,
        private val spaceRolesRepository: SpaceRolesRepository,
        private val colorRepository: ColorRepository
) {
    fun addRoleToSpace(
            spaceUuid: String,
            role: String,
            colorId: Int?
    ): SpaceRole {
        spaceRolesRepository.findBySpaceUuidAndNameAllIgnoreCase(
                spaceUuid,
                role
        )?.let { throw RoleAlreadyExistsException(role) }
        val colorToAssign: Color? = getColorToAssign(spaceUuid, colorId)
        val spaceRole = SpaceRole(name = role, color = colorToAssign, spaceUuid = spaceUuid)
        return spaceRolesRepository.createEntityAndUpdateSpaceLastModified(spaceRole)
    }

    fun getRolesForSpace(spaceUuid: String): Set<SpaceRole> {
        return spaceRolesRepository.findAllBySpaceUuid(spaceUuid)
    }

    fun deleteRole(roleId: Int, spaceUuid: String) {
        spaceRolesRepository.deleteEntityAndUpdateSpaceLastModified(roleId, spaceUuid)
    }

    fun editRole(spaceUuid: String, roleId:Int, roleEditRequest: RoleRequest): SpaceRole {
        throwIfUpdatedRoleNameAlreadyUsed(roleEditRequest, roleId, spaceUuid)

        val colorFound = if (roleEditRequest.colorId != null) {
            colorRepository.findByIdOrNull(roleEditRequest.colorId) ?: throw ColorDoesNotExistException()
        } else {
            null
        }

        return spaceRolesRepository.updateEntityAndUpdateSpaceLastModified(
                SpaceRole(
                    id = roleId,
                    spaceUuid = spaceUuid,
                    name = roleEditRequest.name,
                        color = colorFound
                )
        )
    }

    private fun getColorToAssign(spaceUuid: String, colorId: Int?): Color? {
        return if (colorId != null) {
            colorRepository.findByIdOrNull(colorId) ?: throw ColorDoesNotExistException()
        } else {
            getAvailableColor(spaceUuid)
        }
    }

    private fun getAvailableColor(spaceUuid: String): Color? {
        val colors: List<Color> = colorRepository.findAll().toList()
        val spaceRoles = getRolesForSpace(spaceUuid)

        val unusedColors: List<Color> = colors.filter { color -> spaceRoles.none {spaceRole -> spaceRole.color == color} }
        unusedColors.takeUnless { it.isEmpty() }?.let {
            return it.first()
        }
        return null
    }

    private fun throwIfUpdatedRoleNameAlreadyUsed(roleEditRequest: RoleRequest, roleId: Int, spaceUuid: String) {
        spaceRolesRepository.findBySpaceUuidAndNameAllIgnoreCase(
                spaceUuid,
                roleEditRequest.name
        )?.let { spaceRole ->
            val updatedRoleNameAlreadyUsedInOtherSpaceRole = spaceRole.id != roleId
            if (updatedRoleNameAlreadyUsedInOtherSpaceRole) {
                throw RoleAlreadyExistsException(roleEditRequest.name)
            }
        }
    }
}
