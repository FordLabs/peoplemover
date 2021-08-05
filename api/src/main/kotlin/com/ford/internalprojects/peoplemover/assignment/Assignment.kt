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

package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.space.SpaceComponent
import java.time.LocalDate
import javax.persistence.*

@Entity
data class Assignment(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        override val id: Int? = null,

        @OneToOne
        @JoinColumn(name = "person_id")
        val person: Person,

        @Column(name = "placeholder")
        var placeholder: Boolean = false,

        var productId: Int,

        @Column(name = "effective_date")
        val effectiveDate: LocalDate? = LocalDate.now(),

        @Column(name = "space_uuid")
        override val spaceUuid: String,

        @Transient
        var startDate: LocalDate? = null
): SpaceComponent
