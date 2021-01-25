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

package com.ford.internalprojects.peoplemover.space

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.auth.*
import com.ford.internalprojects.peoplemover.product.ProductRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
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
import java.sql.Timestamp
import java.time.Instant
import java.util.*

@AutoConfigureMockMvc
@RunWith(SpringRunner::class)
@ActiveProfiles("test")
@SpringBootTest
class SpaceControllerApiTest {
    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    var baseSpaceUrl: String = "/api/spaces"

    @After
    fun tearDown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        spaceRepository.deleteAll()
        userSpaceMappingRepository.deleteAll()
    }

    @Test
    fun `POST should create Space and Add Current User to Space`() {
        val request = SpaceCreationRequest(spaceName = "New Space")
        val accessToken = "TOKEN"
        val expectedUserId = "USER_ID"

        val result = mockMvc.perform(
            post("$baseSpaceUrl/user")
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $accessToken")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualSpaceResponse: SpaceResponse = objectMapper.readValue(
            result.response.contentAsString,
            SpaceResponse::class.java
        )
        assertThat(actualSpaceResponse.space.name).isEqualTo(request.spaceName)
        assertThat(actualSpaceResponse.space.createdBy).isEqualTo(expectedUserId)
        assertThat(spaceRepository.findAll().first().name).isEqualTo(request.spaceName)
        val userSpaceMappings: List<UserSpaceMapping> = userSpaceMappingRepository.findAll()
        assertThat(userSpaceMappings).hasSize(1)
        assertThat(userSpaceMappings[0].userId).isEqualTo(expectedUserId)
        assertThat(userSpaceMappings[0].spaceId).isEqualTo(actualSpaceResponse.space.id)
    }

    @Test
    fun `POST should return 401 when token is not valid`() {
        val request = SpaceCreationRequest(spaceName = "New Space")
        val token = "INVALID_TOKEN"

        mockMvc.perform(
            post("$baseSpaceUrl/user")
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isUnauthorized)

        assertThat(spaceRepository.count()).isZero()
    }

    @Test
    fun `GET should return all spaces`() {
        val space1: Space = spaceRepository.save(Space(name = "Ken Masters"))
        val space2: Space = spaceRepository.save(Space(name = "KenM"))
        val space3: Space = spaceRepository.save(Space(name = "Ken Starr"))

        val result = mockMvc.perform(
            get(baseSpaceUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk).andReturn()

        val actual: List<Space> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Space::class.java)
        )

        assertThat(actual[0]).isEqualTo(space1)
        assertThat(actual[1]).isEqualTo(space2)
        assertThat(actual[2]).isEqualTo(space3)
    }

    @Test
    fun `GET should return the number of spaces`() {
        spaceRepository.save(Space(name = "Ken Masters"))
        spaceRepository.save(Space(name = "KenM"))
        spaceRepository.save(Space(name = "Ken Starr"))

        val result = mockMvc.perform(
            get("$baseSpaceUrl/total")
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk).andReturn()

        val actual: Int = result.response.contentAsString.toInt()

        assertThat(actual).isEqualTo(3)
    }

    @Test
    fun `GET should return all spaces for current user`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))
        val space2: Space = spaceRepository.save(Space(name = "SpaceTwo"))
        spaceRepository.save(Space(name = "SpaceThree"))

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceId = space1.id, spaceUuid = space1.uuid))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceId = space2.id, spaceUuid = space2.uuid))

        val accessToken = "TOKEN"

        val result = mockMvc.perform(
            get("$baseSpaceUrl/user")
                .header("Authorization", "Bearer $accessToken")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualUserSpaces: Array<Space> = objectMapper.readValue(
            result.response.contentAsString,
            Array<Space>::class.java
        )

        assertThat(actualUserSpaces).hasSize(2)
        assertThat(actualUserSpaces).contains(space1)
        assertThat(actualUserSpaces).contains(space2)
    }

    @Test
    fun `GET should return correct space for current user`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceId = space1.id, spaceUuid = space1.uuid))

        val result = mockMvc.perform(
            get(baseSpaceUrl + "/" + space1.uuid)
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualSpace: Space = objectMapper.readValue(
            result.response.contentAsString,
            Space::class.java
        )

        assertThat(actualSpace).isEqualTo(space1)
    }

    @Test
    fun `GET should return 403 when valid token does not have read access and the space's read-only flag is off`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne", todayViewIsPublic = false))

        mockMvc.perform(
            get(baseSpaceUrl + "/" + space1.uuid)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        )
            .andExpect(status().isForbidden)
            .andReturn()
    }

    @Test
    fun `GET should return 200 when valid token that isn't an editor requests a space while read-only flag is on`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne", todayViewIsPublic = true))

        mockMvc.perform(
            get(baseSpaceUrl + "/" + space1.uuid)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()
    }

    @Test
    fun `GET should return 401 when access token is invalid`() {
        val accessToken = "INVALID_TOKEN"
        mockMvc.perform(
            get("$baseSpaceUrl/user")
                .header("Authorization", "Bearer $accessToken")
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `GET should return 400 if space does not exist`() {
        mockMvc.perform(
            get("$baseSpaceUrl/badSpace")
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `Edit Space Request should return 200 if space is edited correctly`() {
        val space = spaceRepository.save(Space(name = "test"))
        userSpaceMappingRepository.save(UserSpaceMapping(spaceId = space.id!!, userId = "USER_ID", spaceUuid = space.uuid))
        val editedSpace = EditSpaceRequest(name = "edited")

        val result = mockMvc.perform(
                put("$baseSpaceUrl/${space.uuid}")
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(editedSpace))
        )
                .andExpect(status().isOk)
                .andReturn()

        val returnedSpace: Space = objectMapper.readValue(
                result.response.contentAsString,
                Space::class.java
        )

        val actualSpace = spaceRepository.findByUuid(space.uuid)
        assertThat(actualSpace!!.name).isEqualTo("edited")
        assertThat(returnedSpace).isEqualTo(actualSpace)
    }

    @Test
    fun `Edit Space Request should change public view flag correctly`() {
        val space = spaceRepository.save(Space(name = "test", todayViewIsPublic = false))
        userSpaceMappingRepository.save(UserSpaceMapping(spaceId = space.id!!, userId = "USER_ID", spaceUuid = space.uuid))
        val spaceRequest = EditSpaceRequest(todayViewIsPublic = true)

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(spaceRequest))
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualSpace = spaceRepository.findByUuid(space.uuid)
        assertThat(actualSpace!!.todayViewIsPublic).isEqualTo(true)
    }

    @Test
    fun `Edit Space Request should change both the name and the public view flag correctly`() {
        val space = spaceRepository.save(Space(name = "oldname", todayViewIsPublic = false))
        userSpaceMappingRepository.save(UserSpaceMapping(spaceId = space.id!!, userId = "USER_ID", spaceUuid = space.uuid))

        val expectedName = "newname"
        val expectedReadOnlyFlag = true
        val spaceRequest = EditSpaceRequest(name = expectedName, todayViewIsPublic = expectedReadOnlyFlag)

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(spaceRequest))
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualSpace = spaceRepository.findByUuid(space.uuid)
        assertThat(actualSpace!!.todayViewIsPublic).isEqualTo(expectedReadOnlyFlag)
        assertThat(actualSpace.name).isEqualTo(expectedName)
    }

    @Test
    fun `Edit Space Request should not save if no fields populated`() {
        val expectedTimeStamp = Timestamp.from(Instant.EPOCH)
        val space = spaceRepository.save(
                Space(
                        name = "oldName",
                        todayViewIsPublic = false,
                        lastModifiedDate = expectedTimeStamp
                )
        )
        userSpaceMappingRepository.save(UserSpaceMapping(spaceId = space.id!!, userId = "USER_ID", spaceUuid = space.uuid))

        val spaceRequest = EditSpaceRequest()

        val result = mockMvc.perform(
                put("$baseSpaceUrl/${space.uuid}")
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(spaceRequest))
        )
                .andExpect(status().isOk)
                .andReturn()

        val returnedSpace: Space = objectMapper.readValue(
                result.response.contentAsString,
                Space::class.java
        )

        val actualSpace = spaceRepository.findByUuid(space.uuid)
        assertThat(actualSpace!!.lastModifiedDate).isEqualTo(expectedTimeStamp)
        assertThat(returnedSpace).isEqualTo(actualSpace)
    }

    @Test
    fun `Edit Space Request New Space Name is Too Long`() {
        val space = spaceRepository.save(Space(name = "space"))
        userSpaceMappingRepository.save(UserSpaceMapping(spaceId = space.id!!, userId = "USER_ID", spaceUuid = space.uuid))

        val editedSpace = EditSpaceRequest(name = "12345678901234567890123456789012345678901")

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editedSpace))
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `Edit Space Request should return 403 when trying to edit space without write authorization`() {
        val space = spaceRepository.save(Space(name = "space_that_nobody_has_write_access_to"))

        val requestBodyObject = EditSpaceRequest("not empty")

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject))
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `Edit Space Request should not change the name of a space if name is null`() {
        val expectedName = "oldname"
        val space = spaceRepository.save(Space(name = expectedName))
        userSpaceMappingRepository.save(UserSpaceMapping(spaceId = space.id!!, userId = "USER_ID", spaceUuid = space.uuid))
        val editedSpace = EditSpaceRequest(name = null)

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editedSpace))
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualSpace = spaceRepository.findByUuid(space.uuid)
        assertThat(actualSpace!!.name).isEqualTo(expectedName)
    }

    @Test
    fun `Invite Users Request should return Ok and an empty list with a valid ADFS request`() {
        val emails = listOf("email_1@email.com", "email_2@otheremail.com")

        val space = spaceRepository.save(Space(name = "spaceName"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceId = space.id, spaceUuid = space.uuid))

        val request = AuthInviteUsersToSpaceRequest(emails = emails)

        val result = mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}:invite")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json")
        ).andExpect(
            status().isOk
        ).andReturn()

        assertThat(result.response.contentLength).isEqualTo(0)

        val savedIds: List<String> = userSpaceMappingRepository.findAll().map { it.userId!! }

        assertThat(userSpaceMappingRepository.count()).isEqualTo(3)
        assertThat(savedIds).contains("USER_ID")
        assertThat(savedIds).contains("EMAIL_1")
        assertThat(savedIds).contains("EMAIL_2")
    }

    @Test
    fun `Invite Users Request should return BAD_REQUEST if no emails were provided`() {
        val request = AuthInviteUsersToSpaceRequest(
            emails = listOf()
        )

        val space = spaceRepository.save(Space(name = "spaceName"))

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}:invite")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .content(objectMapper.writeValueAsString(request))
                .contentType("application/json")
        ).andExpect(
            status().isBadRequest
        )
    }

    @Test
    fun `Invite Users Request should return 403 when trying to add users to space without write authorization`() {
        val space = spaceRepository.save(Space(name = "spaceName"))

        val requestBodyObject =
            AuthInviteUsersToSpaceRequest(emails = listOf("email_1@email.com", "email_2@otheremail.com"))

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}:invite")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject))
        )
            .andExpect(status().isForbidden)
    }
}
