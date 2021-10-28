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

package com.ford.internalprojects.peoplemover.tag.person

import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityAlreadyExistsException
import com.ford.internalprojects.peoplemover.tag.TagRequest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service

@Service
class PersonTagService(
        private val personTagRepository: PersonTagRepository
) {
    fun createPersonTagForSpace(request: TagRequest, spaceUuid: String): PersonTag {
        val personTagToCreate = PersonTag(name = request.name.trim(), spaceUuid = spaceUuid)
        return try {
            personTagRepository.findAllBySpaceUuidAndNameIgnoreCase(spaceUuid, personTagToCreate.name)?.let { throw EntityAlreadyExistsException() }
            personTagRepository.createEntityAndUpdateSpaceLastModified(personTagToCreate)
        } catch (e: DataIntegrityViolationException) {
            throw EntityAlreadyExistsException()
        }
    }

    fun getAllPersonTags(spaceUuid: String): List<PersonTag> =
         personTagRepository.findAllBySpaceUuid(
                spaceUuid,
                Sort.by(Sort.Order.asc("name").ignoreCase())
        )


    fun deletePersonTag(personTagId: Int, spaceUuid: String) {
        personTagRepository.deleteEntityAndUpdateSpaceLastModified(personTagId, spaceUuid)
    }

    fun editPersonTag(
            spaceUuid: String,
            personTagId: Int,
            tagEditRequest: TagRequest
    ): PersonTag {
        val personTagToEdit = PersonTag(id = personTagId, name = tagEditRequest.name.trim(), spaceUuid = spaceUuid)
        return try {
            personTagRepository.findAllBySpaceUuidAndNameIgnoreCase(spaceUuid, personTagToEdit.name)?.let { throw EntityAlreadyExistsException() }
            personTagRepository.updateEntityAndUpdateSpaceLastModified(personTagToEdit)
        } catch (e: DataIntegrityViolationException) {
            throw EntityAlreadyExistsException()
        }
    }

    fun duplicate(originalSpaceUuid: String, destinationSpaceUuid: String) {
        val originalPersonTags = getAllPersonTags(originalSpaceUuid)
        originalPersonTags.map {personTag -> createPersonTagForSpace(TagRequest(personTag.name), destinationSpaceUuid)}
    }
}
