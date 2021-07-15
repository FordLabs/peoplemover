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

import com.fasterxml.jackson.annotation.JsonProperty
import com.ford.internalprojects.peoplemover.space.NamedSpaceComponent
import com.ford.internalprojects.peoplemover.tag.person.PersonTag
import com.ford.internalprojects.peoplemover.tag.role.SpaceRole
import java.time.LocalDate
import java.util.*
import javax.persistence.*
import kotlin.collections.HashSet

@Entity
data class Person(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        override val id: Int? = null,

        override val name: String,

        @ManyToOne
        @JoinColumn(name = "space_role_id")
        val spaceRole: SpaceRole? = null,

        @ManyToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REFRESH])
        @JoinTable(name = "person_tag_mapping", joinColumns = [JoinColumn(name = "person_id", referencedColumnName = "id")], inverseJoinColumns = [JoinColumn(name = "person_tag_id", referencedColumnName = "id")])
        val tags: Set<PersonTag> = HashSet(),

        val notes: String? = "",

        @JsonProperty
        @Column(name = "new_person")
        var newPerson: Boolean = false,

        @Column()
        var newPersonDate: LocalDate = LocalDate.now(),

        @Column(name = "space_uuid")
        override val spaceUuid: String,

        val customField1: String? = null

): NamedSpaceComponent {
    constructor(name: String, spaceUuid: String) :
            this(id = null, name = name, spaceRole = null, tags = HashSet(), notes = "", newPerson = false, newPersonDate = LocalDate.now(), spaceUuid = spaceUuid, customField1 = null)
}
