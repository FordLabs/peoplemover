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

package com.ford.internalprojects.peoplemover.tag.role

import com.ford.internalprojects.peoplemover.color.Color
import com.ford.internalprojects.peoplemover.color.ColorRepository
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
class RoleServiceTest {

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var roleRepository: SpaceRolesRepository

    @Autowired
    lateinit var spaceRepository: SpaceRepository

    @Autowired
    lateinit var colorRepository: ColorRepository

    @After
    fun tearDown() {
        spaceRepository.deleteAll()
        roleRepository.deleteAll()
        colorRepository.deleteAll()
    }

    @Test
    fun `should duplicate roles`() {
        val oldSpace = spaceRepository.save(Space(name = "old space"))
        val newSpace = spaceRepository.save(Space(name = "new space"))
        val initialNames = listOf("Role 1", "Role 2")
        val initialColors = listOf(Color(color = "red"), Color(color = "blue"))
        initialColors.forEach {color -> colorRepository.save(color) }
        val initialRoles = initialNames.mapIndexed { index, name -> SpaceRole(spaceUuid = oldSpace.uuid, name = name, color = initialColors[index]) }
        initialRoles.forEach { role -> roleRepository.save(role) }
        roleService.duplicate(oldSpace.uuid, newSpace.uuid)
        val actualRoles = roleRepository.findAllBySpaceUuid(newSpace.uuid)
        assertThat(actualRoles.size).isEqualTo(2)
        (0..1).forEach { index ->
            assertThat(actualRoles.toList()[index].name).isEqualTo(initialNames[index])
            assertThat(actualRoles.toList()[index].color).isEqualTo(initialColors[index])
        }
    }
}
