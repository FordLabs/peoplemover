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

package com.ford.internalprojects.peoplemover.person

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.security.access.annotation.Secured
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RequestMapping("/api/spaces/{spaceUuid}/people")
@RestController
class PersonController(
    private val spaceRepository: SpaceRepository,
    private val logger: BasicLogger,
    private val personService: PersonService,
    private val assignmentService: AssignmentService
) {
    @GetMapping
    fun getAllPeopleInSpace(@PathVariable spaceUuid: String): ResponseEntity<List<Person>> {
        val space: Space = spaceRepository.findByUuid(spaceUuid)
                ?: throw SpaceNotExistsException(spaceUuid)
        logger.logInfoMessage("All people retrieved for space: [$spaceUuid].")
        return ResponseEntity.ok(personService.getPeopleInSpace(space))
    }

    @PostMapping
    fun addPersonToSpace(
        @PathVariable spaceUuid: String,
        @RequestBody personIncoming: Person
    ): ResponseEntity<Person> {
        val personCreated = personService.createPerson(personIncoming, spaceUuid)
        logger.logInfoMessage("Person with id [${personCreated.id}] created for space: [$spaceUuid].")
        return ResponseEntity.ok(personCreated)
    }

    @PutMapping("/{personId}")
    fun updatePerson(
        @PathVariable spaceUuid: String,
        @PathVariable personId: Int,
        @RequestBody personIncoming: Person
    ): ResponseEntity<Person> {
        val updatedPerson = personService.updatePerson(personIncoming)
        logger.logInfoMessage("Person with id [${updatedPerson.id}] updated.")
        return ResponseEntity.ok(updatedPerson)
    }

    @DeleteMapping("/{personId}")
    fun removePerson(
        @PathVariable spaceUuid: String,
        @PathVariable personId: Int
    ): ResponseEntity<Unit> {
        // I DONT THINK THIS NEEDS TO BE HERE
        assignmentService.deleteAllAssignments(personId)
        personService.removePerson(personId)
        logger.logInfoMessage("Person with id [$personId] deleted.")
        return ResponseEntity.ok().build()
    }

    @GetMapping("/total")
    fun totalPersons(): ResponseEntity<Long> {
        val count = personService.countOfPeople()
        return ResponseEntity.ok(count)
    }
}