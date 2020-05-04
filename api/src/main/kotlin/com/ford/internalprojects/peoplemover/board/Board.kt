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

package com.ford.internalprojects.peoplemover.board

import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.space.SpaceComponent
import javax.persistence.*
import javax.validation.constraints.NotBlank

@Entity
data class Board(
    @Id
    @GeneratedValue
    var id: Int? = null,

    @field:NotBlank
    var name: String,

    @Column(name = "space_id")
    override val spaceId: Int,

    @OneToMany(mappedBy = "boardId")
    @OrderBy("UPPER(name) ASC")
    val products: List<Product> = mutableListOf()
): SpaceComponent {
    constructor(name: String, spaceId: Int):
            this(null, name, spaceId, mutableListOf())
}