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

package com.ford.internalprojects.peoplemover.space

import com.ford.internalprojects.peoplemover.customfield.CustomFieldMapping
import java.sql.Timestamp
import java.time.LocalDateTime
import java.util.*
import javax.persistence.*

@Entity
data class Space (
    @Id
    @Column(unique = true, nullable = false)
    val uuid: String = UUID.randomUUID().toString(),

    @Column(unique = true, nullable = false)
    var name: String,

    @Column(name="today_view_is_public")
    var todayViewIsPublic: Boolean = false,

    var lastModifiedDate: Timestamp? = null,

    var createdBy: String? = null,

    @Column(name="created_date")
    var createdDate: LocalDateTime? = null,

    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "space_uuid")
    var customFieldLabels: List<CustomFieldMapping> = emptyList()
)

fun Space.update(editSpaceRequest: EditSpaceRequest): Space {
    val updatedName = editSpaceRequest.name?.trim() ?: this.name
    val updatedTodayViewAsPublic = editSpaceRequest.todayViewIsPublic ?: this.todayViewIsPublic
    return this.copy(name = updatedName, todayViewIsPublic = updatedTodayViewAsPublic, lastModifiedDate = Timestamp(Date().time))
}
