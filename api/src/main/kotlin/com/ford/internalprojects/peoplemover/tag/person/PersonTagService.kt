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
        return try {
            personTagRepository.findAllBySpaceUuidAndNameIgnoreCase(spaceUuid, request.name)?.let { throw EntityAlreadyExistsException() }
            personTagRepository.createEntityAndUpdateSpaceLastModified(PersonTag(name = request.name, spaceUuid = spaceUuid))
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
        return try {
            personTagRepository.findAllBySpaceUuidAndNameIgnoreCase(spaceUuid, tagEditRequest.name)?.let { throw EntityAlreadyExistsException() }
            personTagRepository.updateEntityAndUpdateSpaceLastModified(PersonTag(personTagId, spaceUuid, tagEditRequest.name))
        } catch (e: DataIntegrityViolationException) {
            throw EntityAlreadyExistsException()
        }
    }
}
