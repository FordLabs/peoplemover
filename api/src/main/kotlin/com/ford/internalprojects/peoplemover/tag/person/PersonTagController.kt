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

import com.ford.internalprojects.peoplemover.tag.TagRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RestController
@RequestMapping("/api/spaces/{spaceUuid}/person-tags")
class PersonTagController {
    @Autowired
    private lateinit var personTagRepository: PersonTagRepository

    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping
    fun getAllPersonTags(@PathVariable spaceUuid: String): ResponseEntity<List<PersonTag>> {
        return ResponseEntity.ok(
            personTagRepository.findAllBySpaceUuid(
                spaceUuid,
                Sort.by(Sort.Order.asc("name").ignoreCase())
            )
        )
    }

    @PostMapping
    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    fun createPersonTag(@PathVariable spaceUuid: String, @Valid @RequestBody request: TagRequest): ResponseEntity<PersonTag>{
        val createdPersonTag: PersonTag = personTagRepository.createEntityAndUpdateSpaceLastModified(PersonTag(name = request.name, spaceUuid = spaceUuid))
        return ResponseEntity.ok(createdPersonTag)
    }
}
