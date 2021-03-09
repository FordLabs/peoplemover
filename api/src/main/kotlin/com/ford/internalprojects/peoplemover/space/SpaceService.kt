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

import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityNotExistsException
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.user.exceptions.CannotDeleteOwnerException
import com.ford.internalprojects.peoplemover.user.exceptions.InvalidUserModification
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.util.*

@Service
class SpaceService(
    private val spaceRepository: SpaceRepository,
    private val productService: ProductService,
    private val userSpaceMappingRepository: UserSpaceMappingRepository
) {

    fun createSpaceWithName(spaceName: String, createdBy: String): Space {
        if (spaceName.isEmpty()) {
            throw SpaceNotExistsException(spaceName)
        } else {
            val savedSpace = spaceRepository.save(
                Space(name = spaceName, lastModifiedDate = Timestamp(Date().time), createdBy = createdBy)
            )
            productService.createDefaultProducts(savedSpace);
            return savedSpace
        }
    }

    fun findAll(): List<Space> {
        return spaceRepository.findAll().toList()
    }

    fun createSpaceWithUser(accessToken: String, spaceName: String): SpaceResponse {
        val userId: String = SecurityContextHolder.getContext().authentication.name
        createSpaceWithName(spaceName, userId).let { createdSpace ->
            userSpaceMappingRepository.save(
                UserSpaceMapping(
                    userId = userId,
                    spaceUuid = createdSpace.uuid,
                    permission = PERMISSION_OWNER
                )
            )
            return SpaceResponse(createdSpace)
        }
    }

    fun getSpacesForUser(accessToken: String): List<Space> {
        val principal: String = SecurityContextHolder.getContext().authentication.name
        val spaceUuids: List<String> =
            userSpaceMappingRepository.findAllByUserId(principal).map { mapping -> mapping.spaceUuid }.toList()
        return spaceRepository.findAllByUuidIn(spaceUuids)
    }

    fun getSpace(uuid: String): Space {
        return spaceRepository.findByUuid(uuid) ?: throw SpaceNotExistsException()
    }

    fun deleteSpace(uuid: String) {
        spaceRepository.deleteByUuid(uuid)
    }

    fun editSpace(uuid: String, editSpaceRequest: EditSpaceRequest): Space {
        val spaceToEdit = spaceRepository.findByUuid(uuid) ?: throw SpaceNotExistsException()

        if (editSpaceRequest.isInValid()) {
            return spaceToEdit
        }

        return spaceRepository.save(spaceToEdit.update(editSpaceRequest))
    }

    fun userHasEditAccessToSpace(spaceUuid: String): Boolean {
        val spacesForUser = getSpacesForUser(SecurityContextHolder.getContext().authentication.name).map { it.uuid }
        return spacesForUser.contains(spaceUuid)
    }

}
