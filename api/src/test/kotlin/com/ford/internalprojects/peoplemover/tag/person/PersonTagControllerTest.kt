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

package com.ford.internalprojects.peoplemover.tag.person

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ProductTagControllerTest {

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var personTagRepository: PersonTagRepository

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
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))
    }

    @Test
    fun `GET should return all person tags for a space`() {
        val personTag1: PersonTag = personTagRepository.save(PersonTag(name = "Java", spaceUuid = space.uuid))
        val personTag2: PersonTag = personTagRepository.save(PersonTag(name = "Agency", spaceUuid = space.uuid))
        val personTag3: PersonTag = personTagRepository.save(PersonTag(name = "Salaried", spaceUuid = space.uuid))

        val result = mockMvc.perform(get(basePersonTagsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN"))
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
        mockMvc.perform(get(basePersonTagsUrl)
            .header("Authorization", "Bearer ANONYMOUS_TOKEN"))
            .andExpect(status().isForbidden)
            .andReturn()
    }
}
