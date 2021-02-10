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

package com.ford.internalprojects.peoplemover.report

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.auth.PERMISSION_EDITOR
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.role.SpaceRole
import com.ford.internalprojects.peoplemover.role.SpaceRolesRepository
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
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ReportGeneratorControllerTest {
    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var spaceRolesRepository: SpaceRolesRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private lateinit var productA: Product
    private lateinit var productB: Product
    private lateinit var spaceRole: SpaceRole
    private lateinit var spaceRole2: SpaceRole
    private lateinit var person1: Person
    private lateinit var person2: Person
    private lateinit var person3: Person
    private lateinit var space1: Space
    private lateinit var space2: Space

    val mar1 = "2019-03-01"
    val mar2 = "2019-03-02"

    private final val baseReportsUrl = "/api/reports"
    private final val basePeopleReportsUrl = "$baseReportsUrl/people"
    private final val baseSpaceReportsUrl = "$baseReportsUrl/space"
    private final val baseUserReportsUrl = "$baseReportsUrl/user"

    @Before
    fun setup() {
        space1 = spaceRepository.save(Space(name = "Undersea Pineapple"))
        space2 = spaceRepository.save(Space(name = "Krusty Krabb"))
        productA = productRepository.save(Product(name = "product a", spaceUuid = space1.uuid))
        productB = productRepository.save(Product(name = "Product b", spaceUuid = space1.uuid))
        spaceRole = spaceRolesRepository.save(SpaceRole(name = "Software Engineer", spaceUuid = space1.uuid))
        spaceRole2 = spaceRolesRepository.save(SpaceRole(name = "Product Designer", spaceUuid = space1.uuid))
        person1 = personRepository.save(Person(name = "person 1", spaceRole = spaceRole, notes = "Notes", spaceUuid = space1.uuid))
        person2 = personRepository.save(Person(name = "Person 2", spaceUuid = space1.uuid))
        person3 = personRepository.save(Person(name = "Person 3", spaceRole = spaceRole2, spaceUuid = space1.uuid))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space1.uuid, permission = PERMISSION_EDITOR))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "SSQUAREP", spaceUuid = space1.uuid, permission = PERMISSION_OWNER))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "PSTAR", spaceUuid = space1.uuid, permission = PERMISSION_EDITOR))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "PSTAR", spaceUuid = space2.uuid, permission = PERMISSION_OWNER))
        assignmentRepository.save(Assignment(person = person1, productId = productA.id!!, effectiveDate = LocalDate.parse(mar1), spaceUuid = space1.uuid))
        assignmentRepository.save(Assignment(person = person2, productId = productB.id!!, effectiveDate = LocalDate.parse(mar2), spaceUuid = space1.uuid))
        assignmentRepository.save(Assignment(person = person3, productId = productA.id!!, effectiveDate = LocalDate.parse(mar2), spaceUuid = space1.uuid))
    }

    @After
    fun teardown() {
        assignmentRepository.deleteAll()
        personRepository.deleteAll()
        spaceRolesRepository.deleteAll()
        productRepository.deleteAll()
        spaceRepository.deleteAll()
        userSpaceMappingRepository.deleteAll()
    }

    @Test
    fun `GET should return people, products, and roles for a space and omit future assignments given a date`() {
        val result = mockMvc
                .perform(get("$basePeopleReportsUrl?spaceUuid=${space1.uuid}&requestedDate=${mar1}")
                        .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualPeopleReport = objectMapper.readValue<List<PeopleReportRow>>(
                result.response.contentAsString,
                objectMapper
                        .typeFactory
                        .constructCollectionType(MutableList::class.java, PeopleReportRow::class.java)
        )

        val expectedPeopleReport = PeopleReportRow(productA.name, person1.name, spaceRole.name, personNote = "Notes")

        assertThat(actualPeopleReport.size).isOne()
        assertThat(actualPeopleReport[0]).isEqualTo(expectedPeopleReport)
    }

    @Test
    fun `GET should ignore case and alphabetically sort by product name then person name given a date`() {
        val result = mockMvc
                .perform(get("$basePeopleReportsUrl?spaceUuid=${space1.uuid}&requestedDate=${mar2}")
                        .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualPeopleReport = objectMapper.readValue<List<PeopleReportRow>>(
                result.response.contentAsString,
                objectMapper
                        .typeFactory
                        .constructCollectionType(MutableList::class.java, PeopleReportRow::class.java)
        )

        val expectedPeopleReport = PeopleReportRow(productA.name, person1.name, spaceRole.name, "Notes")
        val expectedPeopleReport2 = PeopleReportRow(productA.name, person3.name, spaceRole2.name, "")
        val expectedPeopleReport3 = PeopleReportRow(productB.name, person2.name, "", "")

        assertThat(actualPeopleReport.size).isEqualTo(3)
        assertThat(actualPeopleReport[0]).isEqualTo(expectedPeopleReport)
        assertThat(actualPeopleReport[1]).isEqualTo(expectedPeopleReport2)
        assertThat(actualPeopleReport[2]).isEqualTo(expectedPeopleReport3)
    }

    @Test
    fun `GET should return 403 when generating a report for space without write access`() {
        val request = get("$basePeopleReportsUrl?spaceUuid=${space1.uuid}&requestedDate=${mar1}")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")

        mockMvc.perform(request).andExpect(status().isForbidden)
    }

    @Test
    fun `GET should return all space names, who created the space, and all users related to that space if users is authorized`() {
        val request = get(baseSpaceReportsUrl).header("Authorization", "Bearer GOOD_TOKEN")
        val result = mockMvc.perform(request)
                .andExpect(status().isOk)
                .andReturn()

        val constructCollectionType = objectMapper.typeFactory.constructCollectionType(MutableList::class.java, SpaceReportItem::class.java)
        val actualSpaceReport = objectMapper.readValue<List<SpaceReportItem>>(result.response.contentAsString, constructCollectionType)

        val expectedUsers1 = listOf("USER_ID", "SSQUAREP", "PSTAR")
        val expectedUsers2 = listOf("PSTAR")
        val expectedSpace1 = SpaceReportItem(space1.name, space1.createdBy, expectedUsers1)
        val expectedSpace2 = SpaceReportItem(space2.name, space2.createdBy, expectedUsers2)
        val expectedSpaceReport = listOf(expectedSpace1, expectedSpace2)

        assertThat(actualSpaceReport.size).isEqualTo(2)
        assertThat(actualSpaceReport).containsAll(expectedSpaceReport)
    }

    @Test
    fun `GET user should return all user ids`() {
        val request = get(baseUserReportsUrl).header("Authorization", "Bearer GOOD_TOKEN")
        val result = mockMvc.perform(request)
                .andExpect(status().isOk)
                .andReturn()

        val constructCollectionType = objectMapper.typeFactory.constructCollectionType(MutableList::class.java, String::class.java)
        val actualUserReport = objectMapper.readValue<List<String>>(result.response.contentAsString, constructCollectionType)

        assertThat(actualUserReport).containsExactlyInAnyOrder("USER_ID","SSQUAREP", "PSTAR")

    }

}
