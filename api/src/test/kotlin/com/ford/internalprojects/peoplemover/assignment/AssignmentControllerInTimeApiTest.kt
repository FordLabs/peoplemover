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

package com.ford.internalprojects.peoplemover.assignment

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.location.SpaceLocationRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.internal.util.collections.Sets
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class AssignmentControllerInTimeApiTest {
    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private lateinit var space: Space
    private lateinit var productOne: Product
    private lateinit var productTwo: Product
    private lateinit var productThree: Product
    private lateinit var person: Person

    val apr1 = "2019-04-01"
    val apr2 = "2019-04-02"

    @Before
    fun setup() {
        space = spaceRepository.save(Space(name = "tok"))
        productOne = productRepository.save(Product(name = "Justice League", spaceId = space.id!!))
        productTwo = productRepository.save(Product(name = "Avengers", spaceId = space.id!!))
        productThree = productRepository.save(Product(name = "Misfits", spaceId = space.id!!))
        person = personRepository.save(Person(name = "Benjamin Britten", newPerson = true, spaceId = space.id!!))
    }

    @After
    fun teardown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        personRepository.deleteAll()
        spaceLocationRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `GET should return all assignments for the given spaceId and past date`() {
//        Apr 1: Person A is on Prod1 and Prod2
//        Apr 2: Person A no longer works on Prod1
//        Apr 1: Get all assignments should return Person A on Prod 1 and Prod2

        val assignment1: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val assignment2: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val assignment3: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr2),
                spaceId = space.id!!
        ))

        val result = mockMvc.perform(get("/api/assignment/${space.id}/$apr1"))
                .andExpect(status().isOk)
                .andReturn()
        val actualAssignments: Set<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, Assignment::class.java)
        )

        assertThat(actualAssignments.size).isEqualTo(2)
        assertThat(actualAssignments).contains(assignment1)
        assertThat(actualAssignments).contains(assignment2)
        assertThat(actualAssignments).doesNotContain(assignment3)
    }

    @Test
    fun `GET should return all assignments for the given spaceId and recent date`() {
//        Apr 1: Person A is on Prod1 and Prod2
//        Apr 2: Person A no longer works on Prod1
//        Apr 2: Get all assignments should return Person A on Prod2 only

        val assignment1: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val assignment2: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val assignment3: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr2),
                spaceId = space.id!!
        ))

        val result = mockMvc.perform(get("/api/assignment/${space.id}/$apr2"))
                .andExpect(status().isOk)
                .andReturn()
        val actualAssignments: Set<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, Assignment::class.java)
        )

        assertThat(actualAssignments.size).isOne()
        assertThat(actualAssignments).contains(assignment3)
        assertThat(actualAssignments).doesNotContain(assignment1)
        assertThat(actualAssignments).doesNotContain(assignment2)
    }

    @Test
    fun `GET should return null effective date assignments when all assignments for person have null effective date`() {
//        Origin: Person A and Person B both work on Prod1.
//        Apr 1: Person B moves to Prod2.
//        Apr 1: Get all assignments should return Person A on Prod1 and Person B on Prod2.

        val personTwo: Person = personRepository.save(Person(name = "Avengers", spaceId = space.id!!))

        val assignment1: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = null,
                spaceId = space.id!!
        ))
        val assignment2: Assignment = assignmentRepository.save(Assignment(
                person = personTwo,
                productId = productOne.id!!,
                effectiveDate = null,
                spaceId = space.id!!
        ))
        val assignment3: Assignment = assignmentRepository.save(Assignment(
                person = personTwo,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))

        val result = mockMvc.perform(get("/api/assignment/${space.id}/$apr1"))
                .andExpect(status().isOk)
                .andReturn()
        val actualAssignments: Set<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, Assignment::class.java)
        )

        assertThat(actualAssignments.size).isEqualTo(2)
        assertThat(actualAssignments).contains(assignment1)
        assertThat(actualAssignments).contains(assignment3)
        assertThat(actualAssignments).doesNotContain(assignment2)
    }

    @Test
    fun `GET should return 400 when given an invalid space` () {
        val bogusSpaceId = 99999999

        mockMvc.perform(get("/api/assignment/$bogusSpaceId/$apr1"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `GET should return 400 when given an invalid date` () {
        val bogusDate = "apr1"

        mockMvc.perform(get("/api/assignment/${space.id}/$bogusDate"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST should only replace any existing assignments for a given date`() {
        val oldAssignmentToReplace: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))

        val nullAssignmentToKeep: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = null,
                spaceId = space.id!!
        ))

        val newAssignments = CreateAssignmentsRequest(
                requestedDate = LocalDate.parse(apr1),
                person = person,
                products = Sets.newSet(
                        ProductPlaceholderPair(productId = productTwo.id!!, placeholder = false),
                        ProductPlaceholderPair(productId = productThree.id!!, placeholder = true)
                )
        )

        val result = mockMvc.perform(post("/api/assignment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newAssignments)))
                .andExpect(status().isOk)
                .andReturn()

        val actualAssignments: Set<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, Assignment::class.java)
        )

        assertThat(actualAssignments.size).isEqualTo(2)
        assertThat(assignmentRepository.findAll()).containsAll(actualAssignments)
        assertThat(assignmentRepository.findAll()).contains(nullAssignmentToKeep)
        assertThat(assignmentRepository.findAll()).doesNotContain(oldAssignmentToReplace)
    }

    @Test
    fun `POST should return 400 when given assignment with an invalid person` () {
        val bogusPerson = Person(id = 99999999, name = "fake person", spaceId = space.id!!)

        val bogusAssignmentRequest = CreateAssignmentsRequest (
                requestedDate = LocalDate.parse(apr1),
                person = bogusPerson,
                products = Sets.newSet(ProductPlaceholderPair(
                        productId = productOne.id!!,
                        placeholder = false))
        )

        mockMvc.perform(post("/api/assignment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bogusAssignmentRequest)))
                .andExpect(status().isBadRequest)

        assertThat(assignmentRepository.count()).isZero()
    }

    @Test
    fun `POST should return 400 when given assignment with an invalid product`() {
        val bogusAssignmentRequest = CreateAssignmentsRequest(
                requestedDate = LocalDate.parse(apr1),
                person = person,
                products = Sets.newSet(ProductPlaceholderPair(productId = 99999999, placeholder = false))
        )

        mockMvc.perform(post("/api/assignment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bogusAssignmentRequest)))
                .andExpect(status().isBadRequest)

        assertThat(assignmentRepository.count()).isZero()
    }

    @Test
    fun `POST should return 400 when given an empty set of products` () {
        val assignment1: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))

        val bogusAssignmentRequest = CreateAssignmentsRequest(
                requestedDate = LocalDate.parse(apr1),
                person = person,
                products = Sets.newSet()
        )

        mockMvc.perform(post("/api/assignment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bogusAssignmentRequest)))
                .andExpect(status().isBadRequest)

        assertThat(assignmentRepository.count()).isOne()
        assertThat(assignmentRepository.findAll()).contains(assignment1)
    }
}