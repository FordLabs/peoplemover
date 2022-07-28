/*
 * Copyright (c) 2022 Ford Motor Company
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

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RequestMapping("/api/spaces/{spaceUuid}/people")
@RestController
class PersonController(
    private val personService: PersonService
) {
    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping
    fun getAllPeopleInSpace(@PathVariable spaceUuid: String): List<Person> {
        return personService.getPeopleInSpace(spaceUuid)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PostMapping
    fun addPersonToSpace(
        @PathVariable spaceUuid: String,
        @Valid @RequestBody personIncoming: PersonRequest
    ): Person {
        return personService.createPerson(personIncoming.toPerson(spaceUuid))
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PostMapping("/{personId}/archive")
    fun archivePerson(
        @PathVariable spaceUuid: String,
        @PathVariable personId: Int,
        @Valid @RequestBody archivePersonRequest: ArchivePersonRequest
    ): ResponseEntity<String> {
        return if(personService.archivePerson(spaceUuid, personId, archivePersonRequest.archiveDate)) {
            ResponseEntity(HttpStatus.OK)
        } else {
            ResponseEntity(HttpStatus.BAD_REQUEST)
        }
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PutMapping("/{personId}")
    fun updatePerson(
        @PathVariable spaceUuid: String,
        @PathVariable personId: Int,
        @Valid @RequestBody personIncoming: PersonRequest
    ): Person {
        return personService.updatePerson(personIncoming.toPerson(spaceUuid, personId))
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @DeleteMapping("/{personId}")
    fun removePerson(
        @PathVariable spaceUuid: String,
        @PathVariable personId: Int
    ) {
        personService.removePerson(personId, spaceUuid);
    }
}
