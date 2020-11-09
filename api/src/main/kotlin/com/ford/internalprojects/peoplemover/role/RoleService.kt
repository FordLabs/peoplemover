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

import com.ford.internalprojects.peoplemover.color.Color
import com.ford.internalprojects.peoplemover.color.ColorRepository
import com.ford.internalprojects.peoplemover.color.exceptions.ColorDoesNotExistException
import com.ford.internalprojects.peoplemover.role.exceptions.RoleAlreadyExistsException
import com.ford.internalprojects.peoplemover.role.exceptions.RoleNotExistsException
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import javax.transaction.Transactional

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
        val space: Space = getSpaceFromSpaceUuid(spaceUuid)

        spaceRolesRepository.findBySpaceIdAndNameAllIgnoreCase(
                space.id!!,
                role
        )?.let { throw RoleAlreadyExistsException(role) }
        val colorToAssign: Color? = getColorToAssign(spaceUuid, colorId)
        val spaceRole = SpaceRole(name = role, spaceId = space.id, color = colorToAssign)
        return spaceRolesRepository.saveAndUpdateSpaceLastModified(spaceRole)
    }

    fun getRolesForSpace(spaceUuid: String): Set<SpaceRole> {
        val space: Space = getSpaceFromSpaceUuid(spaceUuid)
        return space.roles
    }

    @Transactional
    fun deleteRole(roleId: Int) {
        val roleFound: SpaceRole = spaceRolesRepository.findByIdOrNull(roleId) ?:
                throw RoleNotExistsException(roleId.toString())

        spaceRolesRepository.deleteAndUpdateSpaceLastModified(roleFound)
    }

    fun editRole(spaceUuid: String, roleEditRequest: RoleEditRequest): SpaceRole {
        val space: Space = getSpaceFromSpaceUuid(spaceUuid)

        throwIfUpdatedRoleNameAlreadyUsed(roleEditRequest, space)
        val roleToUpdate = spaceRolesRepository.findByIdOrNull(roleEditRequest.id) ?:
                throw RoleNotExistsException(roleEditRequest.id.toString())
        roleToUpdate.name = roleEditRequest.name

        roleEditRequest.colorId?.let {
            val colorFound = colorRepository.findByIdOrNull(it) ?:
                    throw ColorDoesNotExistException()
            roleToUpdate.color = colorFound
        }
        return spaceRolesRepository.saveAndUpdateSpaceLastModified(roleToUpdate)
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

    private fun throwIfUpdatedRoleNameAlreadyUsed(roleEditRequest: RoleEditRequest, space: Space) {
        spaceRolesRepository.findBySpaceIdAndNameAllIgnoreCase(
                space.id!!,
                roleEditRequest.name
        )?.let { spaceRole ->
            val updatedRoleNameAlreadyUsedInOtherSpaceRole = spaceRole.id != roleEditRequest.id
            if (updatedRoleNameAlreadyUsedInOtherSpaceRole) {
                throw RoleAlreadyExistsException(roleEditRequest.name)
            }
        }
    }

    private fun getSpaceFromSpaceUuid(spaceUuid: String): Space {
        return spaceRepository.findByUuid(spaceUuid) ?: throw SpaceNotExistsException(spaceUuid)
    }
}