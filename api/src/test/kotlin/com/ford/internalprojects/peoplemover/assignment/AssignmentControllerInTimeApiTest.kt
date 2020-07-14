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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
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
    private lateinit var unassignedProduct: Product
    private lateinit var person: Person

    val mar1 = "2019-03-01"
    val apr1 = "2019-04-01"
    val apr2 = "2019-04-02"

    @Before
    fun setup() {
        space = spaceRepository.save(Space(name = "tok"))
        productOne = productRepository.save(Product(name = "Justice League", spaceId = space.id!!))
        productTwo = productRepository.save(Product(name = "Avengers", spaceId = space.id!!))
        productThree = productRepository.save(Product(name = "Misfits", spaceId = space.id!!))
        unassignedProduct = productRepository.save(Product(name = "unassigned", spaceId = space.id!!))
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
        val currentAssignment1: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val currentAssignment2: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val futureAssignment: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr2),
                spaceId = space.id!!
        ))

        val result = mockMvc.perform(get("/api/assignment/${space.id}/$apr1"))
                .andExpect(status().isOk)
                .andReturn()
        val actualAssignments: List<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Assignment::class.java)
        )

        assertThat(actualAssignments.size).isEqualTo(2)
        assertThat(actualAssignments).contains(currentAssignment1, currentAssignment2)
        assertThat(actualAssignments).doesNotContain(futureAssignment)
    }

    @Test
    fun `GET should return all assignments for the given spaceId and recent date`() {
        val oldAssignment1: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val oldAssignment2: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val newAssignment: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr2),
                spaceId = space.id!!
        ))

        val result = mockMvc.perform(get("/api/assignment/${space.id}/$apr2"))
                .andExpect(status().isOk)
                .andReturn()
        val actualAssignments: List<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Assignment::class.java)
        )

        assertThat(actualAssignments.size).isOne()
        assertThat(actualAssignments).contains(newAssignment)
        assertThat(actualAssignments).doesNotContain(oldAssignment1, oldAssignment2)
    }

    @Test
    fun `GET should return null effective date assignments when all assignments for person have null effective date`() {
        val personTwo: Person = personRepository.save(Person(name = "Avengers", spaceId = space.id!!))

        val originalAssignmentToKeep: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = null,
                spaceId = space.id!!
        ))
        val originalAssignmentToReplace: Assignment = assignmentRepository.save(Assignment(
                person = personTwo,
                productId = productOne.id!!,
                effectiveDate = null,
                spaceId = space.id!!
        ))
        val newAssignment: Assignment = assignmentRepository.save(Assignment(
                person = personTwo,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))

        val result = mockMvc.perform(get("/api/assignment/${space.id}/$apr1"))
                .andExpect(status().isOk)
                .andReturn()
        val actualAssignments: List<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Assignment::class.java)
        )

        assertThat(actualAssignments.size).isEqualTo(2)
        assertThat(actualAssignments).contains(originalAssignmentToKeep, newAssignment)
        assertThat(actualAssignments).doesNotContain(originalAssignmentToReplace)
    }

    @Test
    fun `GET should return 400 when retrieving assignments given an invalid space` () {
        val bogusSpaceId = 99999999

        mockMvc.perform(get("/api/assignment/$bogusSpaceId/$apr1"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `GET should return all assignments for the given personId and a specific date`() {
        val oldAssignmentForPerson1: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                spaceId = space.id!!,
                effectiveDate = LocalDate.parse(mar1)
        ))
        val currentAssignmentForPerson1: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                spaceId = space.id!!,
                effectiveDate = LocalDate.parse(apr1)
        ))
        val futureAssignmentForPerson1: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                spaceId = space.id!!,
                effectiveDate = LocalDate.parse(apr2)
        ))

        val personTwo: Person = personRepository.save(Person(name = "person two", spaceId = space.id!!))
        val currentAssignmentForPerson2: Assignment = assignmentRepository.save(Assignment(
                person = personTwo,
                productId = productOne.id!!,
                spaceId = space.id!!,
                effectiveDate = LocalDate.parse(apr1)
        ))
        val futureAssignmentForPerson2: Assignment = assignmentRepository.save(Assignment(
                person = personTwo,
                productId = productOne.id!!,
                spaceId = space.id!!,
                effectiveDate = LocalDate.parse(apr2)
        ))

        val result = mockMvc.perform(get("/api/person/${person.id}/assignments/date/${apr1}"))
                .andExpect(status().isOk)
                .andReturn()
        val actualAssignments: List<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Assignment::class.java)
        )

        assertThat(assignmentRepository.count()).isEqualTo(5)
        assertThat(actualAssignments.size).isOne()
        assertThat(actualAssignments).contains(currentAssignmentForPerson1)
        assertThat(actualAssignments).doesNotContain(currentAssignmentForPerson2, futureAssignmentForPerson2)
        assertThat(actualAssignments).doesNotContain(oldAssignmentForPerson1, futureAssignmentForPerson1)
    }

    @Test
    fun `GET should return a set of effective dates given a space id`() {
        val savedAssignmentOne = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))

        val savedAssignmentTwo = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))

        val savedAssignmentThree = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = null,
                spaceId = space.id!!
        ))

        val response = mockMvc.perform(get("/api/assignment/dates/${space.id}"))
                .andExpect(status().isOk)
                .andReturn().response

        val result: Set<LocalDate> = objectMapper.readValue(
                response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, LocalDate::class.java))

        assertThat(result).hasSize(2)
        assertThat(result).contains(savedAssignmentOne.effectiveDate, savedAssignmentTwo.effectiveDate)
        assertThat(result).doesNotContain(savedAssignmentThree.effectiveDate)
    }

    @Test
    fun `GET should return 400 when retrieving effective dates given an invalid space` () {
        val bogusSpaceId = 99999999

        mockMvc.perform(get("/api/assignment/dates/$bogusSpaceId"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST should only replace any existing assignments for a given date`() {
        val nullAssignmentToKeep: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = null,
                spaceId = space.id!!
        ))

        val oldAssignmentToReplace: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
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
    fun `POST should not assign person to unassigned when given set of products` () {
        val assignmentRequest = CreateAssignmentsRequest(
                requestedDate = LocalDate.parse(apr1),
                person = person,
                products = Sets.newSet(
                    ProductPlaceholderPair (productId= unassignedProduct.id!!, placeholder = false ),
                    ProductPlaceholderPair (productId= productOne.id!!, placeholder = false )
                )
        )

        val expectedAssignment = Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        )

        val result = mockMvc.perform(post("/api/assignment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignmentRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val actualAssignments: Set<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, Assignment::class.java)
        )

        assertThat(assignmentRepository.count()).isOne()
        assertThat(assignmentRepository.findAll().first()).isEqualToIgnoringGivenFields(expectedAssignment,"id")
        assertThat(actualAssignments.first()).isEqualToIgnoringGivenFields(expectedAssignment, "id")
    }

    @Test
    fun `POST should assign person to unassigned when given only unassigned product` () {
        val unassignedAssignmentRequest = CreateAssignmentsRequest(
                requestedDate = LocalDate.parse(apr1),
                person = person,
                products = Sets.newSet(
                    ProductPlaceholderPair(productId = unassignedProduct.id!!, placeholder = false)
                )
        )

        val expectedAssignment = Assignment(
                person = person,
                productId = unassignedProduct.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        )

        val result = mockMvc.perform(post("/api/assignment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(unassignedAssignmentRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val actualAssignments: Set<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, Assignment::class.java)
        )

        assertThat(assignmentRepository.count()).isOne()
        assertThat(assignmentRepository.findAll().first()).isEqualToIgnoringGivenFields(expectedAssignment,"id")
        assertThat(actualAssignments.first()).isEqualToIgnoringGivenFields(expectedAssignment, "id")
    }

    @Test
    fun `POST should assign person to unassigned when given an empty set of products` () {
        assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))

        val emptyAssignmentRequest = CreateAssignmentsRequest(
                requestedDate = LocalDate.parse(apr1),
                person = person,
                products = Sets.newSet()
        )

        val expectedAssignment = Assignment(
                person = person,
                productId = unassignedProduct.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        )

        val result = mockMvc.perform(post("/api/assignment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyAssignmentRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val actualAssignments: Set<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, Assignment::class.java)
        )

        assertThat(assignmentRepository.count()).isOne()
        assertThat(assignmentRepository.findAll().first()).isEqualToIgnoringGivenFields(expectedAssignment,"id")
        assertThat(actualAssignments.first()).isEqualToIgnoringGivenFields(expectedAssignment, "id")
    }

    @Test
    fun `POST should return 400 when creating assignments given an invalid person` () {
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
    fun `POST should return 400 when creating assignments given an invalid product`() {
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
    fun `DELETE should return 200 when deleting a valid assignment`() {
        val assignmentToDelete = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        assertThat(assignmentRepository.count()).isOne()

        mockMvc.perform(delete("/api/assignment/delete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignmentToDelete)))
                .andExpect(status().isOk)

        assertThat(assignmentRepository.count()).isZero()
    }

    @Test
    fun `DELETE should return 200 when trying to delete an assignment that does not exist`() {
        val assignmentNotInDb = Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        )
        assertThat(assignmentRepository.count()).isZero()

        mockMvc.perform(delete("/api/assignment/delete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignmentNotInDb)))
                .andExpect(status().isOk)
    }

    @Test
    fun `DELETE should remove assignment(s) given person and date`() {
        val originalAssignmentForPerson: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))

        val newAssignmentForPerson: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))

        mockMvc.perform(delete("/api/assignment/delete/$apr1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(person)))
                .andExpect(status().isOk)

        assertThat(assignmentRepository.count()).isOne()
        assertThat(assignmentRepository.findAll()).contains(originalAssignmentForPerson)
        assertThat(assignmentRepository.findAll()).doesNotContain(newAssignmentForPerson)
    }

    @Test
    fun `DELETE should assign person to unassigned when no previous assignment exists`() {
        val originalAssignmentForPerson: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))

        val unassignedAssignmentForPerson = Assignment(
                person = person,
                productId = unassignedProduct.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        )

        mockMvc.perform(delete("/api/assignment/delete/$mar1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(person)))
                .andExpect(status().isOk)

        assertThat(assignmentRepository.count()).isOne()
        assertThat(assignmentRepository.findAll().first()).isEqualToIgnoringGivenFields(unassignedAssignmentForPerson, "id")
        assertThat(assignmentRepository.findAll()).doesNotContain(originalAssignmentForPerson)
    }
}