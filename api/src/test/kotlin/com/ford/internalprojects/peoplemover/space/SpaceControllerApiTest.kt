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

package com.ford.internalprojects.peoplemover.space

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.assignment.AssignmentV1
import com.ford.internalprojects.peoplemover.auth.*
import com.ford.internalprojects.peoplemover.customfield.CustomFieldMapping
import com.ford.internalprojects.peoplemover.customfield.CustomFieldMappingRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.tag.person.PersonTag
import com.ford.internalprojects.peoplemover.tag.person.PersonTagRepository
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import com.ford.internalprojects.peoplemover.tag.product.ProductTagRepository
import com.ford.internalprojects.peoplemover.utilities.GOOD_TOKEN
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.Instant

@AutoConfigureMockMvc
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
    private lateinit var personTagRepository: PersonTagRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var productTagRepository: ProductTagRepository;

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    private lateinit var customFieldMappingRepository: CustomFieldMappingRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    var baseSpaceUrl: String = "/api/spaces"

    @AfterEach
    fun tearDown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        customFieldMappingRepository.deleteAll()
        spaceRepository.deleteAll()
        userSpaceMappingRepository.deleteAll()
        personRepository.deleteAll()
        personTagRepository.deleteAll()
    }

    @Test
    fun `POST should create Space and Add Current User to Space`() {
        val request = SpaceCreationRequest(spaceName = "New Space")
        val expectedUserId = "USER_ID"

        val result = mockMvc.perform(
            post("$baseSpaceUrl/user")
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $GOOD_TOKEN")
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
        assertThat(userSpaceMappings[0].spaceUuid).isEqualTo(actualSpaceResponse.space.uuid)
        assertThat(userSpaceMappings[0].permission).isEqualTo(PERMISSION_OWNER)
    }

    @Test
    fun `POST should throw exception when name is just ' '`() {
        val request = SpaceCreationRequest(spaceName = " ")

        mockMvc.perform(
            post("$baseSpaceUrl/user")
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer $GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isBadRequest)
            .andReturn()

        assertThat(spaceRepository.findAll()).isEmpty()
        val userSpaceMappings: List<UserSpaceMapping> = userSpaceMappingRepository.findAll()
        assertThat(userSpaceMappings).hasSize(0)
    }

    @Test
    fun `GET should return all spaces for current user`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))
        val space2: Space = spaceRepository.save(Space(name = "SpaceTwo"))
        spaceRepository.save(Space(name = "SpaceThree"))

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space1.uuid, permission = PERMISSION_OWNER))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space2.uuid, permission = PERMISSION_OWNER))

        val result = mockMvc.perform(
            get("$baseSpaceUrl/user")
                .header("Authorization", "Bearer $GOOD_TOKEN")
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

        userSpaceMappingRepository.save(
            UserSpaceMapping(
                userId = "USER_ID",
                spaceUuid = space1.uuid,
                permission = PERMISSION_OWNER
            )
        )

        customFieldMappingRepository.save(
            CustomFieldMapping(
                referenceName = "field1",
                vanityName = "cdsid",
                spaceUuid = space1.uuid
            )
        )

        val customFieldMapping = customFieldMappingRepository.findAll().first()

        val result = mockMvc.perform(
            get(baseSpaceUrl + "/" + space1.uuid)
                .header("Authorization", "Bearer $GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualSpace: Space = objectMapper.readValue(
            result.response.contentAsByteArray,
            Space::class.java
        )

        space1.customFieldLabels = listOf(customFieldMapping)

        assertThat(actualSpace).isEqualTo(space1)
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
                .header("Authorization", "Bearer $GOOD_TOKEN")
        )
            .andExpect(status().isBadRequest)
    }



    @Test
    @Transactional
    fun `PUT Edit Space Request should return 200 if space is edited correctly`() {
        val space = spaceRepository.save(Space(name = "test"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))
        val editedSpace = EditSpaceRequest(name = "edited")

        val result = mockMvc.perform(
                put("$baseSpaceUrl/${space.uuid}")
                        .header("Authorization", "Bearer $GOOD_TOKEN")
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
    fun `PUT Edit Space Request should change public view flag correctly`() {
        val space = spaceRepository.save(Space(name = "test", todayViewIsPublic = false))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))
        val spaceRequest = EditSpaceRequest(todayViewIsPublic = true)

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer $GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(spaceRequest))
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualSpace = spaceRepository.findByUuid(space.uuid)
        assertThat(actualSpace!!.todayViewIsPublic).isEqualTo(true)
    }

    @Test
    fun `PUT Edit Space Request should change both the name and the public view flag correctly`() {
        val space = spaceRepository.save(Space(name = "oldname", todayViewIsPublic = false))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        val expectedName = "newname"
        val expectedReadOnlyFlag = true
        val spaceRequest = EditSpaceRequest(name = expectedName, todayViewIsPublic = expectedReadOnlyFlag)

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer $GOOD_TOKEN")
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
    fun `PUT Edit Space Request should throw an exception if the new name consists only of space characters`() {
        val oldName = "old name"
        val space = spaceRepository.save(Space(name = oldName, todayViewIsPublic = false))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))
        val newName = " "
        val spaceRequest = EditSpaceRequest(name = newName)

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer $GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(spaceRequest))
        )
            .andExpect(status().isBadRequest)
            .andReturn()

        val actualSpace = spaceRepository.findByUuid(space.uuid)
            assertThat(actualSpace!!.name).isEqualTo(oldName)
    }

    @Test
    @Transactional
    fun `PUT Edit Space Request should not save if no fields populated`() {
        val expectedTimeStamp = Timestamp.from(Instant.EPOCH)
        val space = spaceRepository.save(
                Space(
                        name = "oldName",
                        todayViewIsPublic = false,
                        lastModifiedDate = expectedTimeStamp
                )
        )
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        val spaceRequest = EditSpaceRequest()

        val result = mockMvc.perform(
                put("$baseSpaceUrl/${space.uuid}")
                        .header("Authorization", "Bearer $GOOD_TOKEN")
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
    fun `POST Edit Space Request New Space Name is Too Long`() {
        val editedSpace = EditSpaceRequest(name = "12345678901234567890123456789012345678901")

        mockMvc.perform(
            post("$baseSpaceUrl/user")
                .header("Authorization", "Bearer $GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editedSpace)))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT Edit Space Request New Space Name is Too Long`() {
        val space = spaceRepository.save(Space(name = "space"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        val editedSpace = EditSpaceRequest(name = "12345678901234567890123456789012345678901")

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
            .header("Authorization", "Bearer $GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(editedSpace)))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT Edit Space Request should return 403 when trying to edit space without write authorization`() {
        val space = spaceRepository.save(Space(name = "space_that_nobody_has_write_access_to"))

        val requestBodyObject = EditSpaceRequest("not empty")

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer $GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject))
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `PUT Edit Space Request should not change the name of a space if name is null`() {
        val expectedName = "oldname"
        val space = spaceRepository.save(Space(name = expectedName))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))
        val editedSpace = EditSpaceRequest(name = null)

        mockMvc.perform(
            put("$baseSpaceUrl/${space.uuid}")
                .header("Authorization", "Bearer $GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editedSpace))
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualSpace = spaceRepository.findByUuid(space.uuid)
        assertThat(actualSpace!!.name).isEqualTo(expectedName)
    }

    //region DELETE
    @Test
    fun `DEL should return 200 if space was deleted`() {
        val space = spaceRepository.save(Space(name = "spacespacespace"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))


        mockMvc.perform(
                delete("$baseSpaceUrl/${space.uuid}")
                        .header("Authorization", "Bearer $GOOD_TOKEN")
        )
                .andExpect(status().isOk)

        assertThat(spaceRepository.count()).isZero()
    }

    @Test
    fun `DEL should return 403 when trying to edit space without owner authorization`() {
        val space = spaceRepository.save(Space(name = "memberspace"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_EDITOR))
        mockMvc.perform(
                delete("$baseSpaceUrl/${space.uuid}")
                        .header("Authorization", "Bearer $GOOD_TOKEN")
        )
                .andExpect(status().isForbidden)
    }

    @Test
    fun `DEL should return 401 when token is not valid`() {
        val token = "INVALID_TOKEN"

        mockMvc.perform(
                delete("$baseSpaceUrl/abcd")
                        .header("Authorization", "Bearer $token")
        )
                .andExpect(status().isUnauthorized)
    }

    @Test
    fun `DEL should return 400 if space does not exist`() {
        val space = spaceRepository.save(Space(name = "spacespacespace"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))


        mockMvc.perform(
                delete("$baseSpaceUrl/badSpace")
                        .header("Authorization", "Bearer $GOOD_TOKEN")
        )
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST Duplicate space request should return 200 if successful` () {
        val space = spaceRepository.save(Space(name = "spacespacespace"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        val personTag = PersonTag(null, space.uuid, "big brain")
        personTagRepository.save(personTag)

        val person = Person(name = "test person", spaceUuid = space.uuid, tags = setOf(personTag))
        personRepository.save(person)

        val productTag = ProductTag(spaceUuid = space.uuid, name = "fake product tag")
        productTagRepository.save(productTag)

        val product = Product(name = "fake product", spaceUuid = space.uuid, tags = setOf(productTag))
        productRepository.save(product)

        val assignment = AssignmentV1(person = person, spaceUuid = space.uuid, productId = product.id!!)
        assignmentRepository.save(assignment)

        val mvcResult = mockMvc.perform(
                post("$baseSpaceUrl/duplicate/${space.uuid}")
                        .header("Authorization", "Bearer $GOOD_TOKEN")
        )
                .andExpect(status().isOk)
                .andReturn()

        val body: SpaceResponse = objectMapper.readValue(mvcResult.response.contentAsString, SpaceResponse::class.java)

        val newSpaceUuid = body.space.uuid
        val newSpace = spaceRepository.findByUuid(newSpaceUuid)
        assertNotNull(newSpace)

        val newSpaceTag = personTagRepository.findAllBySpaceUuidAndNameIgnoreCase(newSpaceUuid, personTag.name)
        assertNotNull(newSpaceTag)

        val userInNewSpace = userSpaceMappingRepository.findByUserIdAndSpaceUuid("USER_ID", newSpaceUuid)
        assertTrue(userInNewSpace.isPresent)

        val peopleInNewSpace = personRepository.findAllBySpaceUuid(newSpaceUuid)
        assertFalse(peopleInNewSpace.isEmpty())
        assertEquals(peopleInNewSpace[0].name, person.name)

        val productInNewSpace = productRepository.findProductByNameAndSpaceUuid(product.name, newSpaceUuid)
        assertNotNull(productInNewSpace)

        val productTagInNewSpace = productTagRepository.findAllBySpaceUuidAndNameIgnoreCase(newSpaceUuid, productTag.name)
        assertNotNull(productTagInNewSpace)

        val assignmentsInNewSpace = assignmentRepository.findAllBySpaceUuid(newSpaceUuid)
        assertTrue(assignmentsInNewSpace.size == 1)
    }

    @Test
    fun `POST duplicate space should return 409 if space name duplicate already exists` () {
        val space = spaceRepository.save(Space(name = "spacespacespace"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        // Create fake duplicate
        spaceRepository.save(Space(name = "spacespacespace - Duplicate"))

        mockMvc.perform(
                post("$baseSpaceUrl/duplicate/${space.uuid}")
                        .header("Authorization", "Bearer $GOOD_TOKEN")
        )
                .andExpect(status().isConflict)
                .andReturn()
    }

    //endregion
}
