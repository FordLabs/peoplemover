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
import com.ford.internalprojects.peoplemover.auth.exceptions.InvalidTokenException
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceAlreadyExistsException
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import com.ford.internalprojects.peoplemover.utilities.HelperUtils
import com.ford.labs.authquest.oauth.OAuthVerifyResponse
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException

@Service
class SpaceService(
        private val spaceRepository: SpaceRepository,
        private val productService: ProductService,
        private val authClient: AuthClient,
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

    fun createSpaceWithUser(accessToken: String, spaceName: String): SpaceResponse {
        val validateResponse: OAuthVerifyResponse
         try {
             validateResponse = authClient.validateAccessToken(accessToken).get()

                 createSpaceWithName(spaceName).let { createdSpace ->
                     val userUUID: String = validateResponse.sub!!

                     userSpaceMappingRepository.save(
                             UserSpaceMapping(
                                     userId = userUUID,
                                     spaceId = createdSpace.id
                             )
                     )
                     return SpaceResponse(createdSpace)
                 }

         }  catch (e: HttpClientErrorException){}

        throw InvalidTokenException()
    }

    fun findAll(): List<Space> {
        return spaceRepository.findAll().toList()
    }

    fun getSpacesForUser(accessToken: String): List<Space> {
        return try {
            val validateResponse: OAuthVerifyResponse = authClient.validateAccessToken(accessToken).get()
            val spaceIds: List<Int> = userSpaceMappingRepository.findAllByUserId(validateResponse.sub).map{ mapping -> mapping.spaceId!! }.toList()
            spaceRepository.findAllByIdIn(spaceIds)
        } catch (e: HttpClientErrorException) {
            throw InvalidTokenException()
        }
    }

    fun getSpace(spaceName: String): Space {
        return spaceRepository.findByNameIgnoreCase(spaceName) ?: throw SpaceNotExistsException()
    }
}
