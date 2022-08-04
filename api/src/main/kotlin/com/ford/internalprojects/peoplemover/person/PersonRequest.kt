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

import com.fasterxml.jackson.annotation.JsonProperty
import com.ford.internalprojects.peoplemover.tag.person.PersonTag
import com.ford.internalprojects.peoplemover.tag.role.SpaceRole
import java.time.LocalDate
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Size

data class PersonRequest(

        @field:NotBlank(message = "Name cannot be blank.")
        @field:Size(max = 255, message = "Name cannot exceed 255 characters.")
        val name: String,

        val tags: Set<PersonTag> = HashSet(),

        val spaceRole: SpaceRole? = null,

        @field:Size(max = 255, message = "Notes cannot exceed 255 characters.")
        val notes: String? = "",

        @JsonProperty
        var newPerson: Boolean = false,

        var newPersonDate: LocalDate?,

        val customField1: String? = null,

        val archiveDate: LocalDate?
)

fun PersonRequest.toPerson(spaceUuid: String, id: Int? = null): Person = Person(
        id = id,
        name = this.name.trim(),
        spaceRole = this.spaceRole,
        notes = this.notes?.trim(),
        newPerson = this.newPerson,
        newPersonDate = this.newPersonDate,
        spaceUuid = spaceUuid,
        tags = this.tags,
        customField1 = this.customField1?.trim(),
        archiveDate = this.archiveDate
)
