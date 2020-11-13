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

    private lateinit var space: Space

    var baseLocationsUrl: String = ""

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "tok"))

        baseLocationsUrl = "/api/spaces/" + space.uuid + "/locations"
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
                spaceLocationRepository.save(SpaceLocation(spaceId = space.id!!, name = "Mars")),
                spaceLocationRepository.save(SpaceLocation(spaceId = space.id!!, name = "Venus"))
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
    fun `GET should return 400 when given bad space`() {
        val badLocationsUrl = "/api/spaces/tok1/locations"
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
        spaceLocationRepository.save(SpaceLocation(spaceId = space.id!!, name = "Germany"))
        val duplicateLocationAddRequest = LocationAddRequest(name = "Germany")
        mockMvc.perform(post(baseLocationsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(duplicateLocationAddRequest)))
            .andExpect(status().isConflict)
    }

    @Test
    fun `POST should add new space location to db and return it`() {
        val locationAddRequest = LocationAddRequest(name = "Germany")
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
        assertThat(actualSpaceLocation.spaceId).isEqualTo(space.id)

        assertThat(spaceLocationRepository.findBySpaceIdAndNameIgnoreCase(
            space.id!!,
            locationAddRequest.name
        )).isNotNull()
    }

    @Test
    fun `POST should return 400 when space does not exist`() {
        val location = LocationAddRequest(name = "Germany")
        val badLocationsUrl = "/api/spaces/okt/locations"
        mockMvc.perform(post(badLocationsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(location)))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should update a location and return 200`() {
        val spaceLocation: SpaceLocation = spaceLocationRepository.save(SpaceLocation(spaceId = space.id!!, name = "Germany"))
        val locationEditRequest = LocationEditRequest(id = spaceLocation.id!!, name = "Dearborn")
        val result = mockMvc.perform(put(baseLocationsUrl)
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

        assertThat(spaceLocationRepository.findBySpaceIdAndNameIgnoreCase(
            actualSpaceLocation.spaceId,
            actualSpaceLocation.name
        )).isNotNull()
    }

    @Test
    fun `PUT should return 409 when updating name to existing space location in space`() {
        val spaceLocation1: SpaceLocation = spaceLocationRepository.save(SpaceLocation(spaceId = space.id!!, name = "Germany"))
        val spaceLocation2: SpaceLocation = spaceLocationRepository.save(SpaceLocation(spaceId = space.id!!, name = "France"))
        val locationEditRequest = LocationEditRequest(spaceLocation2.id!!, spaceLocation1.name.toLowerCase())
        mockMvc.perform(put(baseLocationsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(locationEditRequest)))
            .andExpect(status().isConflict)
    }

    @Test
    fun `DELETE should delete location from space`() {
        val spaceLocation: SpaceLocation = spaceLocationRepository.save(SpaceLocation(spaceId = space.id!!, name = "Germany"))
        mockMvc.perform(delete("$baseLocationsUrl/${spaceLocation.id}")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isOk)

        assertThat(spaceLocationRepository.count()).isZero()
    }

    @Test
    fun `DELETE should delete space location from product`() {
        val location: SpaceLocation = spaceLocationRepository.save(SpaceLocation(spaceId = space.id!!, name = "Germany"))
        val originalProduct: Product = productRepository.save(
            Product(
                name = "Product1",
                spaceLocation = location,
                spaceId = space.id!!
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