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

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RequestMapping("/api/spaces/{spaceUuid}/people")
@RestController
class PersonController(
        private val logger: BasicLogger,
        private val personService: PersonService
) {

    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping
    fun getAllPeopleInSpace(@PathVariable spaceUuid: String): List<Person> {
        logger.logInfoMessage("All people retrieved for space: [$spaceUuid].")
        return personService.getPeopleInSpace(spaceUuid)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PostMapping
    fun addPersonToSpace(
            @PathVariable spaceUuid: String,
            @Valid @RequestBody personIncoming: PersonRequest
    ): Person {
        val personCreated = personService.createPerson(personIncoming.toPerson(spaceUuid))
        logger.logInfoMessage("Person with id [${personCreated.id}] created for space: [$spaceUuid].")
        return personCreated
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PutMapping("/{personId}")
    fun updatePerson(
            @PathVariable spaceUuid: String,
            @PathVariable personId: Int,
            @Valid @RequestBody personIncoming: PersonRequest
    ): Person {

        val updatedPerson = personService.updatePerson(personIncoming.toPerson(spaceUuid, personId))
        logger.logInfoMessage("Person with id [${updatedPerson.id}] updated.")
        return updatedPerson
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @DeleteMapping("/{personId}")
    fun removePerson(
            @PathVariable spaceUuid: String,
            @PathVariable personId: Int
    ) {
        personService.removePerson(personId, spaceUuid)
        logger.logInfoMessage("Person with id [$personId] deleted.")
    }

}
