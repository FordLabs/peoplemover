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

import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.assignment.AssignmentV1
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.auth.getUsernameOrAppName
import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityAlreadyExistsException
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonService
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.product.ProductRequest
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceIsReadOnlyException
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNameInvalidException
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import com.ford.internalprojects.peoplemover.tag.TagRequest
import com.ford.internalprojects.peoplemover.tag.person.PersonTagRepository
import com.ford.internalprojects.peoplemover.tag.person.PersonTagService
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import com.ford.internalprojects.peoplemover.tag.product.ProductTagRepository
import com.ford.internalprojects.peoplemover.tag.product.ProductTagService
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*
import javax.transaction.Transactional

@Service
class SpaceService(
        private val spaceRepository: SpaceRepository,
        private val productService: ProductService,
        private val productRepository: ProductRepository,
        private val userSpaceMappingRepository: UserSpaceMappingRepository,
        private val personTagService: PersonTagService,
        private val personTagRepository: PersonTagRepository,
        private val productTagService: ProductTagService,
        private val productTagRepository: ProductTagRepository,
        private val assignmentService: AssignmentService,
        private val assignmentRepository: AssignmentRepository,
        private val personService: PersonService,
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

    @Transactional
    fun duplicateSpace(spaceUuid: String): SpaceResponse? {
        val originalSpace = getSpace(spaceUuid)
        val newSpaceName = originalSpace.name + " - Duplicate"

        checkIfSpaceWithNameExists(newSpaceName)

        val newSpace = spaceRepository.save(
                Space(
                        name = newSpaceName,
                        createdBy = originalSpace.createdBy,
                        createdDate = originalSpace.createdDate,
                        lastModifiedDate = originalSpace.lastModifiedDate,
                        customFieldLabels = originalSpace.customFieldLabels,
                        todayViewIsPublic = originalSpace.todayViewIsPublic
                )
        )

        duplicatePersonTags(originalSpace.uuid, newSpace.uuid)

        duplicateUserSpaceMappings(originalSpace.uuid, newSpace.uuid)

        duplicatePeople(originalSpace.uuid, newSpace.uuid)

        duplicateProductTags(originalSpace, newSpace)

        duplicateProducts(originalSpace.uuid, newSpace.uuid)

        duplicateAssignments(originalSpace, newSpace)

        return SpaceResponse(newSpace)
    }

    private fun checkIfSpaceWithNameExists(newSpaceName: String) {
        val newSpaceNameExists = spaceRepository.existsByName(newSpaceName);
        if (newSpaceNameExists) {
            throw EntityAlreadyExistsException()
        }
    }

    private fun duplicateAssignments(originalSpace: Space, newSpace: Space) {
        val originalAssignments = assignmentService.getAssignmentsForSpace(originalSpace.uuid)
        val peopleInNewSpace = personService.getPeopleInSpace(newSpace.uuid)
        originalAssignments.forEach { assignment ->
            duplicateAssignment(assignment, newSpace, peopleInNewSpace)
        }
    }

    private fun duplicateAssignment(assignment: AssignmentV1, newSpace: Space, peopleInNewSpace: List<Person>) {
        val productInOldSpace = productRepository.findById(assignment.productId)
        val productInNewSpace = productRepository.findProductByNameAndSpaceUuid(productInOldSpace.get().name, newSpace.uuid)

        if (productInNewSpace != null) {
            val personOnAssignment = getPersonOnAssignment(peopleInNewSpace, assignment)
            val newSpaceAssignment = AssignmentV1(
                    productId = productInNewSpace.id!!,
                    placeholder = assignment.placeholder,
                    effectiveDate = assignment.effectiveDate,
                    spaceUuid = newSpace.uuid,
                    startDate = assignment.startDate,
                    person = personOnAssignment!!
            )
            assignmentRepository.save(newSpaceAssignment)
        }
    }


    private fun getPersonOnAssignment(peopleInNewSpace: List<Person>, assignment: AssignmentV1): Person? {
        val peopleInNewSpaceFiltered = peopleInNewSpace.filter { personInNewSpace ->
            val personOnAssignment = assignment.person
            personInNewSpace.name == personOnAssignment.name &&
                    personInNewSpace.newPersonDate == personOnAssignment.newPersonDate &&
                    personInNewSpace.notes == personOnAssignment.notes
        }
        if (peopleInNewSpaceFiltered.isNotEmpty()) {
            return peopleInNewSpaceFiltered[0]
        }
        return null
    }

    private fun duplicatePersonTags(originalSpaceUuid: String, newSpaceUuid: String) {
        val tagsFromSpace = personTagService.getAllPersonTags(originalSpaceUuid)
        tagsFromSpace.forEach {
            personTagService.createPersonTagForSpace(TagRequest(it.name), newSpaceUuid)
        }
    }

    private fun duplicateUserSpaceMappings(originalSpaceUuid: String, newSpaceUuid: String) {
        val userSpaceMappingsInSpace = userSpaceMappingRepository.findAllBySpaceUuid(originalSpaceUuid)
        userSpaceMappingsInSpace.forEach {
            val newSpaceUserSpaceMapping = UserSpaceMapping(
                    userId = it.userId,
                    spaceUuid = newSpaceUuid,
                    permission = it.permission

            )
            userSpaceMappingRepository.save(newSpaceUserSpaceMapping)
        }
    }

    private fun duplicatePeople(originalSpaceUuid: String, newSpaceUuid: String) {
        val peopleInSpace = personService.getPeopleInSpace(originalSpaceUuid)
        peopleInSpace.forEach { person ->
            val newPersonTags = person.tags.mapNotNull {
                personTagRepository.findAllBySpaceUuidAndNameIgnoreCase(newSpaceUuid, it.name)
            }
            val newSpacePerson = Person(
                    name = person.name,
                    spaceRole = person.spaceRole,
                    tags = newPersonTags.toSet(),
                    spaceUuid = newSpaceUuid,
                    notes = person.notes,
                    archiveDate = person.archiveDate,
                    newPerson = person.newPerson,
                    newPersonDate = person.newPersonDate
            )
            personService.createPerson(newSpacePerson)
        }
    }

    private fun duplicateProducts(originalSpaceUuid: String, newSpaceUuid: String) {
        val products = productService.findAllBySpaceUuid(originalSpaceUuid)
        products.forEach { product ->
            val newProductTags: List<ProductTag> = product.tags.mapNotNull {
                productTagRepository.findAllBySpaceUuidAndNameIgnoreCase(newSpaceUuid, it.name)
            }
            val newSpaceProduct = ProductRequest(
                    name = product.name,
                    tags = newProductTags.toSet(),
                    startDate = product.startDate,
                    endDate = product.endDate,
                    dorf = product.dorf,
                    spaceLocation = product.spaceLocation,
                    archived = product.archived,
                    notes = product.notes,
                    url = product.url
            )
            productService.create(newSpaceProduct, newSpaceUuid)
        }
    }

    private fun duplicateProductTags(originalSpace: Space, newSpace: Space) {
        val productTags = productTagService.getAllProductTags(originalSpace.uuid)
        productTags.forEach {
            productTagService.createProductTagForSpace(TagRequest(
                    name = it.name
            ), newSpace.uuid)
        }
    }
}
