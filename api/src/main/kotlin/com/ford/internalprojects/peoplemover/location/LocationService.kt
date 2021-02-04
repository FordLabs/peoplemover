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

package com.ford.internalprojects.peoplemover.location

import com.ford.internalprojects.peoplemover.location.exceptions.LocationAlreadyExistsException
import com.ford.internalprojects.peoplemover.location.exceptions.LocationNotExistsException
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class LocationService(
        private val spaceLocationRepository: SpaceLocationRepository
) {
    fun addLocationToSpace(spaceUuid: String, locationAddRequest: LocationAddRequest): SpaceLocation {

        val spaceLocationToSave = SpaceLocation(name = locationAddRequest.name, spaceUuid = spaceUuid)
        return try {
            spaceLocationRepository.createEntityAndUpdateSpaceLastModified(spaceLocationToSave)
        } catch (e: DataIntegrityViolationException ) {
            throw LocationAlreadyExistsException(locationAddRequest.name)
        }
    }

    fun getLocationsForSpace(spaceUuid: String): Set<SpaceLocation> =
        spaceLocationRepository.findAllBySpaceUuid(spaceUuid)

    fun editLocation(spaceUuid: String, locationEditRequest: LocationEditRequest): SpaceLocation {
        return spaceLocationRepository.updateEntityAndUpdateSpaceLastModified(locationEditRequest.toSpaceLocation(spaceUuid))
    }

    fun deleteLocation(locationId: Int, spaceUuid: String) {
        spaceLocationRepository.deleteEntityAndUpdateSpaceLastModified(locationId, spaceUuid)
    }

}
