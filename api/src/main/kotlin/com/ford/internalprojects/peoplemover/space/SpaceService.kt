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

package com.ford.internalprojects.peoplemover.space

import com.ford.internalprojects.peoplemover.auth.*
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceAlreadyExistsException
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import com.ford.internalprojects.peoplemover.utilities.HelperUtils
import org.springframework.stereotype.Service
import java.util.*

@Service
class SpaceService(
        private val spaceRepository: SpaceRepository,
        private val productService: ProductService,
        private val authService: AuthService,
        private val userSpaceMappingRepository: UserSpaceMappingRepository
        ) {

    fun createSpaceWithName(spaceName: String): Space {
        spaceRepository.findByNameIgnoreCase(spaceName)
                ?.let { throw SpaceAlreadyExistsException(spaceName) }
        if (spaceName.isEmpty()) {
            throw SpaceNotExistsException(spaceName)
        } else {
            val savedSpace = spaceRepository.save(
                    Space(name = spaceName, lastModifiedDate = HelperUtils.currentTimeStamp)
            )
            productService.createDefaultProducts(savedSpace);
            return savedSpace
        }
    }

    fun findAll(): List<Space> {
        return spaceRepository.findAll().toList()
    }

    fun createSpaceWithUser(accessToken: String, spaceName: String): SpaceResponse {
        val validateResponse: OAuthVerifyResponse = authService.validateToken(accessToken)
         createSpaceWithName(spaceName).let { createdSpace ->
             userSpaceMappingRepository.save(
                     UserSpaceMapping(
                             userId = validateResponse.sub!!,
                             spaceId = createdSpace.id
                     )
             )
             return SpaceResponse(createdSpace)
         }
    }

    fun getSpacesForUser(accessToken: String): List<Space> {
            val validateResponse: OAuthVerifyResponse = authService.validateToken(accessToken)
            val spaceIds: List<Int> = userSpaceMappingRepository.findAllByUserId(validateResponse.sub).map{ mapping -> mapping.spaceId!! }.toList()
            return spaceRepository.findAllByIdIn(spaceIds)
    }

    fun getSpace(spaceName: String): Space {
        return spaceRepository.findByNameIgnoreCase(spaceName) ?: throw SpaceNotExistsException()
    }

    fun deleteFlippingSweetSpace(){
        val flippingSweet = spaceRepository.findByNameIgnoreCase("flippingsweet")
        spaceRepository.deleteByUuid(flippingSweet!!.uuid);
    }
}
