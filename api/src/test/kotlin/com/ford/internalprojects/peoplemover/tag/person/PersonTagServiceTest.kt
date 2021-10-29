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

import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
class PersonTagServiceTest {

    @Autowired
    lateinit var personTagService: PersonTagService

    @Autowired
    lateinit var personTagRepository: PersonTagRepository

    @Autowired
    lateinit var spaceRepository: SpaceRepository

    @After
    fun tearDown() {
        spaceRepository.deleteAll()
        personTagRepository.deleteAll()
    }

    @Test
    fun `should duplicate personTags`() {
        val oldSpace = spaceRepository.save(Space(name = "old space"))
        val newSpace = spaceRepository.save(Space(name = "new space"))
        val initialNames = listOf("PersonTag 1", "PersonTag 2")
        val initialPersonTags = initialNames.map { name -> PersonTag(spaceUuid = oldSpace.uuid, name = name) }
        initialPersonTags.forEach { personTag -> personTagRepository.save(personTag) }
        personTagService.duplicate(oldSpace.uuid, newSpace.uuid)
        val actualPersonTags = personTagRepository.findAllBySpaceUuid(newSpace.uuid)
        assertThat(actualPersonTags.size).isEqualTo(2)
        actualPersonTags.forEachIndexed { index, personTag ->
            assertThat(initialNames).contains(personTag.name)
            assertThat(personTag.name).isEqualTo(initialPersonTags[index].name)
            assertThat(personTag.id).isNotEqualTo(initialPersonTags[index].id)
        }
    }
}
