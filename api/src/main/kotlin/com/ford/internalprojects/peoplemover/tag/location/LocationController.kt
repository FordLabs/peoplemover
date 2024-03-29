/*
 * Copyright (c) 2022 Ford Motor Company
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

import com.ford.internalprojects.peoplemover.tag.TagRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RequestMapping("/api/spaces/{spaceUuid}/locations")
@RestController
class LocationController(
    private val locationService: LocationService,
) {
    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping
    fun getLocationsForSpace(@PathVariable spaceUuid: String): ResponseEntity<Set<SpaceLocation>> {
        val locationsForSpace: Set<SpaceLocation> = locationService.getLocationsForSpace(spaceUuid)
        return ResponseEntity.ok(locationsForSpace)
    }

    @PreAuthorize("hasPermission(#spaceUuid,'write')")
    @PostMapping
    fun addLocationForSpace(
        @PathVariable spaceUuid: String,
        @Valid @RequestBody locationAddRequest: TagRequest
    ): ResponseEntity<SpaceLocation> {
        val addedLocation: SpaceLocation = locationService.addLocationToSpace(spaceUuid, locationAddRequest)
        return ResponseEntity.ok(addedLocation)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @PutMapping(path = ["/{locationId}"])
    fun editLocationForSpace(
        @PathVariable spaceUuid: String,
        @PathVariable locationId: Int,
        @Valid @RequestBody locationRequest: TagRequest
    ): ResponseEntity<SpaceLocation> {
        val editedLocation: SpaceLocation = locationService.editLocation(spaceUuid, locationRequest, locationId)
        return ResponseEntity.ok(editedLocation)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'write')")
    @DeleteMapping(path = ["/{locationId}"])
    fun deleteLocationForSpace(
        @PathVariable spaceUuid: String,
        @PathVariable locationId: Int
    ): ResponseEntity<Unit> {
        locationService.deleteLocation(locationId, spaceUuid)
        return ResponseEntity.ok().build()
    }
}
