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

package com.ford.internalprojects.peoplemover.person

import com.ford.internalprojects.peoplemover.person.exceptions.PersonNotExistsException
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class PersonService(
        private val personRepository: PersonRepository,
        private val spaceRepository: SpaceRepository
) {

    fun createPerson(personIncoming: Person, spaceName: String): Person {
        val space = spaceRepository.findByNameIgnoreCase(spaceName) ?: throw SpaceNotExistsException(spaceName)

        val personToCreate = Person(
                name = personIncoming.name,
                spaceRole = personIncoming.spaceRole,
                notes = personIncoming.notes,
                newPerson = personIncoming.newPerson,
                spaceId = space.id!!
        )
        return personRepository.saveAndUpdateSpaceLastModified(personToCreate)
    }

    fun updatePerson(person: Person): Person {
        return personRepository.saveAndUpdateSpaceLastModified(person)
    }

    fun getPeopleInSpace(space: Space): List<Person> = personRepository.findAllBySpaceId(space.id!!)

    fun removePerson(personId: Int) {
        val personToRemove = personRepository.findByIdOrNull(personId) ?: throw PersonNotExistsException()
        personRepository.deleteAndUpdateSpaceLastModified(personToRemove)
    }

    fun countOfPeople(): Long {
        return personRepository.count()
    }
}