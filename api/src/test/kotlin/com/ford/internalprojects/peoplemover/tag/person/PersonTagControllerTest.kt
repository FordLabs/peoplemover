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

package com.ford.internalprojects.peoplemover.tag.person

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.tag.TagRequest
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import org.assertj.core.api.Assertions.assertThat
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

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class PersonTagControllerTest {

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var personTagRepository: PersonTagRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    var basePersonTagsUrl: String = ""
    private lateinit var space: Space
    private fun getBasePersonTagsUrl(spaceUuid: String) = "/api/spaces/$spaceUuid/person-tags"

    @Before
    fun setUp() {
        personTagRepository.deleteAll()
        spaceRepository.deleteAll()

        space = spaceRepository.save(Space(name = "anotherSpaceName"))
        basePersonTagsUrl = getBasePersonTagsUrl(space.uuid)
        userSpaceMappingRepository.save(
            UserSpaceMapping(
                userId = "USER_ID",
                spaceUuid = space.uuid,
                permission = PERMISSION_OWNER
            )
        )
    }

    @Test
    fun `GET should return all person tags for a space`() {
        val personTag1: PersonTag = personTagRepository.save(PersonTag(name = "Java", spaceUuid = space.uuid))
        val personTag2: PersonTag = personTagRepository.save(PersonTag(name = "Agency", spaceUuid = space.uuid))
        val personTag3: PersonTag = personTagRepository.save(PersonTag(name = "Salaried", spaceUuid = space.uuid))

        val result = mockMvc.perform(
            get(basePersonTagsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val expectedPersonTags: List<PersonTag> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, PersonTag::class.java)
        )
        assertThat(expectedPersonTags.size).isEqualTo(3)
        assertThat(expectedPersonTags[0]).isEqualTo(personTag2)
        assertThat(expectedPersonTags[1]).isEqualTo(personTag1)
        assertThat(expectedPersonTags[2]).isEqualTo(personTag3)
    }

    @Test
    fun `GET should return 403 if unauthorized`() {
        mockMvc.perform(
            get(basePersonTagsUrl)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        )
            .andExpect(status().isForbidden)
            .andReturn()
    }

    @Test
    fun `POST should create person tag`() {
        val tagToCreate = TagRequest(name = "Low Achiever")

        val result = mockMvc.perform(
            post(basePersonTagsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagToCreate))
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualTag: PersonTag = objectMapper.readValue(
            result.response.contentAsString,
            PersonTag::class.java
        )
        assertThat(actualTag.name).isEqualTo(tagToCreate.name)
    }

    @Test
    fun `Post should return 403 if unauthorized`() {
        val tagToCreate = TagRequest(name = "Low Achiever")

        mockMvc.perform(
            post(basePersonTagsUrl)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagToCreate))
        )
            .andExpect(status().isForbidden)
            .andReturn()
    }

    @Test
    fun `POST should return 409 when creating person tag with already existing name`() {
        val actualTag: PersonTag = personTagRepository.save(PersonTag(name = "Agency", spaceUuid = space.uuid))
        mockMvc.perform(post(basePersonTagsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(actualTag)))
            .andExpect(status().isConflict)
    }

    @Test
    fun `PUT should update person tag`() {
        val expectedInitialState = "Top Achiever"
        val tagToCreate = TagRequest(name = expectedInitialState)

        val creationResponse = mockMvc.perform(
            post(basePersonTagsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagToCreate))
        )
            .andExpect(status().isOk)
            .andReturn()
        val createdTag = objectMapper.readValue(
            creationResponse.response.contentAsString,
            PersonTag::class.java
        )

        assertThat(createdTag.name).isEqualTo(expectedInitialState);

        val expectedUpdateValue = "Under-achiever"
        val tagToUpdate = TagRequest(name = expectedUpdateValue)

        val updatedResponse = mockMvc.perform(
            put("$basePersonTagsUrl/${createdTag.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagToUpdate))
        )
            .andExpect(status().isOk)
            .andReturn()
        val updatedTag = objectMapper.readValue(
            updatedResponse.response.contentAsString,
            PersonTag::class.java
        )
        assertThat(updatedTag.name).isEqualTo(expectedUpdateValue);
    }

    @Test
    fun `PUT should return 403 if unauthorized`() {
        val expectedInitialState = "Top Achiever"
        val tagToCreate = TagRequest(name = expectedInitialState)

        val creationResponse = mockMvc.perform(
            post(basePersonTagsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagToCreate))
        )
            .andExpect(status().isOk)
            .andReturn()
        val createdTag = objectMapper.readValue(
            creationResponse.response.contentAsString,
            PersonTag::class.java
        )

        assertThat(createdTag.name).isEqualTo(expectedInitialState);

        val expectedUpdateValue = "Under-achiever"
        val tagToUpdate = TagRequest(name = expectedUpdateValue)

        mockMvc.perform(
            put("$basePersonTagsUrl/${createdTag.id}")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagToUpdate))
        )
            .andExpect(status().isForbidden)
            .andReturn()
    }

    @Test
    fun `PUT should return 409 when editing person tag to an already existing name`() {
        val conflictingTagName = "Cool Guy"
        personTagRepository.save(PersonTag(name = conflictingTagName, spaceUuid = space.uuid))

        val initialTag: PersonTag = personTagRepository.save(PersonTag(name = "Fun Guy", spaceUuid = space.uuid))

        val attemptedEditRequest = TagRequest(name = conflictingTagName)
        mockMvc.perform(put("$basePersonTagsUrl/${initialTag.id}")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(attemptedEditRequest)))
            .andExpect(status().isConflict)
    }

    @Test
    fun `DELETE should delete person tag and all associations to people`() {
        val personTag: PersonTag = personTagRepository.save(
            PersonTag(name = "Agency", spaceUuid = space.uuid)
        )

        val personId: Int? = personRepository.save(
            Person(name = "Bob", spaceUuid = space.uuid, tags = hashSetOf(personTag))
        ).id

        assertThat(personTagRepository.count()).isOne()

        mockMvc.perform(
            delete("$basePersonTagsUrl/${personTag.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        assertThat(personTagRepository.count()).isZero()
        val person = personRepository.findByIdAndSpaceUuid(personId!!, space.uuid)
        assertThat(person!!.tags).isEmpty()
    }

    @Test
    fun `DELETE should return 403 if unauthorized`() {
        val expectedInitialState = "Top Achiever"
        val tagToCreate = TagRequest(name = expectedInitialState)

        val creationResponse = mockMvc.perform(
            post(basePersonTagsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagToCreate))
        )
            .andExpect(status().isOk)
            .andReturn()
        val createdTag = objectMapper.readValue(
            creationResponse.response.contentAsString,
            PersonTag::class.java
        )

        assertThat(createdTag.name).isEqualTo(expectedInitialState);

        mockMvc.perform(
            delete("$basePersonTagsUrl/${createdTag.id}")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN"))
            .andExpect(status().isForbidden)
            .andReturn()
    }

    @Test
    fun `DELETE should return 400 when person tag is not associated with the space provided`() {
        val spaceNotAssociatedWithUser = spaceRepository.save(Space(name = "spaceNotAssociatedWithUser"))

        val personTag: PersonTag = personTagRepository.save(
            PersonTag(name = "Fin Tech", spaceUuid = spaceNotAssociatedWithUser.uuid)
        )

        mockMvc.perform(delete("$basePersonTagsUrl/${personTag.id!!}")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should return 400 when person tag does not exist`() {
        mockMvc.perform(delete("$basePersonTagsUrl/700")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isBadRequest)
    }
}
