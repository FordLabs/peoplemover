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

import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.tag.person.PersonTag
import com.ford.internalprojects.peoplemover.tag.person.PersonTagRepository
import com.ford.internalprojects.peoplemover.tag.person.PersonTagService
import com.ford.internalprojects.peoplemover.tag.role.RoleService
import com.ford.internalprojects.peoplemover.tag.role.SpaceRole
import com.ford.internalprojects.peoplemover.tag.role.SpaceRolesRepository
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
class PersonServiceTest {

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var personRepository: PersonRepository

    @Autowired
    lateinit var spaceRepository: SpaceRepository

    @Autowired
    lateinit var spaceRolesRepository: SpaceRolesRepository

    @Autowired
    lateinit var personTagRepository: PersonTagRepository

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var personTagService: PersonTagService

    @After
    fun tearDown() {
        spaceRepository.deleteAll()
        personRepository.deleteAll()
        spaceRolesRepository.deleteAll()
        personTagRepository.deleteAll()
    }

    @Test
    fun `should duplicate persons`() {
        val oldSpace = spaceRepository.save(Space(name = "old space"))
        val newSpace = spaceRepository.save(Space(name = "new space"))
        val initialNames = listOf("Person 1", "Person 2")
        val initialRoleNames = listOf("Role 1", "Role 2")
        val initialTagNames = listOf("Tag 1", "Tag 2")
        val initialRoles = initialRoleNames.map { roleName -> spaceRolesRepository.save(SpaceRole(name = roleName, spaceUuid = oldSpace.uuid)) }
        val initialTags = initialTagNames.map { tagName -> personTagRepository.save(PersonTag(name = tagName, spaceUuid = oldSpace.uuid)) }
        val initialPersons = initialNames.mapIndexed {index, name -> Person(spaceUuid = oldSpace.uuid, name = name, spaceRole = initialRoles[index], tags = setOf(initialTags[index])) }
        initialPersons.forEach { person -> personRepository.save(person) }
        roleService.duplicate(oldSpace.uuid, newSpace.uuid)
        personTagService.duplicate(oldSpace.uuid, newSpace.uuid)
        personService.duplicate(oldSpace.uuid, newSpace.uuid)
        val actualPersons = personRepository.findAllBySpaceUuid(newSpace.uuid)
        assertThat(actualPersons.size).isEqualTo(2)
        actualPersons.forEach { person ->
            assertThat(initialNames).contains(person.name)
        }
    }
}
