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

package com.ford.internalprojects.peoplemover.tag.location

import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityAlreadyExistsException
import com.ford.internalprojects.peoplemover.tag.TagRequest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service

@Service
class LocationService(
        private val spaceLocationRepository: SpaceLocationRepository
) {
    fun addLocationToSpace(spaceUuid: String, locationAddRequest: TagRequest): SpaceLocation {

        val spaceLocationToSave = SpaceLocation(name = locationAddRequest.name.trim(), spaceUuid = spaceUuid)
        return try {
            spaceLocationRepository.findAllBySpaceUuidAndNameIgnoreCase(spaceUuid, spaceLocationToSave.name)?.let { throw EntityAlreadyExistsException() }
            spaceLocationRepository.createEntityAndUpdateSpaceLastModified(spaceLocationToSave)
        } catch (e: DataIntegrityViolationException ) {
            throw EntityAlreadyExistsException()
        }
    }

    fun getLocationsForSpace(spaceUuid: String): Set<SpaceLocation> =
        spaceLocationRepository.findAllBySpaceUuid(spaceUuid)

    fun editLocation(spaceUuid: String, locationRequest: TagRequest, locationId: Int): SpaceLocation {
        val spaceLocationToEdit = SpaceLocation(id = locationId, name = locationRequest.name.trim(), spaceUuid = spaceUuid)
        return try {
            spaceLocationRepository.findAllBySpaceUuidAndNameIgnoreCase(spaceUuid, spaceLocationToEdit.name)?.let { throw EntityAlreadyExistsException() }
            spaceLocationRepository.updateEntityAndUpdateSpaceLastModified(spaceLocationToEdit)
        } catch (e: DataIntegrityViolationException) {
            throw EntityAlreadyExistsException()
        }
    }

    fun deleteLocation(locationId: Int, spaceUuid: String) {
        spaceLocationRepository.deleteEntityAndUpdateSpaceLastModified(locationId, spaceUuid)
    }
}
