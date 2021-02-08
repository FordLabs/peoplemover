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

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.google.common.collect.Sets.newHashSet
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@AutoConfigureMockMvc
@RunWith(SpringRunner::class)
@ActiveProfiles("test")
@SpringBootTest
class LocationControllerApiTest {

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    private lateinit var space: Space
    private lateinit var spaceWithoutAccess: Space

    var baseLocationsUrl: String = ""

    private fun getBaseLocationsUrl(spaceUuid: String) = "/api/spaces/$spaceUuid/locations"

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "tok"))
        spaceWithoutAccess = spaceRepository.save(Space(name = "tik"))

        baseLocationsUrl = getBaseLocationsUrl(space.uuid)
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid))

    }

    @After
    fun tearDown() {
        spaceLocationRepository.deleteAll()
        productRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `GET should get Locations`() {
        val expectedLocations: Set<SpaceLocation> = newHashSet(
                spaceLocationRepository.save(SpaceLocation(name = "Mars", spaceUuid = space.uuid)),
                spaceLocationRepository.save(SpaceLocation(name = "Venus", spaceUuid = space.uuid))
        )

        val result = mockMvc.perform(get(baseLocationsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualSpaceLocations: Set<SpaceLocation> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, SpaceLocation::class.java)
        )

        assertThat(actualSpaceLocations).isEqualTo(expectedLocations)
    }


    @Test
    fun `GET should return 403 when valid token does not have editor access and the space's read-only flag is off`() {
        mockMvc.perform(
            get(getBaseLocationsUrl(space.uuid))
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `GET should return 200 when valid token does not have editor access and the space's read-only flag is on`() {
        val readOnlySpace = spaceRepository.save(Space(name = "readme", todayViewIsPublic = true))

        mockMvc.perform(
            get(getBaseLocationsUrl(readOnlySpace.uuid))
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        ).andExpect(status().isOk)
    }

    @Test
    fun `GET should return 400 when given bad space`() {
        val badLocationsUrl = getBaseLocationsUrl("tok1")
        mockMvc.perform(get(badLocationsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `GET should return an empty set when no expected locations in db`() {
        val result = mockMvc.perform(get(baseLocationsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()
        val actualSpaceLocations: Set<SpaceLocation> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, SpaceLocation::class.java)
        )
        assertThat(actualSpaceLocations).isEqualTo(emptySet<SpaceLocation>())
    }

    @Test
    fun `POST should return 409 conflict when trying to add a duplicate space location to a space`() {
        spaceLocationRepository.save(SpaceLocation(name = "Germany", spaceUuid = space.uuid))
        val duplicateLocationAddRequest = LocationRequest(name = "Germany")
        mockMvc.perform(post(baseLocationsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateLocationAddRequest)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `POST should return 400 bad request when trying to add a space location with an empty name`() {
        val locationWithEmptyName = LocationRequest(name = "")
        mockMvc.perform(post(baseLocationsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationWithEmptyName)))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST should add new space location to db and return it`() {
        val locationAddRequest = LocationRequest(name = "Germany")
        val result = mockMvc.perform(post(baseLocationsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationAddRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val actualSpaceLocation: SpaceLocation = objectMapper.readValue(
                result.response.contentAsString,
                SpaceLocation::class.java
        )
        assertThat(actualSpaceLocation.name).isEqualTo(locationAddRequest.name)
        assertThat(actualSpaceLocation.spaceUuid).isEqualTo(space.uuid)

        assertThat(spaceLocationRepository.findBySpaceUuidAndNameIgnoreCase(
                space.uuid,
                locationAddRequest.name
        )).isNotNull()
    }

    @Test
    fun `POST should return 403 when trying to add location without write authorization`() {
        val requestBodyObject = LocationRequest("it's lockdown there is no where BUT home")

        mockMvc.perform(post(baseLocationsUrl)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `PUT should update a location and return 200`() {
        val spaceLocation: SpaceLocation = spaceLocationRepository.save(SpaceLocation(name = "Germany", spaceUuid = space.uuid))
        val locationEditRequest = LocationRequest(name = "Dearborn")
        val result = mockMvc.perform(put("$baseLocationsUrl/${spaceLocation.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationEditRequest)))
                .andExpect(status().isOk)
                .andReturn()
        val actualSpaceLocation: SpaceLocation = objectMapper.readValue(
                result.response.contentAsString,
                SpaceLocation::class.java
        )
        assertThat(actualSpaceLocation.id).isEqualTo(spaceLocation.id!!)
        assertThat(actualSpaceLocation.name).isEqualTo(locationEditRequest.name)

        assertThat(spaceLocationRepository.findBySpaceUuidAndNameIgnoreCase(
                actualSpaceLocation.spaceUuid,
                actualSpaceLocation.name
        )).isNotNull
    }

    @Test
    fun `PUT should return 403 when trying to edit location without write authorization`() {
        val requestBodyObject = LocationRequest("me and you, and you and me, so HAAPPPY TOGEEEETHERRRRRRR")

        mockMvc.perform(put("$baseLocationsUrl/1")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `PUT should return 400 when trying to edit location that is not in the space you have access to`() {
        val spaceLocationWithoutAccess = spaceLocationRepository.save(
            SpaceLocation(
                spaceUuid = spaceWithoutAccess.uuid,
                name = "Ann Arbor"
            )
        )

        val requestBodyObject = LocationRequest("me and you, and you and me, so HAAPPPY TOGEEEETHERRRRRRR")

        mockMvc.perform(put("$baseLocationsUrl/${spaceLocationWithoutAccess.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should return 200 when updating name to existing space location in space with different case`() {
        val spaceLocation1: SpaceLocation = spaceLocationRepository.save(SpaceLocation(name = "Germany", spaceUuid = space.uuid))
        val spaceLocation2: SpaceLocation = spaceLocationRepository.save(SpaceLocation(name = "France", spaceUuid = space.uuid))
        val locationEditRequest = LocationRequest(spaceLocation1.name.toLowerCase())
        mockMvc.perform(put("$baseLocationsUrl/${spaceLocation2.id}")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(locationEditRequest)))
            .andExpect(status().isOk)
    }

    @Test
    fun `PUT should return 409 when updating name to existing space location to be the same as another space location`() {
        val spaceLocation1: SpaceLocation = spaceLocationRepository.save(SpaceLocation(name = "Germany", spaceUuid = space.uuid))
        val spaceLocation2: SpaceLocation = spaceLocationRepository.save(SpaceLocation(name = "France", spaceUuid = space.uuid))

        val locationEditRequest = LocationRequest(spaceLocation1.name)
        mockMvc.perform(put("$baseLocationsUrl/${spaceLocation2.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationEditRequest)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `DELETE should delete location from space`() {
        val spaceLocation: SpaceLocation = spaceLocationRepository.save(SpaceLocation(name = "Germany", spaceUuid = space.uuid))
        mockMvc.perform(delete("$baseLocationsUrl/${spaceLocation.id}")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)

        assertThat(spaceLocationRepository.count()).isZero()
    }

    @Test
    fun `DELETE should return 403 when trying to delete location without write authorization`() {
        val spaceLocation: SpaceLocation = spaceLocationRepository.save(SpaceLocation(name = "Deutschland", spaceUuid = space.uuid))

        mockMvc.perform(delete("$baseLocationsUrl/${spaceLocation.id!!}")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN"))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `DELETE should return 400 when trying to delete location that is not in the space you have access to`() {
        val spaceLocationWithoutAccess: SpaceLocation = spaceLocationRepository.save(
            SpaceLocation(
                name = "Deutschland",
                spaceUuid = spaceWithoutAccess.uuid
            )
        )

        mockMvc.perform(delete("$baseLocationsUrl/${spaceLocationWithoutAccess.id!!}")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should delete space location from product`() {
        val location: SpaceLocation = spaceLocationRepository.save(SpaceLocation(name = "Germany", spaceUuid = space.uuid))
        val originalProduct: Product = productRepository.save(
                Product(
                        name = "Product1",
                        spaceLocation = location,
                        spaceUuid = space.uuid
                )
        )
        assertThat(spaceLocationRepository.count()).isOne()
        mockMvc.perform(delete("$baseLocationsUrl/${location.id}")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
        assertThat(spaceLocationRepository.count()).isZero()

        val updatedProduct: Product = productRepository.findById(originalProduct.id!!).get()
        assertThat(updatedProduct.spaceLocation).isNull()
    }
}
