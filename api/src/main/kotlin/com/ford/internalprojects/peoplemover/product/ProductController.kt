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

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import javax.validation.Valid

@RequestMapping("/api/spaces/{spaceUuid}/products")
@RestController
class ProductController(
    private val productService: ProductService,
    private val logger: BasicLogger
) {
    @GetMapping
    fun getProducts(
        @PathVariable spaceUuid: String,
        @RequestParam(name = "requestedDate", required = false) requestedDate: String
    ): ResponseEntity<Set<Product>> {
        val products: Set<Product>;

        if (requestedDate != null) {
            val date = LocalDate.parse(requestedDate)
            products = productService.findAllBySpaceUuidAndDate(spaceUuid, date)
            logger.logInfoMessage("All product retrieved by date ${requestedDate}.")
            return ResponseEntity.ok(products)
        }

        logger.logInfoMessage("All product retrieved for space.")
        products = productService.findAllBySpaceUuid(spaceUuid)

        return ResponseEntity.ok(products)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'uuid', 'write')")
    @PostMapping
    fun createProduct(
            @PathVariable spaceUuid: String,
            @Valid @RequestBody productAddRequest: ProductAddRequest
    ): ResponseEntity<Product> {
        val createdProduct = productService.create(productAddRequest, spaceUuid)
        logger.logInfoMessage("Product [${createdProduct.name}] created.")
        return ResponseEntity.ok(createdProduct)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'uuid', 'write')")
    @PutMapping("/{productId}")
    fun updateProduct(
        @PathVariable spaceUuid: String,
        @PathVariable productId: Int,
        @Valid @RequestBody productEditRequest: ProductEditRequest
    ): ResponseEntity<Product> {
        val updatedProduct: Product = productService.update(productEditRequest, spaceUuid)
        logger.logInfoMessage("Product with id [$productId] updated.")
        return ResponseEntity.ok(updatedProduct)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'uuid', 'write')")
    @DeleteMapping("/{productId}")
    fun deleteProduct(
        @PathVariable spaceUuid: String,
        @PathVariable productId: Int
    ): ResponseEntity<Unit> {
        productService.delete(productId, spaceUuid)
        logger.logInfoMessage("Product with id [$productId] deleted.")
        return ResponseEntity.ok().build()
    }
}
