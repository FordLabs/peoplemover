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

package com.ford.internalprojects.peoplemover.location

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RequestMapping("/api/location/{spaceToken}")
@RestController
class LocationController(
        private val locationService: LocationService,
        private val logger: BasicLogger
) {
    @GetMapping
    fun getLocationsForSpace(@PathVariable spaceToken: String): ResponseEntity<Set<SpaceLocation>> {
        val locationsForSpace: Set<SpaceLocation> = locationService.getLocationsForSpace(spaceToken)
        logger.logInfoMessage("All location retrieved for space: [$spaceToken].")
        return ResponseEntity.ok(locationsForSpace)
    }

    @PostMapping
    fun addLocationForSpace(
            @PathVariable spaceToken: String,
            @RequestBody locationAddRequest: LocationAddRequest
    ): ResponseEntity<SpaceLocation> {
        val addedLocation: SpaceLocation = locationService.addLocationToSpace(spaceToken, locationAddRequest)
        logger.logInfoMessage("Location [${addedLocation.name}] is created for space: [$spaceToken].")
        return ResponseEntity.ok(addedLocation)
    }

    @PutMapping
    fun editLocationForSpace(
            @PathVariable spaceToken: String,
            @RequestBody locationEditRequest: LocationEditRequest
    ): ResponseEntity<SpaceLocation> {
        val editedLocation: SpaceLocation = locationService.editLocation(spaceToken, locationEditRequest)
        logger.logInfoMessage("Location with id [${editedLocation.id}] is updated to have name " +
                "[${editedLocation.name}] in space: [$spaceToken].")
        return ResponseEntity.ok(editedLocation)
    }

    @DeleteMapping(path = ["/{locationId}"])
    fun deleteLocationForSpace(
            @PathVariable spaceToken: String,
            @PathVariable locationId: Int
    ): ResponseEntity<Unit> {
        locationService.deleteLocation(spaceToken, locationId)
        logger.logInfoMessage("Deleted location with id [$locationId] in space: [$spaceToken].")
        return ResponseEntity.ok().build()
    }

}