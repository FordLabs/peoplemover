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

package com.ford.internalprojects.peoplemover.location

import com.ford.internalprojects.peoplemover.space.SpaceComponent
import javax.persistence.*

@Entity
@Table(name = "space_locations", uniqueConstraints = [UniqueConstraint(columnNames = ["name", "space_uuid"])])
data class SpaceLocation (
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    override val id: Int? = null,

    @Column(name = "space_uuid")
    override val spaceUuid: String,

    val name: String
): SpaceComponent
