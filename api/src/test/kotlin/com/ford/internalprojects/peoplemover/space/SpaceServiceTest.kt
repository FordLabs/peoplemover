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

import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.auth.createMockJwt
import com.ford.internalprojects.peoplemover.color.Color
import com.ford.internalprojects.peoplemover.color.ColorRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocation
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocationRepository
import com.ford.internalprojects.peoplemover.tag.person.PersonTag
import com.ford.internalprojects.peoplemover.tag.person.PersonTagRepository
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import com.ford.internalprojects.peoplemover.tag.product.ProductTagRepository
import com.ford.internalprojects.peoplemover.tag.role.SpaceRole
import com.ford.internalprojects.peoplemover.tag.role.SpaceRolesRepository
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkStatic
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito
import org.mockito.Mockito.times
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
class SpaceServiceTest {

    @Autowired
    lateinit var underTest: SpaceService

    @Autowired
    lateinit var spaceRepository: SpaceRepository

    @MockBean
    lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    lateinit var colorRepository: ColorRepository
    @Autowired
    lateinit var roleRepository: SpaceRolesRepository
    @Autowired
    lateinit var locationRepository: SpaceLocationRepository
    @Autowired
    lateinit var productTagRepository: ProductTagRepository
    @Autowired
    lateinit var personTagRepository: PersonTagRepository
    @Autowired
    lateinit var personRepository: PersonRepository

    @Before
    fun before() {
        mockkStatic(SecurityContextHolder::class)
    }

    @After
    fun after() {
        unmockkStatic(SecurityContextHolder::class)
        Mockito.clearInvocations(userSpaceMappingRepository)
    }

    @Test
    fun `getSpacesForUser should return no spaces given a token that has no Principal name and no appId name`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        every { SecurityContextHolder.getContext().authentication.credentials } returns createMockJwt(true)
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verifyNoMoreInteractions(userSpaceMappingRepository)
    }

    @Test
    fun `getSpacesForUser should use the principal name if a token has a Principal name and an appId`() {
        every { SecurityContextHolder.getContext().authentication.name } returns "Bob"
        every { SecurityContextHolder.getContext().authentication.credentials } returns createMockJwt(false)
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verify(userSpaceMappingRepository, times(1)).findAllByUserId("Bob")
    }

    @Test
    fun `getSpacesForUser should use the principal name if a token has a Principal name and no appId`() {
        every { SecurityContextHolder.getContext().authentication.name } returns "Bob"
        every { SecurityContextHolder.getContext().authentication.credentials } returns createMockJwt(true)
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verify(userSpaceMappingRepository, times(1)).findAllByUserId("Bob")
    }

    @Test
    fun `getSpacesForUser should use the appId if a token has an appId name but no principal name`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        every { SecurityContextHolder.getContext().authentication.credentials } returns createMockJwt(false)
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verify(userSpaceMappingRepository, times(1)).findAllByUserId("APP_ID")
    }

    @Test
    fun `getSpacesForUser should return no spaces given a token that doesn't have jwt credentials`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        every { SecurityContextHolder.getContext().authentication.credentials } returns null
        assertThat(underTest.getSpacesForUser().size).isEqualTo(0)
        Mockito.verifyNoMoreInteractions(userSpaceMappingRepository)
    }

    @Test
    fun `duplicating a space should make the caller the owner`() {
        try {
            every { SecurityContextHolder.getContext().authentication.name } returns "USER_ID"
            val oldSpace = spaceRepository.save(Space(name = "old space"))
            var newSpace = underTest.duplicateSpace(oldSpace.uuid)
            val expectedUserSpaceMapping = UserSpaceMapping(userId = "USER_ID", spaceUuid = newSpace.uuid, permission = PERMISSION_OWNER)
            Mockito.verify(userSpaceMappingRepository, times(1)).save(expectedUserSpaceMapping)
        } finally {
            spaceRepository.deleteAll()
        }
    }

    @Test
    fun `duplicating a space should duplicate the tags and people`() {
        try {
            every { SecurityContextHolder.getContext().authentication.name } returns "USER_ID"
            val oldSpace = spaceRepository.save(Space(name = "old space"))
            locationRepository.save(SpaceLocation(spaceUuid = oldSpace.uuid, name = "location"))
            productTagRepository.save(ProductTag(spaceUuid = oldSpace.uuid, name = "product tag"))
            personTagRepository.save(PersonTag(spaceUuid = oldSpace.uuid, name = "person tag"))
            val color = colorRepository.save(Color(color = "red"))
            roleRepository.save(SpaceRole(spaceUuid = oldSpace.uuid, name = "role", color = color))
            personRepository.save(Person(spaceUuid = oldSpace.uuid, name = "person"))
            var newSpace = underTest.duplicateSpace(oldSpace.uuid)
            val actualLocations = locationRepository.findAllBySpaceUuid(newSpace.uuid)
            assertThat(actualLocations.size).isOne()
            assertThat(actualLocations.toList()[0].name).isEqualTo("location")
            val actualProductTags = productTagRepository.findAllBySpaceUuid(newSpace.uuid)
            assertThat(actualProductTags.size).isOne()
            assertThat(actualProductTags.toList()[0].name).isEqualTo("product tag")
            val actualPersonTags = personTagRepository.findAllBySpaceUuid(newSpace.uuid)
            assertThat(actualPersonTags.size).isOne()
            assertThat(actualPersonTags.toList()[0].name).isEqualTo("person tag")
            val actualRoles = roleRepository.findAllBySpaceUuid(newSpace.uuid)
            assertThat(actualRoles.size).isOne()
            assertThat(actualRoles.toList()[0].name).isEqualTo("role")
            assertThat(actualRoles.toList()[0].color?.color).isEqualTo(color.color)
            val actualPeople = personRepository.findAllBySpaceUuid(newSpace.uuid)
            assertThat(actualPeople.size).isOne()
            assertThat(actualPeople[0].name).isEqualTo("person")
        } finally {
            spaceRepository.deleteAll()
            colorRepository.deleteAll()
            roleRepository.deleteAll()
            locationRepository.deleteAll()
            productTagRepository.deleteAll()
            personTagRepository.deleteAll()
            personRepository.deleteAll()
        }
    }
}
