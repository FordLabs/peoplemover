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

import com.ford.internalprojects.peoplemover.tag.TagRequest
import com.ford.internalprojects.peoplemover.tag.person.PersonTag
import com.ford.internalprojects.peoplemover.tag.person.PersonTagService
import com.ford.internalprojects.peoplemover.tag.role.RoleService
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RequestMapping("/api/spaces/{spaceUuid}/people/import")
@RestController
class PersonImportController(
        private val logger: BasicLogger,
        private val personService: PersonService,
        private val roleService: RoleService,
        private val personTagService: PersonTagService
) {

    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping
    fun getImportTemplate(@PathVariable spaceUuid: String): String {
        return "Person Name\tCDSID\tPerson Role\tPerson Note\tPerson Tags\r\nBruce Wayne\timbatman\tSuperhero\tLikes champagne\tNight Shift";
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PostMapping
    fun importPeople(
            @PathVariable spaceUuid: String,
            @RequestBody personRequests: List<PersonRequest>
    ): Boolean {

        for (request in personRequests) {

            var newRequest : PersonRequest = createTagIfNotExists(request, spaceUuid)
            newRequest = createRoleIfNotExists(newRequest, spaceUuid)

            personService.createPerson(newRequest.toPerson(spaceUuid))
        }
        return false
    }

    private fun createRoleIfNotExists(request: PersonRequest, spaceUuid: String): PersonRequest {
        if (request.spaceRole != null) {
            if (!roleService.getRolesForSpace(spaceUuid).contains(request.spaceRole!!)) {
                request.spaceRole = roleService.addRoleToSpace(spaceUuid, request.spaceRole!!.name, null)
            }
        }
        return request
    }

    private fun createTagIfNotExists(request: PersonRequest, spaceUuid: String) : PersonRequest {

        var newTags : MutableSet<PersonTag> = mutableSetOf()

        for (tag in request.tags) {

            if (!personTagService.getAllPersonTags(spaceUuid).contains(tag)) {
                newTags.add(personTagService.createPersonTagForSpace(TagRequest(tag.name), spaceUuid))

            }
        }
        request.tags = newTags
        return request
    }

}
