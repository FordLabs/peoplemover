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

package com.ford.internalprojects.peoplemover.tag.product

import com.ford.internalprojects.peoplemover.tag.TagRequest
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RestController
@RequestMapping("/api/spaces/{spaceUuid}/product-tags")
class ProductTagController (
        private val productTagService: ProductTagService,
        private val logger: BasicLogger
) {
    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PostMapping
    fun createProductTag(
        @PathVariable spaceUuid: String,
        @Valid @RequestBody request: TagRequest
    ): ResponseEntity<ProductTag> {
        val createdProductTag: ProductTag = productTagService
            .createProductTagForSpace(request, spaceUuid)
        logger.logInfoMessage("Product tag [${createdProductTag.name}] created for space: [$spaceUuid].")
        return ResponseEntity.ok(createdProductTag)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping
    fun getAllProductTags(@PathVariable spaceUuid: String): ResponseEntity<List<ProductTag>> {
        return ResponseEntity.ok(productTagService.getAllProductTags(spaceUuid))
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @DeleteMapping(path = ["/{productTagId}"])
    fun deleteProductTag(
            @PathVariable spaceUuid: String,
            @PathVariable productTagId: Int
    ): ResponseEntity<Unit> {
        productTagService.deleteProductTag(productTagId, spaceUuid)
        return ResponseEntity.ok().build()
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PutMapping(path = ["/{productTagId}"])
    fun editProductTag(
            @PathVariable spaceUuid: String,
            @PathVariable productTagId: Int,
            @RequestBody tagRequest: TagRequest
    ): ResponseEntity<ProductTag> {
        val editedProductTag = productTagService.editProductTag(
                spaceUuid,
                productTagId,
                tagRequest
        )
        return ResponseEntity.ok(editedProductTag)
    }

}
