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
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class ProductTagService(
        private val productTagRepository: ProductTagRepository,
        private val spaceRepository: SpaceRepository
) {
    fun createProductTagForSpace(addRequest: ProductTagAddRequest, spaceUuid: String): ProductTag {
        val space = spaceRepository.findByUuid(spaceUuid) ?: throw SpaceNotExistsException()
        productTagRepository.findByNameAllIgnoreCaseAndSpaceId(addRequest.name, space.id!!)
                ?.let { throw ProductTagAlreadyExistsForSpaceException() }
        return productTagRepository.saveAndUpdateSpaceLastModified(ProductTag(spaceId = space.id, name = addRequest.name))
    }

    fun getAllProductTags(spaceUuid: String): List<ProductTag> {
        val space: Space = spaceRepository.findByUuid(spaceUuid)
                ?: throw SpaceNotExistsException(spaceUuid)

        return productTagRepository.findAllBySpaceId(
                space.id!!,
                Sort.by(Sort.Order.asc("name").ignoreCase())
        )
    }

    @Transactional
    fun deleteProductTag(productTagId: Int) {
        val tagToDelete: ProductTag = productTagRepository.findByIdOrNull(productTagId)
                ?: throw ProductTagNotExistsForSpaceException()

        productTagRepository.deleteAndUpdateSpaceLastModified(tagToDelete)
    }

    fun editProductTag(
            spaceUuid: String,
            tagEditRequest: ProductTagEditRequest
    ): ProductTag {
        val space = spaceRepository.findByUuid(spaceUuid) ?: throw SpaceNotExistsException(spaceUuid)

        productTagRepository.findByNameAllIgnoreCaseAndSpaceId(
                tagEditRequest.name,
                space.id!!
        )?.let { throw ProductTagAlreadyExistsForSpaceException() }

        val tagFound = productTagRepository.findByIdOrNull(tagEditRequest.id)
                ?: throw ProductTagNotExistsForSpaceException()
        tagFound.name = tagEditRequest.name
        return productTagRepository.saveAndUpdateSpaceLastModified(tagFound)
    }

}