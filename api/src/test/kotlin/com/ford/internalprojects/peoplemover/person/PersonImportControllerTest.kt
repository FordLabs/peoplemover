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

package com.ford.internalprojects.peoplemover.person

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.SpaceService
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocationRepository
import com.ford.internalprojects.peoplemover.tag.person.PersonTag
import com.ford.internalprojects.peoplemover.tag.person.PersonTagRepository
import com.ford.internalprojects.peoplemover.tag.role.SpaceRole
import com.ford.internalprojects.peoplemover.tag.role.SpaceRolesRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@AutoConfigureMockMvc
@SpringBootTest
@ActiveProfiles("test")
@RunWith(SpringRunner::class)
class PersonImportControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var spaceService: SpaceService

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var spaceRolesRepository: SpaceRolesRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var assignmentService: AssignmentService

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    private lateinit var personTagRepository: PersonTagRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    private lateinit var space: Space
    private lateinit var spaceTwo: Space

    private lateinit var tag: PersonTag

    var basePeopleUrl: String = ""

    private fun getBaseImportUrl(spaceUuid: String) = "/api/spaces/$spaceUuid/people/import"

    @Before
    fun setUp() {
        space = spaceService.createSpaceWithName("spaceWithThisName", "Nobody")
        spaceTwo = spaceService.createSpaceWithName("spaceThatUserDoesNotHaveAccessTo", "Nobody")

        tag = personTagRepository.save(PersonTag(spaceUuid = space.uuid, name = "Night Shift"))

        basePeopleUrl = getBaseImportUrl(space.uuid)

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))
    }

    @After
    fun tearDown() {
        assignmentRepository.deleteAll()
        spaceRolesRepository.deleteAll()
        personRepository.deleteAll()
        productRepository.deleteAll()
        spaceLocationRepository.deleteAll()
        spaceRepository.deleteAll()
        personTagRepository.deleteAll()
    }

    @Test
    fun `requesting a download template always gets you the same (correct) file every time`() {
        var expected = "Person Name\tCDSID\tPerson Role\tPerson Note\tPerson Tags\r\nBruce Wayne\timbatman\tSuperhero\tLikes champagne\tNight Shift"
        val mvcResult = mockMvc.perform(get(getBaseImportUrl(space.uuid))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn();
        assertThat(mvcResult.response.contentAsString).isEqualTo(expected)
    }

    @Test
    fun `uploading the import template with a person adds them to an empty space`() {

        var spaceRole = SpaceRole(spaceUuid = space.uuid, name = "Superhero")
        spaceRolesRepository.save(spaceRole);

        val personToCreate = Person(
                name = "Bruce Wayne",
                customField1 = "imbatman",
                spaceRole = spaceRole,
                notes = "Likes champagne",
                newPerson = true,
                spaceUuid = space.uuid,
                tags = setOf(tag)
        )

        var personJSON = objectMapper.writeValueAsString(listOf(personToCreate));


        val mvcResult = mockMvc.perform(post(getBaseImportUrl(space.uuid))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .content(personJSON)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk)
                .andReturn();
        assertThat(personRepository.count()).isEqualTo(1)

        val person = personRepository.findAllBySpaceUuid(space.uuid)[0]

        assertThat(person.name).isEqualTo("Bruce Wayne")
        assertThat(person.customField1).isEqualTo("imbatman")
        assertThat(person.notes).isEqualTo("Likes champagne")
        assertThat(person.spaceRole).isEqualTo(spaceRole)
        assertThat(person.tags).isEqualTo(setOf(tag))


    }

}
