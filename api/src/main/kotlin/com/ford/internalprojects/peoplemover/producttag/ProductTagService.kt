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

package com.ford.internalprojects.peoplemover.producttag

import com.ford.internalprojects.peoplemover.producttag.exceptions.ProductTagAlreadyExistsForSpaceException
import com.ford.internalprojects.peoplemover.producttag.exceptions.ProductTagNotExistsForSpaceException
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class ProductTagService(
        private val productTagRepository: ProductTagRepository,
        private val spaceRepository: SpaceRepository
) {
    fun createProductTagForSpace(addRequest: ProductTagAddRequest, spaceUuid: String): ProductTag {
        productTagRepository.findAllByNameIgnoreCaseAndSpaceUuid(addRequest.name, spaceUuid)
                ?.let { throw ProductTagAlreadyExistsForSpaceException() }
        return productTagRepository.saveAndUpdateSpaceLastModified(ProductTag(name = addRequest.name, spaceUuid = spaceUuid))
    }

    fun getAllProductTags(spaceUuid: String): List<ProductTag> =
         productTagRepository.findAllBySpaceUuid(
                spaceUuid,
                Sort.by(Sort.Order.asc("name").ignoreCase())
        )


    @Transactional
    fun deleteProductTag(productTagId: Int, spaceUuid: String) {
        productTagRepository.deleteEntityAndUpdateSpaceLastModified(productTagId, spaceUuid)
    }

    fun editProductTag(
            spaceUuid: String,
            tagEditRequest: ProductTagEditRequest
    ): ProductTag {
        productTagRepository.findAllByNameAndSpaceUuid(tagEditRequest.name, spaceUuid)
                ?.let { throw ProductTagAlreadyExistsForSpaceException() }
        val tagFound = productTagRepository.findByIdAndSpaceUuid(tagEditRequest.id, spaceUuid)
                ?: throw ProductTagNotExistsForSpaceException()
        tagFound.name = tagEditRequest.name
        return productTagRepository.saveAndUpdateSpaceLastModified(tagFound)
    }

}
