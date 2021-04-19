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

package com.ford.internalprojects.peoplemover.user

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.auth.*
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.assertj.core.api.Assertions
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers


@AutoConfigureMockMvc
@RunWith(SpringRunner::class)
@ActiveProfiles("test")
@SpringBootTest
internal class UserControllerApiTest {
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
    fun `Invite Users Request should return Ok and an empty list with a valid ADFS request`() {
        val emails = listOf("email1", "email2")

        val space = spaceRepository.save(Space(name = "spaceName"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        val request = AuthInviteUsersToSpaceRequest(userIds = emails)

        val result = mockMvc.perform(
                MockMvcRequestBuilders.post("$baseSpaceUrl/${space.uuid}/users")
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .content(objectMapper.writeValueAsString(request))
                        .contentType("application/json")
        ).andExpect(
                MockMvcResultMatchers.status().isOk
        ).andReturn()

        Assertions.assertThat(result.response.contentLength).isEqualTo(0)

        val savedIds = userSpaceMappingRepository.findAll().map { Pair(it.userId!!, it.permission)}

        Assertions.assertThat(userSpaceMappingRepository.count()).isEqualTo(3)
        Assertions.assertThat(savedIds).contains(Pair("USER_ID", PERMISSION_OWNER))
        Assertions.assertThat(savedIds).contains(Pair("EMAIL1", PERMISSION_EDITOR))
        Assertions.assertThat(savedIds).contains(Pair("EMAIL2", PERMISSION_EDITOR))
    }

    @Test
    fun `Invite Users Request should return BAD_REQUEST if no cdsids were provided`() {
        val request = AuthInviteUsersToSpaceRequest(
                userIds = listOf()
        )

        val space = spaceRepository.save(Space(name = "spaceName"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        mockMvc.perform(
                MockMvcRequestBuilders.post("$baseSpaceUrl/${space.uuid}/users")
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .content(objectMapper.writeValueAsString(request))
                        .contentType("application/json")
        ).andExpect(
                MockMvcResultMatchers.status().isBadRequest
        )
    }

    @Test
    fun `Invite Users Request should return 403 when trying to add users to space without write authorization`() {
        val space = spaceRepository.save(Space(name = "spaceName"))

        val requestBodyObject =
                AuthInviteUsersToSpaceRequest(userIds = listOf("email1", "email2"))

        mockMvc.perform(
                MockMvcRequestBuilders.post("$baseSpaceUrl/${space.uuid}/users")
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBodyObject))
        )
                .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Test
    fun `Invite Users Request should return BAD_REQUEST if cdsids are not valid`() {
        val request = AuthInviteUsersToSpaceRequest(
                userIds = listOf("abc12", "1@5")
        )

        val space = spaceRepository.save(Space(name = "spaceName"))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        mockMvc.perform(
                MockMvcRequestBuilders.post("$baseSpaceUrl/${space.uuid}/users")
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .content(objectMapper.writeValueAsString(request))
                        .contentType("application/json")
        ).andExpect(
                MockMvcResultMatchers.status().isBadRequest
        )
    }

    @Test
    fun `Set owner request should return 403 when trying to set owner with editor permissions`() {
        val space = spaceRepository.save(Space(name = "spaceName"))

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_EDITOR))

        mockMvc.perform(
                MockMvcRequestBuilders.put("$baseSpaceUrl/${space.uuid}/users/USER_ID")
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Test
    fun `Set owner request should return 200 when owner tries to assign ownership to an editor`() {
        val space = spaceRepository.save(Space(name = "spaceName"))

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "EDITOR_ID", spaceUuid = space.uuid, permission = PERMISSION_EDITOR))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        mockMvc.perform(
                MockMvcRequestBuilders.put("$baseSpaceUrl/${space.uuid}/users/EDITOR_ID")
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(MockMvcResultMatchers.status().isOk)

        Assertions.assertThat(userSpaceMappingRepository.findAllByUserId("EDITOR_ID")[0].permission).isEqualTo(PERMISSION_OWNER)
        Assertions.assertThat(userSpaceMappingRepository.findAllByUserId("USER_ID")[0].permission).isEqualTo(PERMISSION_EDITOR)
    }

    @Test
    fun `Set owner request should return 400 when owner tries to assign ownership to an editor that does not exist`() {
        val space = spaceRepository.save(Space(name = "spaceName"))

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "EDITOR_ID", spaceUuid = space.uuid, permission = PERMISSION_EDITOR))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))

        mockMvc.perform(
                MockMvcRequestBuilders.put("$baseSpaceUrl/${space.uuid}/users/INVALID_ID")
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(MockMvcResultMatchers.status().isBadRequest)

        Assertions.assertThat(userSpaceMappingRepository.findAllByUserId("EDITOR_ID")[0].permission).isEqualTo(PERMISSION_EDITOR)
        Assertions.assertThat(userSpaceMappingRepository.findAllByUserId("USER_ID")[0].permission).isEqualTo(PERMISSION_OWNER)
    }


    @Test
    fun `GET should return 403 if the user does not have write access to the space`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space1.uuid, permission = "editor"))

        mockMvc.perform(
                MockMvcRequestBuilders.get(baseSpaceUrl + "/${space1.uuid}/users")
                        .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        )
                .andExpect(MockMvcResultMatchers.status().isForbidden)
                .andReturn()
    }

    @Test
    fun `GET should return 403 if the space does not exist`() {
        mockMvc.perform(
                MockMvcRequestBuilders.get(baseSpaceUrl + "/aaaaaaaa-aaaa-aaaa-aaaa-badspace1234/users")
                        .header("Authorization", "Bearer GOOD_TOKEN")
        )
                .andExpect(MockMvcResultMatchers.status().isForbidden)
                .andReturn()
    }

    @Test
    fun `GET should return all users for a space`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))

        val user1 = UserSpaceMapping(userId = "USER_ID", spaceUuid = space1.uuid, permission = "owner")
        val user2 = UserSpaceMapping(userId = "ANOTHER_USER_ID", spaceUuid = space1.uuid, permission = "editor")
        val user3 = UserSpaceMapping(userId = "", spaceUuid = space1.uuid, permission = "editor")
        val user4 = UserSpaceMapping(userId = null, spaceUuid = space1.uuid, permission = "editor")
        userSpaceMappingRepository.save(user1)
        userSpaceMappingRepository.save(user2)
        userSpaceMappingRepository.save(user3)
        userSpaceMappingRepository.save(user4)

        val result = mockMvc.perform(
                MockMvcRequestBuilders.get(baseSpaceUrl + "/${space1.uuid}/users")
                        .header("Authorization", "Bearer GOOD_TOKEN")
        )
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andReturn()

        val returnedEditors: List<UserSpaceMapping> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, UserSpaceMapping::class.java)
        )

        Assertions.assertThat(returnedEditors).hasSize(4)
        Assertions.assertThat(returnedEditors).contains(user1);
        Assertions.assertThat(returnedEditors).contains(user2);
        Assertions.assertThat(returnedEditors).contains(user3);
        Assertions.assertThat(returnedEditors).contains(user4);

    }


    @Test
    fun `DELETE should remove user for a space`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))

        val user1 = UserSpaceMapping(userId = "USER_ID", spaceUuid = space1.uuid, permission = "owner")
        val user2 = UserSpaceMapping(userId = "ANOTHER_USER_ID", spaceUuid = space1.uuid, permission = "editor")
        userSpaceMappingRepository.save(user1)
        userSpaceMappingRepository.save(user2)

        mockMvc.perform(
                MockMvcRequestBuilders.delete(baseSpaceUrl + "/${space1.uuid}/users/${user2.userId}")
                        .header("Authorization", "Bearer GOOD_TOKEN")
        )
                .andExpect(MockMvcResultMatchers.status().isOk)

        val users = userSpaceMappingRepository.findAllBySpaceUuid(space1.uuid)

        Assertions.assertThat(users).hasSize(1)
        Assertions.assertThat(users).contains(user1);
        Assertions.assertThat(users).doesNotContain(user2);
    }

    @Test
    fun `DELETE should return 403 if the user does not have write access to the space`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))

        val user1 = UserSpaceMapping(userId = "USER_ID", spaceUuid = space1.uuid, permission = "owner")
        val user2 = UserSpaceMapping(userId = "ANOTHER_USER_ID", spaceUuid = space1.uuid, permission = "editor")
        userSpaceMappingRepository.save(user1)
        userSpaceMappingRepository.save(user2)

        mockMvc.perform(
                MockMvcRequestBuilders.delete(baseSpaceUrl + "/${space1.uuid}/users/${user2.userId}")
                        .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        )
                .andExpect(MockMvcResultMatchers.status().isForbidden)
                .andReturn()

        val users = userSpaceMappingRepository.findAllBySpaceUuid(space1.uuid)

        Assertions.assertThat(users).hasSize(2)
        Assertions.assertThat(users).contains(user1);
        Assertions.assertThat(users).contains(user2);
    }

    @Test
    fun `DELETE should return 406 if the caller tries to delete owner`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))

        val user1 = UserSpaceMapping(userId = "USER_ID", spaceUuid = space1.uuid, permission = "owner")
        val user2 = UserSpaceMapping(userId = "ANOTHER_USER_ID", spaceUuid = space1.uuid, permission = "editor")
        userSpaceMappingRepository.save(user1)
        userSpaceMappingRepository.save(user2)

        mockMvc.perform(
                MockMvcRequestBuilders.delete(baseSpaceUrl + "/${space1.uuid}/users/${user1.userId}")
                        .header("Authorization", "Bearer GOOD_TOKEN")
        )
                .andExpect(MockMvcResultMatchers.status().isNotAcceptable)
                .andReturn()

        val users = userSpaceMappingRepository.findAllBySpaceUuid(space1.uuid)

        Assertions.assertThat(users).hasSize(2)
        Assertions.assertThat(users).contains(user1);
        Assertions.assertThat(users).contains(user2);
    }

    @Test
    fun `DELETE should return 400 if the user doesn't exist`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))

        val user1 = UserSpaceMapping(userId = "USER_ID", spaceUuid = space1.uuid, permission = "owner")
        val user2 = UserSpaceMapping(userId = "ANOTHER_USER_ID", spaceUuid = space1.uuid, permission = "editor")
        userSpaceMappingRepository.save(user1)

        mockMvc.perform(
                MockMvcRequestBuilders.delete(baseSpaceUrl + "/${space1.uuid}/users/${user2.userId}")
                        .header("Authorization", "Bearer GOOD_TOKEN")
        )
                .andExpect(MockMvcResultMatchers.status().isBadRequest)
                .andReturn()

        val users = userSpaceMappingRepository.findAllBySpaceUuid(space1.uuid)

        Assertions.assertThat(users).hasSize(1)
        Assertions.assertThat(users).contains(user1);
    }

    @Test
    fun `DELETE should return 400 if trying to delete a user from another space`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne"))
        val space2: Space = spaceRepository.save(Space(name = "SpaceTwo"))

        val user1 = UserSpaceMapping(userId = "USER_ID", spaceUuid = space1.uuid, permission = "owner")
        val user2 = UserSpaceMapping(userId = "ANOTHER_USER_ID", spaceUuid = space2.uuid, permission = "editor")
        userSpaceMappingRepository.save(user1)
        userSpaceMappingRepository.save(user2)

        mockMvc.perform(
                MockMvcRequestBuilders.delete(baseSpaceUrl + "/${space1.uuid}/users/${user2.userId}")
                        .header("Authorization", "Bearer GOOD_TOKEN")
        )
                .andExpect(MockMvcResultMatchers.status().isBadRequest)
                .andReturn()

        val users = userSpaceMappingRepository.findAllBySpaceUuid(space2.uuid)

        Assertions.assertThat(users).hasSize(1)
        Assertions.assertThat(users).contains(user2);
    }
}
