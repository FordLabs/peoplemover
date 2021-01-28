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

package com.ford.internalprojects.peoplemover.space

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import java.sql.Timestamp
import java.util.*
import javax.persistence.*

@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "id")
data class Space (
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    val id: Int? = null,

    @Column(unique = true, nullable = false)
    val uuid: String = UUID.randomUUID().toString(),

    @Column(unique = true, nullable = false)
    var name: String,

    @Column(name="today_view_is_public")
    var todayViewIsPublic: Boolean = false,

    var lastModifiedDate: Timestamp? = null,

    var createdBy: String? = null
) {
    constructor(name: String):
        this(null, UUID.randomUUID().toString(), name,false, null, null)
}