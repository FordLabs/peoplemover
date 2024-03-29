/*
 * Copyright (c) 2022 Ford Motor Company
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

import com.ford.internalprojects.peoplemover.space.SpaceService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import javax.validation.Valid

@RequestMapping("/api/spaces/{spaceUuid}/products")
@RestController
class ProductController(
    private val productService: ProductService,
    private val spaceService: SpaceService,
) {
    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping
    fun getProducts(
        @PathVariable spaceUuid: String,
        @RequestParam(name = "requestedDate", required = false) requestedDate: String?
    ): Set<Product> {
        val products: Set<Product>;
        spaceService.checkReadOnlyAccessByDate(requestedDate,spaceUuid)

        if (requestedDate != null) {
            val date = LocalDate.parse(requestedDate)
            products = productService.findAllBySpaceUuidAndDate(spaceUuid, date)
            return products
        }

        products = productService.findAllBySpaceUuid(spaceUuid)
        return products
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PostMapping
    fun createProduct(
        @PathVariable spaceUuid: String,
        @Valid @RequestBody productRequest: ProductRequest
    ): Product {
        return productService.create(productRequest, spaceUuid)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PutMapping("/{productId}")
    fun updateProduct(
        @PathVariable spaceUuid: String,
        @PathVariable productId: Int,
        @Valid @RequestBody productRequest: ProductRequest
    ): Product {
        return productService.update(productRequest, productId, spaceUuid)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @DeleteMapping("/{productId}")
    fun deleteProduct(
        @PathVariable spaceUuid: String,
        @PathVariable productId: Int
    ) {
        productService.delete(productId, spaceUuid)
    }
}
