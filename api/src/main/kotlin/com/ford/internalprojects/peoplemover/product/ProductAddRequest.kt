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

import com.fasterxml.jackson.annotation.JsonIgnore
import com.ford.internalprojects.peoplemover.location.SpaceLocation
import com.ford.internalprojects.peoplemover.producttag.ProductTag
import java.time.LocalDate
import javax.validation.constraints.NotBlank
import javax.validation.constraints.NotNull
import javax.validation.constraints.Size

data class ProductAddRequest(
        @field:NotBlank(message = "Invalid Product in Request. Did you forget to provide a name for the product?")
        var name: String,

        val productTags: Set<ProductTag> = HashSet(),

        val startDate: LocalDate? = null,

        val endDate: LocalDate? = null,

        val dorf: String = "",

        val spaceLocation: SpaceLocation? = null,

        val archived: Boolean = false,

        @field:Size(max = 500)
        var notes: String = "",

        @field:NotNull(message = "Invalid Product in Request. Did you forget to provide a spaceId for the product?")
        var spaceId: Int
) {
        companion object {
                @JvmStatic
                @JsonIgnore
                fun toProduct(productAddRequest: ProductAddRequest): Product {
                        return Product(
                                name = productAddRequest.name,
                                productTags = productAddRequest.productTags,
                                startDate = productAddRequest.startDate,
                                endDate = productAddRequest.endDate,
                                dorf = productAddRequest.dorf,
                                spaceLocation = productAddRequest.spaceLocation,
                                archived = productAddRequest.archived,
                                notes = productAddRequest.notes,
                                spaceId = productAddRequest.spaceId
                        )
                }
        }
}