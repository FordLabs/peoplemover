/*
 * Copyright (c) 2019 Ford Motor Company
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
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class ReportGeneratorControllerTest {

    @MockBean
    lateinit var jwtDecoder: JwtDecoder

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

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
    private lateinit var space: Space

    val mar1 = "2019-03-01"
    val mar2 = "2019-03-02"

    @Before
    fun setup() {
        space = spaceRepository.save(Space(name = "tok"))
        productA = productRepository.save(Product(name = "product a", spaceId = space.id!!))
        productB = productRepository.save(Product(name = "Product b", spaceId = space.id!!))
        spaceRole = spaceRolesRepository.save(SpaceRole(name = "Software Engineer", spaceId = space.id!!))
        spaceRole2 = spaceRolesRepository.save(SpaceRole(name = "Product Designer", spaceId = space.id!!))
        person1 = personRepository.save(Person(name = "person 1", spaceRole = spaceRole, spaceId = space.id!!))
        person2 = personRepository.save(Person(name = "Person 2", spaceId = space.id!!))
        person3 = personRepository.save(Person(name = "Person 3", spaceRole = spaceRole2, spaceId = space.id!!))
        assignmentRepository.save(Assignment(person = person1, productId = productA.id!!, spaceId = space.id!!, effectiveDate = LocalDate.parse(mar1)))
        assignmentRepository.save(Assignment(person = person2, productId = productB.id!!, spaceId = space.id!!, effectiveDate = LocalDate.parse(mar2)))
        assignmentRepository.save(Assignment(person = person3, productId = productA.id!!, spaceId = space.id!!, effectiveDate = LocalDate.parse(mar2)))
    }

    @After
    fun teardown() {
        assignmentRepository.deleteAll()
        personRepository.deleteAll()
        spaceRolesRepository.deleteAll()
        productRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `GET should return people, products, and roles for a space and omit future assignments given a date`() {
        val result = mockMvc
                .perform(get("/api/reportgenerator/${space.uuid}/${mar1}"))
                .andExpect(status().isOk)
                .andReturn()

        val actualReportGenerators = objectMapper.readValue<List<ReportGenerator>>(
                result.response.contentAsString,
                objectMapper
                        .typeFactory
                        .constructCollectionType(MutableList::class.java, ReportGenerator::class.java)
        )


        val expectedReportGenerator = ReportGenerator(productA.name, person1.name, spaceRole.name)

        assertThat(actualReportGenerators.size).isOne()
        assertThat(actualReportGenerators[0]).isEqualTo(expectedReportGenerator)
    }

    @Test
    fun `GET should ignore case and alphabetically sort by product name then person name given a date`() {
        val result = mockMvc
                .perform(get("/api/reportgenerator/${space.uuid}/${mar2}"))
                .andExpect(status().isOk)
                .andReturn()

        val actualReportGenerators = objectMapper.readValue<List<ReportGenerator>>(
                result.response.contentAsString,
                objectMapper
                        .typeFactory
                        .constructCollectionType(MutableList::class.java, ReportGenerator::class.java)
        )


        val expectedReportGenerator = ReportGenerator(productA.name, person1.name, spaceRole.name)
        val expectedReportGenerator2 = ReportGenerator(productA.name, person3.name, spaceRole2.name)
        val expectedReportGenerator3 = ReportGenerator(productB.name, person2.name, "")

        assertThat(actualReportGenerators.size).isEqualTo(3)
        assertThat(actualReportGenerators[0]).isEqualTo(expectedReportGenerator)
        assertThat(actualReportGenerators[1]).isEqualTo(expectedReportGenerator2)
        assertThat(actualReportGenerators[2]).isEqualTo(expectedReportGenerator3)
    }

    @Throws(Exception::class)
    @Test
    fun `GET should return 400 with invalid space name` () {
        mockMvc.perform(get("/api/reportgenerator/fakeSpace/${mar1}"))
                .andExpect(status().isBadRequest)
    }
}