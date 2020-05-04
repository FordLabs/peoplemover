/*
 * Copyright (c) 2019 Ford Motor Company
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
import com.ford.internalprojects.peoplemover.location.SpaceLocation
import com.ford.internalprojects.peoplemover.producttag.ProductTag
import com.ford.internalprojects.peoplemover.space.SpaceComponent
import java.time.LocalDate
import javax.persistence.*

@Table(uniqueConstraints = [UniqueConstraint(columnNames = ["board_id", "name"])])
@Entity
data class Product (
    @Id
    @GeneratedValue
    var id: Int? = null,

    var name: String,

    @Column(name = "board_id")
    var boardId: Int,

    @OneToMany(mappedBy = "productId", fetch = FetchType.EAGER)
    val assignments: Set<Assignment> = HashSet(),

    @ManyToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REFRESH])
    @JoinTable(name = "product_tag_mapping", joinColumns = [JoinColumn(name = "product_id", referencedColumnName = "id")], inverseJoinColumns = [JoinColumn(name = "product_tag_id", referencedColumnName = "id")])
    val productTags: Set<ProductTag> = HashSet(),

    val startDate: LocalDate? = null,

    val endDate: LocalDate? = null,

    val dorf: String = "",

    @ManyToOne
    @JoinColumn(name = "space_location_id")
    val spaceLocation: SpaceLocation? = null,

    val archived: Boolean = false,

    var notes: String = "",

    @Column(name = "space_id")
    override var spaceId: Int
): SpaceComponent {

    constructor(id: Int?, name: String, boardId: Int, spaceId: Int):
        this(id, name, boardId, HashSet(), HashSet(), null, null, "", null, false, "", spaceId)

    constructor(name: String, boardId: Int, spaceId: Int):
            this(null, name, boardId, HashSet(), HashSet(), null, null, "", null, false, "", spaceId)

}