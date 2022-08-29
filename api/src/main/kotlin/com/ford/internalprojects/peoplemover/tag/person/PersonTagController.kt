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

import com.ford.internalprojects.peoplemover.tag.TagRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RestController
@RequestMapping("/api/spaces/{spaceUuid}/person-tags")
class PersonTagController {
    @Autowired
    private lateinit var personTagService: PersonTagService

    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping
    fun getAllPersonTags(@PathVariable spaceUuid: String): ResponseEntity<List<PersonTag>> {
        return ResponseEntity.ok(
            personTagService.getAllPersonTags(spaceUuid)
        )
    }

    @PostMapping
    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    fun createPersonTag(@PathVariable spaceUuid: String, @Valid @RequestBody request: TagRequest): ResponseEntity<PersonTag>{
        val createdPersonTag: PersonTag = personTagService.createPersonTagForSpace(request, spaceUuid)
        return ResponseEntity.ok(createdPersonTag)
    }

    @PutMapping(path = ["/{personTagId}"])
    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    fun editPersonTag(
        @PathVariable spaceUuid: String,
        @PathVariable personTagId: Int,
        @Valid @RequestBody tagRequest: TagRequest
    ): ResponseEntity<PersonTag> {
        val editedPersonTag: PersonTag = personTagService.editPersonTag(
            spaceUuid = spaceUuid,
            personTagId = personTagId,
            tagEditRequest = tagRequest
        )
        return ResponseEntity.ok(editedPersonTag)
    }

    @DeleteMapping(path = ["/{personTagId}"])
    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    fun deletePersonTag(
        @PathVariable spaceUuid: String,
        @PathVariable personTagId: Int
    ): ResponseEntity<Unit> {
        personTagService.deletePersonTag(personTagId, spaceUuid)
        return ResponseEntity.ok().build()
    }
}
