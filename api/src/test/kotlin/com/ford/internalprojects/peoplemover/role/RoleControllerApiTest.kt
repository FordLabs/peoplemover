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

package com.ford.internalprojects.peoplemover.role

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.color.Color
import com.ford.internalprojects.peoplemover.color.ColorRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.repository.findByIdOrNull
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
class RoleControllerApiTest {

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var spaceRolesRepository: SpaceRolesRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var colorRepository: ColorRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private lateinit var space: Space

    var baseRolesUrl: String = ""

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "tok"))

        baseRolesUrl = "/api/spaces/" + space.uuid + "/roles"
    }

    @After
    fun tearDown() {
        personRepository.deleteAll()
        spaceRolesRepository.deleteAll()
        colorRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `GET should return roles`() {
        val role1: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Fireman", spaceId = space.id!!))
        val role2: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Astronaut", spaceId = space.id!!))

        val result = mockMvc.perform(get(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isOk)
            .andReturn()

        val actualSpaceRoles: Set<SpaceRole> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, SpaceRole::class.java)
        )

        assertThat(actualSpaceRoles).contains(role1)
        assertThat(actualSpaceRoles).contains(role2)
    }

    @Test
    fun `GET should return 400 when space does not exist`() {
        mockMvc.perform(get("/api/spaces/doesNotExist/roles")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `GET should return empty set when space has no roles`() {
        val result = mockMvc
            .perform(get(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isOk)
            .andReturn()

        val actualSpaceRoles: Set<SpaceRole> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, SpaceRole::class.java))

        assertThat(actualSpaceRoles).isEmpty()
    }

    @Test
    fun `POST should return 409 when trying to add duplicate space role name to same space`() {
        val spaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Firefighter", spaceId = space.id!!))
        val newRole = RoleAddRequest(name = spaceRole.name)

        mockMvc.perform(post(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newRole)))
            .andExpect(status().isConflict)
    }

    @Test
    fun `POST should add a role to a space and assign it a color`() {
        colorRepository.save(Color(color = "red"))

        val newRole = RoleAddRequest(name = "Firefighter")
        val result = mockMvc.perform(post(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newRole)))
            .andExpect(status().isOk)
            .andReturn()

        val addedSpaceRole: SpaceRole = objectMapper.readValue(
            result.response.contentAsString,
            SpaceRole::class.java
        )
        assertThat(addedSpaceRole.name).isEqualTo(newRole.name)
        assertThat(addedSpaceRole.color).isNotNull()

        val updatedSpace: Space = spaceRepository.findByIdOrNull(space.id!!)!!
        val spaceRolesTiedToSpace: Set<SpaceRole> = updatedSpace.roles
        assertThat(spaceRolesTiedToSpace).containsExactly(addedSpaceRole)
    }

    @Test
    fun `POST should add a role to a space and assign it a color of null when all colors are used`() {
        val usedColor: Color = colorRepository.save(Color(color = "3"))
        spaceRolesRepository.save(SpaceRole(name = "existingRole", spaceId = space.id!!, color = usedColor))

        val newRole = RoleAddRequest(name = "Firefighter")
        val result = mockMvc.perform(post(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newRole)))
            .andExpect(status().isOk)
            .andReturn()

        val addedSpaceRole: SpaceRole = objectMapper.readValue(
            result.response.contentAsString,
            SpaceRole::class.java
        )
        assertThat(addedSpaceRole.name).isEqualTo(newRole.name)
        assertThat(addedSpaceRole.color).isNull()
    }

    @Test
    fun `POST should add a role to a space with a specified color`() {
        colorRepository.save(Color(color = "unused"))
        val usedColor: Color = colorRepository.save(Color(color = "used"))

        val newRole = RoleAddRequest(name = "Firefighter", colorId = usedColor.id)

        val result = mockMvc.perform(post(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newRole)))
            .andExpect(status().isOk)
            .andReturn()
        val actualSpaceRole: SpaceRole = objectMapper.readValue(
            result.response.contentAsString,
            SpaceRole::class.java
        )
        assertThat(actualSpaceRole.name).isEqualTo(newRole.name)
        assertThat(actualSpaceRole.color).isEqualTo(usedColor)
    }

    @Test
    fun `POST should return 400 when space does not exist`() {
        mockMvc.perform(post("/api/spaces/badSpace/roles")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(SpaceRole(name = "role", spaceId = 22))))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should update roles of associated people when editing space role name`() {
        val originalSpaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Software Engineer", spaceId = space.id!!))

        val person1: Person = personRepository.save(Person(name = "Jack", spaceRole = originalSpaceRole, spaceId = space.id!!))
        val person2: Person = personRepository.save(Person(name = "Jill", spaceRole = originalSpaceRole, spaceId = space.id!!))

        val updatedRoleName = "Blobware Engineer"
        val roleEditRequest = RoleEditRequest(id = originalSpaceRole.id!!, name = updatedRoleName)

        mockMvc.perform(put(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(roleEditRequest)))
            .andExpect(status().isOk)

        val actualPerson1: Person = personRepository.findByIdOrNull(person1.id!!)!!
        val actualPerson2: Person = personRepository.findByIdOrNull(person2.id!!)!!

        assertThat(actualPerson1.spaceRole?.name).isEqualTo(updatedRoleName)
        assertThat(actualPerson2.spaceRole?.name).isEqualTo(updatedRoleName)
    }

    @Test
    fun `PUT should return 409 when trying to edit role name to existing role name`() {
        val spaceRole1: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Firefighter", spaceId = space.id!!))
        val spaceRole2: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Astronaut", spaceId = space.id!!))
        val roleEditRequest = RoleEditRequest(id = spaceRole2.id!!, name = spaceRole1.name)

        mockMvc.perform(put(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(roleEditRequest)))
            .andExpect(status().isConflict)
    }

    @Test
    fun `PUT should return 400 when trying to edit non existent role`() {
        mockMvc.perform(put(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(RoleEditRequest(name = "role1", id = 0 ))))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should edit space role`() {
        val blueColor: Color = colorRepository.save(Color(color = "blue"))
        val greenColor: Color = colorRepository.save(Color(color = "green"))
        val spaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Fireman Astronaut", spaceId = space.id!!, color = blueColor))

        val updatedRoleName = "Herr Doktor-Professor"
        val roleEditRequest = RoleEditRequest(id = spaceRole.id!!, name = updatedRoleName, colorId = greenColor.id)

        val result = mockMvc.perform(put(baseRolesUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(roleEditRequest)))
            .andExpect(status().isOk)
            .andReturn()

        val updatedSpaceRole: SpaceRole = objectMapper.readValue(
            result.response.contentAsString,
            SpaceRole::class.java
        )
        assertThat(updatedSpaceRole.name).isEqualTo(updatedRoleName)
        assertThat(updatedSpaceRole.color).isEqualTo(greenColor)

        val updatedSpace: Space = spaceRepository.findByIdOrNull(space.id!!)!!
        val actualRoles: Set<SpaceRole> = updatedSpace.roles

        val doctorIsIn = actualRoles.any { actualRole -> updatedRoleName == actualRole.name }
        val astroNotIn = actualRoles.any { actualRole -> updatedRoleName == actualRole.name }
        assertThat(doctorIsIn).isTrue()
        assertThat(astroNotIn).isTrue()
    }

    @Test
    fun `DELETE should delete a space role from a space`() {
        val spaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(spaceId = space.id!!, name = "role1"))

        mockMvc.perform(delete("$baseRolesUrl/${spaceRole.id}")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)

        assertThat(spaceRolesRepository.count()).isZero()
    }

    @Test
    fun `DELETE should set space role on associated person to null `() {
        val spaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(spaceId = space.id!!, name = "role1"))
        val person: Person = personRepository.save(Person(
            name = "Jenny",
            spaceRole = spaceRole,
            spaceId = space.id!!
        ))

        mockMvc.perform(delete("$baseRolesUrl/${spaceRole.id}")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)

        val updatedPerson: Person = personRepository.findByIdOrNull(person.id!!)!!
        assertThat(updatedPerson.spaceRole).isNull()
    }
}