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
import com.ford.internalprojects.peoplemover.board.Board
import com.ford.internalprojects.peoplemover.board.BoardRepository
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
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class AssignmentControllerApiTest {
    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var boardRepository: BoardRepository

    @Autowired
    private lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private lateinit var space: Space
    private lateinit var board: Board
    private lateinit var product: Product
    private lateinit var person: Person

    @Before
    fun setup() {
        space = spaceRepository.save(Space(name = "tok"))
        board = boardRepository.save(Board(name = "board", spaceId = space.id!!))
        product = productRepository.save(Product(name = "Justice League", boardId = board.id!!, spaceId = space.id!!))
        person = personRepository.save(Person(name = "Benjamin Britten", newPerson = true, spaceId = space.id!!))
    }

    @After
    fun teardown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        personRepository.deleteAll()
        spaceLocationRepository.deleteAll()
        boardRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `GET should return all assignments for the given personId`() {
        val personTwo: Person = personRepository.save(Person("person two", space.id!!))
        val assignmentWeShouldNotSee: Assignment = assignmentRepository.save(Assignment(person = personTwo, productId = product.id!!, spaceId = space.id!!))
        val assignmentWeShouldSee: Assignment = assignmentRepository.save(Assignment(person = person, productId = product.id!!, spaceId = space.id!!))

        val result = mockMvc.perform(get("/api/person/${person.id}/assignments"))
                .andExpect(status().isOk)
                .andReturn()
        val actualAssignments: List<Assignment> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Assignment::class.java)
        )
        assertThat(assignmentRepository.count()).isEqualTo(2);
        assertThat(actualAssignments.size).isOne()
        assertThat(actualAssignments).contains(assignmentWeShouldSee)
        assertThat(actualAssignments).doesNotContain(assignmentWeShouldNotSee)
    }

    @Test
    fun `PUT should update the placeholder in an assignment`() {
        val savedAssignment: Assignment = assignmentRepository.save(Assignment(person = person, productId = product.id!!, spaceId = space.id!!))
        val assignmentRequest = AssignmentRequest(personId = person.id!!, productId = product.id!!, placeholder = true)

        val result = mockMvc.perform(put("/api/assignment/" + savedAssignment.id)
                .content(objectMapper.writeValueAsString(assignmentRequest))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk)
                .andReturn()

        val actualAssignment: Assignment = objectMapper.readValue(result.response.contentAsString, Assignment::class.java)
        val expectedAssignment: Assignment = savedAssignment.copy(placeholder = true)

        assertThat(actualAssignment).isEqualTo(expectedAssignment)
        val actualAssignmentInDb: Assignment = assignmentRepository.findById(actualAssignment.id!!).get()
        assertThat(actualAssignmentInDb).isEqualTo(expectedAssignment)
    }

    @Test
    fun `POST create an assignment for the given person`() {
        val assignmentRequest = AssignmentRequest(personId = person.id!!, productId = product.id!!, placeholder = true)
        val result = mockMvc.perform(post("/api/assignment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignmentRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val actualAssignment: Assignment = objectMapper.readValue(result.response.contentAsString, Assignment::class.java)
        val expectedAssignment = Assignment(productId = assignmentRequest.productId, person = person, spaceId = space.id!!)

        assertThat(actualAssignment.person).isEqualTo(person)
        assertThat(actualAssignment.productId).isEqualTo(expectedAssignment.productId)
        assertThat(actualAssignment.spaceId).isEqualTo(expectedAssignment.spaceId)

        assertThat(assignmentRepository.count()).isOne()
        val assignmentFromDB: Assignment = assignmentRepository.findAll().first()
        assertThat(assignmentFromDB.person).isEqualTo(person)
        assertThat(assignmentFromDB.productId).isEqualTo(expectedAssignment.productId)
        assertThat(assignmentFromDB.spaceId).isEqualTo(expectedAssignment.spaceId)
    }

    @Test
    fun `POST should return 400 when given assignment with an invalid person`() {
        val bogusAssignmentRequest = AssignmentRequest(personId = 999999, productId = product.id!!)
        mockMvc.perform(post("/api/assignment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bogusAssignmentRequest)))
                .andExpect(status().isBadRequest)
        assertThat(assignmentRepository.count()).isZero()
    }

    @Test
    fun `POST should return 400 when given assignment with an invalid product`() {
        val bogusAssignmentRequest = AssignmentRequest(personId = person.id!!, productId = 99999999)
        mockMvc.perform(post("/api/assignment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bogusAssignmentRequest)))
                .andExpect(status().isBadRequest)
        assertThat(assignmentRepository.count()).isZero()
    }

    @Test
    fun `POST should prevent assigning the same person twice in a product`() {
        assignmentRepository.save(Assignment(person = person, productId = product.id!!, spaceId = space.id!!))
        val duplicateAssignmentRequest = AssignmentRequest(personId = person.id!!, productId = product.id!!)
        mockMvc.perform(post("/api/assignment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateAssignmentRequest)))
                .andExpect(status().isConflict)
        assertThat(assignmentRepository.count()).isOne()
    }

    @Test
    fun `POST should delete existing unassigned assignment for a person when assigning them to something else`() {
        val unassignedProduct: Product = productRepository.save(Product(name = "unassigned", boardId = board.id!!, spaceId = space.id!!))
        assignmentRepository.save(Assignment(person = person, productId = unassignedProduct.id!!, spaceId = space.id!!))
        val assignmentRequest = AssignmentRequest(personId = person.id!!, productId = product.id!!)
        mockMvc.perform(post("/api/assignment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignmentRequest)))
                .andExpect(status().isOk)
        val personsAssignment: Assignment = assignmentRepository.getByPersonId(person.id!!)[0]
        assertThat(assignmentRepository.count()).isOne()
        assertThat(personsAssignment.productId).isEqualTo(product.id!!)
    }

    @Test
    fun `DELETE should delete the assignment`() {
        val assignment: Assignment = assignmentRepository.save(Assignment(person = person, productId = product.id!!, spaceId = space.id!!))
        assertThat(assignmentRepository.count()).isOne();
        mockMvc.perform(delete("/api/assignment/${assignment.id}")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent)
                .andReturn()
        assertThat(assignmentRepository.count()).isZero()
    }

    @Test
    fun `DELETE should unassign person when their last assignment is deleted`() {
        val unassignedProduct: Product = productRepository.save(Product(name = "unassigned", boardId = board.id!!, spaceId = space.id!!))
        val lastAssignment: Assignment = assignmentRepository.save(Assignment(person = person, productId = product.id!!, spaceId = space.id!!))

        mockMvc.perform(delete("/api/assignment/${lastAssignment.id}")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent)
                .andReturn()
        val personsAssignment: Assignment = assignmentRepository.getByPersonId(person.id!!)[0]
        assertThat(assignmentRepository.count()).isOne()
        assertThat(personsAssignment.productId).isEqualTo(unassignedProduct.id)
    }
}