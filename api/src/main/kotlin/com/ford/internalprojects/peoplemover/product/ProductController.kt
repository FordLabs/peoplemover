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

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import javax.validation.Valid

@RequestMapping("/api/product")
@RestController
class ProductController(
        private val productService: ProductService,
        private val logger: BasicLogger) {

    @GetMapping
    fun allProducts(): ResponseEntity<List<Product>> {
        val products: List<Product> = productService.findAll()
        logger.logInfoMessage("All product retrieved.")
        return ResponseEntity.ok(products)
    }

    @GetMapping("/{spaceId}/{requestedDate}")
    fun allProductsForDate(@PathVariable spaceId: Int, @PathVariable requestedDate: String): ResponseEntity<Set<Product>> {
        val date = LocalDate.parse(requestedDate)
        val products: Set<Product> = productService.findAllBySpaceIdAndDate(spaceId, date)
        logger.logInfoMessage("All product retrieved.")
        return ResponseEntity.ok(products)
    }

    @PostMapping
    fun createProduct(@Valid @RequestBody productAddRequest: ProductAddRequest): ResponseEntity<Product> {
        val createdProduct = productService.create(productAddRequest)
        logger.logInfoMessage("Product [${createdProduct.name}] created.")
        return ResponseEntity.ok(createdProduct)
    }

    @PutMapping("/{productId}")
    fun updateProduct(
            @PathVariable productId: Int,
            @Valid @RequestBody productEditRequest: ProductEditRequest
    ): ResponseEntity<Product> {
        val updatedProduct: Product = productService.update(productEditRequest)
        logger.logInfoMessage("Product with id [$productId] updated.")
        return ResponseEntity.ok(updatedProduct)
    }

    @DeleteMapping("/{productId}")
    fun deleteProduct(@PathVariable productId: Int): ResponseEntity<Unit> {
        productService.delete(productId)
        logger.logInfoMessage("Product with id [$productId] deleted.")
        return ResponseEntity.ok().build()
    }

}