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

package com.ford.internalprojects.peoplemover.person

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.assignment.CreateAssignmentsRequest
import com.ford.internalprojects.peoplemover.assignment.ProductPlaceholderPair
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class PersonService(
        private val personRepository: PersonRepository,
        private val assignmentService: AssignmentService
) {

    fun createPerson(personIncoming: Person): Person = personRepository.createEntityAndUpdateSpaceLastModified(personIncoming)

    fun updatePerson(person: Person): Person = personRepository.updateEntityAndUpdateSpaceLastModified(person)

    fun getPeopleInSpace(spaceUuid: String): List<Person> = personRepository.findAllBySpaceUuid(spaceUuid)

    fun removePerson(personId: Int, spaceUuid: String) {
        personRepository.deleteEntityAndUpdateSpaceLastModified(personId, spaceUuid)
    }

    fun archivePerson(spaceUuid: String, personId: Int, archiveDate: LocalDate): Boolean {
        val person = personRepository.findByIdAndSpaceUuid(personId, spaceUuid) ?: return false
        if(person.archiveDate == null) {
            if(!assignmentService.isUnassigned(person, archiveDate)) {
                assignmentService.unassignPerson(person, archiveDate)
            }
            person.archiveDate = archiveDate
            updatePerson(person)
        }
        return true
    }

    fun search(request: PersonSearchRequest): List<PersonSearchResponse> {
        return personRepository.findAllByName(request.name!!).map { person -> PersonSearchResponse(person, 100.0f) }
    }
}
