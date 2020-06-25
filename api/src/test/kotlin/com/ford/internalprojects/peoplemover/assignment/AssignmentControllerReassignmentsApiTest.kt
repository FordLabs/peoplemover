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
class AssignmentControllerReassignmentsApiTest {
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
    private lateinit var personTwo: Person

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
        personTwo = personRepository.save(Person(name = "Joey Britten", newPerson = true, spaceId = space.id!!))
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
    fun `GET should return all reassignments for the given spaceId and exact requested date`() {
        assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))

        val assignment: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        assignmentRepository.save(Assignment(
                person = person,
                productId = productThree.id!!,
                effectiveDate = LocalDate.parse(apr2),
                spaceId = space.id!!
        ))

        val reassignment = Reassignment(
                person = person,
                fromProductName = productOne.name,
                toProductName = productTwo.name,
                assignment = assignment
        )

        val result = mockMvc.perform(get("/api/reassignment/${space.id}/$apr1"))
                .andExpect(status().isOk)
                .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isOne()
        assertThat(actualReassignments.get(0).assignment.id).isEqualTo(assignment.id)
        assertThat(actualReassignments.get(0).fromProductName).isEqualTo(reassignment.fromProductName)
        assertThat(actualReassignments.get(0).toProductName).isEqualTo(reassignment.toProductName)
        assertThat(actualReassignments.get(0).person.id).isEqualTo(assignment.person.id)
    }

    @Test
    fun `GET should return handle reassignment logic for person with multiple assignments changing only one of the assignments`() {
        assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))
        assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))

        assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val assignment: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productThree.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))

        val reassignment = Reassignment(
                person = person,
                fromProductName = productOne.name,
                toProductName = productThree.name,
                assignment = assignment
        )

        val result = mockMvc.perform(get("/api/reassignment/${space.id}/$apr1"))
                .andExpect(status().isOk)
                .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isOne()
        assertThat(actualReassignments.get(0).assignment.id).isEqualTo(assignment.id)
        assertThat(actualReassignments.get(0).fromProductName).isEqualTo(reassignment.fromProductName)
        assertThat(actualReassignments.get(0).toProductName).isEqualTo(reassignment.toProductName)
        assertThat(actualReassignments.get(0).person.id).isEqualTo(assignment.person.id)
    }

    @Test
    fun `GET should return all reassignments should handle multiple historical assignments in db`() {

        assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))

        assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val assignment: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productThree.id!!,
                effectiveDate = LocalDate.parse(apr2),
                spaceId = space.id!!
        ))

        val reassignment = Reassignment(
                person = person,
                fromProductName = productTwo.name,
                toProductName = productThree.name,
                assignment = assignment
        )

        val result = mockMvc.perform(get("/api/reassignment/${space.id}/$apr2"))
                .andExpect(status().isOk)
                .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isOne()
        assertThat(actualReassignments.get(0).assignment.id).isEqualTo(assignment.id)
        assertThat(actualReassignments.get(0).fromProductName).isEqualTo(reassignment.fromProductName)
        assertThat(actualReassignments.get(0).toProductName).isEqualTo(reassignment.toProductName)
        assertThat(actualReassignments.get(0).person.id).isEqualTo(assignment.person.id)
    }

    @Test
    fun `GET should return reassignments with null fromProductName when there are no previous assignments`() {

        val assignment: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))

        val reassignment = Reassignment(
                person = person,
                fromProductName = null,
                toProductName = productOne.name,
                assignment = assignment
        )

        val result = mockMvc.perform(get("/api/reassignment/${space.id}/$mar1"))
                .andExpect(status().isOk)
                .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isOne()
        assertThat(actualReassignments.get(0).assignment.id).isEqualTo(assignment.id)
        assertThat(actualReassignments.get(0).fromProductName).isEqualTo(null)
        assertThat(actualReassignments.get(0).toProductName).isEqualTo(reassignment.toProductName)
        assertThat(actualReassignments.get(0).person.id).isEqualTo(assignment.person.id)
    }

    @Test
    fun `GET should return handle reassignments for multiple people being reassigned`() {


        assignmentRepository.save(Assignment(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))
        assignmentRepository.save(Assignment(
                person = personTwo,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(mar1),
                spaceId = space.id!!
        ))

        val assignmentForPersonTwo: Assignment = assignmentRepository.save(Assignment(
                person = personTwo,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))
        val assignmentForPerson: Assignment = assignmentRepository.save(Assignment(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceId = space.id!!
        ))

        val reassignmentForPerson = Reassignment(
                person = person,
                fromProductName = productOne.name,
                toProductName = productTwo.name,
                assignment = assignmentForPerson
        )

        val reassignmentForPersonTwo = Reassignment(
                person = personTwo,
                fromProductName = productTwo.name,
                toProductName = productOne.name,
                assignment = assignmentForPersonTwo
        )

        val result = mockMvc.perform(get("/api/reassignment/${space.id}/$apr1"))
                .andExpect(status().isOk)
                .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isEqualTo(2)
//        assertThat(actualReassignments.get(0).assignment.id).isEqualTo(assignment.id)
//        assertThat(actualReassignments.get(0).fromProductName).isEqualTo(reassignment.fromProductName)
//        assertThat(actualReassignments.get(0).toProductName).isEqualTo(reassignment.toProductName)
//        assertThat(actualReassignments.get(0).person.id).isEqualTo(assignment.person.id)
        assertThat(actualReassignments).contains(reassignmentForPerson)
        assertThat(actualReassignments).contains(reassignmentForPersonTwo)
    }
}