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

package com.ford.internalprojects.peoplemover.product

import com.ford.internalprojects.peoplemover.tag.location.SpaceLocation
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import java.time.LocalDate
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Size

data class ProductRequest(
    @field:NotBlank(message = "Invalid Product in Request. Did you forget to provide a name for the product?")
    @field:Size(max = 255, message = "Name cannot be longer than 255 characters")
    var name: String,

    val tags: Set<ProductTag> = HashSet(),

    val startDate: LocalDate? = null,

    val endDate: LocalDate? = null,

    @field:Size(max = 255, message = "dorf cannot be longer than 255 characters")
    val dorf: String = "",

    val spaceLocation: SpaceLocation? = null,

    val archived: Boolean = false,

    @field:Size(max = 500, message = "notes cannot be longer than 500 characters")
    var notes: String = "",

    var url: String? =""
)

fun ProductRequest.toProduct(productId: Int? = null, spaceUuid: String): Product =
    Product(
        id = productId,
        name = name,
        tags = tags,
        startDate = startDate,
        endDate = endDate,
        dorf = dorf,
        spaceLocation = spaceLocation,
        archived = archived,
        notes = notes,
        url = url,
        spaceUuid = spaceUuid
    )



