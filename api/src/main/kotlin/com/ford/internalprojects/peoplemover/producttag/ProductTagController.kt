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

package com.ford.internalprojects.peoplemover.producttag

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RestController
@RequestMapping("/api/producttag/{spaceName}")
class ProductTagController (
        private val productTagService: ProductTagService,
        private val logger: BasicLogger
) {
    @PostMapping
    fun createProductTag(
            @PathVariable spaceName: String,
            @Valid @RequestBody addRequest: ProductTagAddRequest
    ): ResponseEntity<ProductTag> {
        val createdProductTag: ProductTag = productTagService.createProductTagForSpace(
                addRequest,
                spaceName
        )
        logger.logInfoMessage("Product tag [${createdProductTag.name}] created for space: [$spaceName].")
        return ResponseEntity.ok(createdProductTag)
    }

    @GetMapping
    fun getAllProductTags(@PathVariable spaceName: String): ResponseEntity<List<ProductTag>> {
        return ResponseEntity.ok(productTagService.getAllProductTags(spaceName))
    }

    @DeleteMapping(path = ["/{productTagId}"])
    fun deleteProductTag(
            @PathVariable spaceName: String,
            @PathVariable productTagId: Int
    ): ResponseEntity<Unit> {
        productTagService.deleteProductTag(spaceName, productTagId)
        return ResponseEntity.ok().build()
    }

    @PutMapping
    fun editProductTag(
            @PathVariable spaceName: String,
            @RequestBody productTagEditRequest: ProductTagEditRequest
    ): ResponseEntity<ProductTag> {
        val editedProductTag = productTagService.editProductTag(
                spaceName,
                productTagEditRequest
        )
        return ResponseEntity.ok(editedProductTag)
    }

}