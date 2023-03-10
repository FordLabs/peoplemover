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
import com.ford.internalprojects.peoplemover.auth.getUsernameOrAppName
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonService
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceIsReadOnlyException
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNameInvalidException
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import com.ford.internalprojects.peoplemover.tag.TagRequest
import com.ford.internalprojects.peoplemover.tag.person.PersonTagService
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class SpaceService(
        private val spaceRepository: SpaceRepository,
        private val productService: ProductService,
        private val userSpaceMappingRepository: UserSpaceMappingRepository,
        private val personTagService: PersonTagService,
        private val personService: PersonService
) {

    fun createSpaceWithName(spaceName: String, createdBy: String): Space {
        if (spaceName.trim().isEmpty()) {
            throw SpaceNotExistsException(spaceName)
        } else {
            val savedSpace = spaceRepository.save(
                    Space(
                            name = spaceName.trim(),
                            lastModifiedDate = Timestamp(Date().time),
                            createdBy = createdBy,
                            createdDate = LocalDateTime.now()
                    )
            )
            productService.createDefaultProducts(savedSpace)
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
                            userId = userId.uppercase().trim(),
                            spaceUuid = createdSpace.uuid,
                            permission = PERMISSION_OWNER
                    )
            )
            return SpaceResponse(createdSpace)
        }
    }

    fun getSpacesForUser(): List<Space> {
        val principal: String = getUsernameOrAppName(SecurityContextHolder.getContext().authentication) ?: return emptyList()
        val spaceUuids: List<String> =
                userSpaceMappingRepository.findAllByUserId(principal).map { mapping -> mapping.spaceUuid }.toList()
        return spaceRepository.findAllByUuidIn(spaceUuids)
    }

    fun getSpace(uuid: String): Space {
        return spaceRepository.findByUuid(uuid) ?: throw SpaceNotExistsException()
    }

    fun deleteSpace(uuid: String) : Boolean {
        if(spaceRepository.findByUuid(uuid) != null){
            spaceRepository.deleteByUuid(uuid)
            return true
        }
        return false
    }

    fun editSpace(uuid: String, editSpaceRequest: EditSpaceRequest): Space {
        val spaceToEdit = spaceRepository.findByUuid(uuid) ?: throw SpaceNotExistsException()

        if (editSpaceRequest.name != null && editSpaceRequest.name.trim().isEmpty()) {
            throw SpaceNameInvalidException()
        }
        if (editSpaceRequest.isInValid()) {
            return spaceToEdit
        }

        return spaceRepository.save(spaceToEdit.update(editSpaceRequest))
    }

    fun checkReadOnlyAccessByDate(requestedDate: String?, spaceUuid: String) {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_DATE)
        val tomorrow = LocalDate.now().plusDays(1L).format(DateTimeFormatter.ISO_DATE)
        val yesterday = LocalDate.now().minusDays(1L).format(DateTimeFormatter.ISO_DATE)
        val isDateValid = requestedDate == today || requestedDate == tomorrow || requestedDate == yesterday

        if (!userHasEditAccessToSpace(spaceUuid) && !isDateValid) {
            throw SpaceIsReadOnlyException()
        }
    }

    private fun userHasEditAccessToSpace(spaceUuid: String): Boolean {
        val spacesForUser = getSpacesForUser().map { it.uuid }
        return spacesForUser.contains(spaceUuid)
    }

    fun duplicateSpace(spaceUuid: String): SpaceResponse? {
        val space = getSpace(spaceUuid)
        val newSpaceName = space.name + " - Duplicate"
        val userId: String = SecurityContextHolder.getContext().authentication.name
        // create new space
        val newSpace = createSpaceWithName(newSpaceName, userId)

        // duplicate tags
        val tagsFromSpace = personTagService.getAllPersonTags(space.uuid)
        tagsFromSpace.forEach {
            personTagService.createPersonTagForSpace(TagRequest(it.name), newSpace.uuid)
        }

        // duplicate userSpaceMappings
        val userSpaceMappingsInSpace = userSpaceMappingRepository.findAllBySpaceUuid(space.uuid)
        userSpaceMappingsInSpace.forEach {
            userSpaceMappingRepository.save(UserSpaceMapping(
                    userId = it.userId,
                    spaceUuid = newSpace.uuid,
                    permission = it.permission

            ))
        }

        // duplicate persons
        val peopleInSpace = personService.getPeopleInSpace(space.uuid)
        peopleInSpace.forEach {
            personService.createPerson(Person(
                    name = it.name,
                    spaceRole = it.spaceRole,
                    tags = HashSet(it.tags),
                    spaceUuid = newSpace.uuid,
                    notes = it.notes,
                    archiveDate = it.archiveDate,
                    newPerson = it.newPerson,
                    newPersonDate = it.newPersonDate
            ))
        }
        return SpaceResponse(newSpace)
    }
}
