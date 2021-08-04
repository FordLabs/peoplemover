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

package com.ford.internalprojects.peoplemover.product

import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.space.NamedSpaceComponent
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocation
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import java.time.LocalDate
import javax.persistence.*

@Table
@Entity
data class Product (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    override var id: Int? = null,

    override var name: String,

    @OneToMany(mappedBy = "productId", fetch = FetchType.EAGER)
    val assignments: Set<Assignment> = HashSet(),

    @ManyToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REFRESH])
    @JoinTable(name = "product_tag_mapping", joinColumns = [JoinColumn(name = "product_id", referencedColumnName = "id")], inverseJoinColumns = [JoinColumn(name = "product_tag_id", referencedColumnName = "id")])
    val tags: Set<ProductTag> = HashSet(),

    val startDate: LocalDate? = null,

    val endDate: LocalDate? = null,

    val dorf: String = "",

    @ManyToOne
    @JoinColumn(name = "space_location_id")
    val spaceLocation: SpaceLocation? = null,

    val archived: Boolean = false,

    var notes: String = "",

    val url: String? = "",

    @Column(name = "space_uuid")
    override val spaceUuid: String

): NamedSpaceComponent {

    constructor(id: Int?, name: String, spaceUuid: String):
        this(id, name, HashSet(), HashSet(), null, null, "", null, false, "", "", spaceUuid)

    constructor(name: String, spaceUuid: String):
            this(null, name, HashSet(), HashSet(), null, null, "", null, false, "", "", spaceUuid)

}
