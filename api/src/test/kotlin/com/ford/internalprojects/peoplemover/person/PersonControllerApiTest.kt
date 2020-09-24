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

package com.ford.internalprojects.peoplemover.person

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.location.SpaceLocationRepository
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
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@AutoConfigureMockMvc
@SpringBootTest
@ActiveProfiles("test")
@RunWith(SpringRunner::class)
class PersonControllerApiTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var spaceRolesRepository: SpaceRolesRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private lateinit var space: Space

    var basePeopleUrl: String = ""

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "spaceWithThisName"))

        basePeopleUrl = "/api/spaces/" + space.uuid + "/people"
    }

    @After
    fun tearDown() {
        assignmentRepository.deleteAll()
        spaceRolesRepository.deleteAll()
        personRepository.deleteAll()
        productRepository.deleteAll()
        spaceLocationRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `POST should add a new person to the repository`() {
        val spaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Software Engineer", spaceId = space.id!!))

        val personToCreate = Person(
            name = "John",
            spaceRole = spaceRole,
            notes = "Some Notes",
            newPerson = true,
            spaceId = space.id!!
        )
        assertThat(personRepository.count()).isZero()
        val result = mockMvc.perform(post(basePeopleUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(personToCreate)))
            .andExpect(status().isOk)
            .andReturn()

        val actualPerson: Person = objectMapper.readValue(result.response.contentAsString, Person::class.java)

        assertThat(personRepository.count()).isOne()
        val personInDb: Person = personRepository.findAllBySpaceId(space.id!!).first()

        assertThat(actualPerson.name).isEqualTo(personToCreate.name)
        assertThat(actualPerson.spaceRole).isEqualTo(personToCreate.spaceRole)
        assertThat(actualPerson.notes).isEqualTo(personToCreate.notes)
        assertThat(actualPerson.newPerson).isEqualTo(personToCreate.newPerson)
        assertThat(actualPerson.spaceId).isEqualTo(personToCreate.spaceId)
        assertThat(actualPerson).isEqualTo(personInDb)
    }

    @Test
    fun `GET should return an empty set when no people belong to a space`() {
        val emptySpace: Space = spaceRepository.save(Space(name = "ChuckECheese"))
        val result = mockMvc
            .perform(get("/api/spaces/" + emptySpace.uuid + "/people")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isOk)
            .andReturn()
        val actualPeople: Set<Person> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, Person::class.java)
        )
        assertThat(actualPeople).isEqualTo(emptySet<Person>())
    }

    @Test
    fun `GET should only return people in requested space`() {
        val otherSpace: Space = spaceRepository.save(Space(name = "other"))
        val expectedPerson: Person = personRepository.save(Person(
            name = "HEY I SHOULD SHOW UP IN THE RESULTS",
            spaceId = space.id!!
        ))
        val unexpectedPerson: Person = personRepository.save(Person(
            name = "HEY I SHOULD NOT SHOW UP",
            spaceId = otherSpace.id!!
        ))
        val result = mockMvc
            .perform(get(basePeopleUrl)
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isOk)
            .andReturn()
        val actualPeople: Set<Person> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, Person::class.java)
        )
        assertThat(actualPeople).containsExactly(expectedPerson)
        assertThat(actualPeople).doesNotContain(unexpectedPerson)
    }

    @Test
    fun `GET should return 400 when requesting people from invalid space`() {
        mockMvc.perform(get("/api/spaces/FiveNightsAtFreddys/people")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isBadRequest)
            .andReturn()
    }

    @Test
    fun `PUT should update a person`() {
        val softwareEngineer: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Software Engineer", spaceId = space.id!!))
        val engineer = spaceRolesRepository.save(SpaceRole(name = "Engineer", spaceId = space.id!!))
        val person: Person = personRepository.save(Person(name = "John", spaceId = space.id!!, spaceRole = softwareEngineer))
        val updatePersonRequest = Person(
            id = person.id,
            name = "New John",
            spaceId = space.id!!,
            spaceRole = engineer
        )
        val result = mockMvc.perform(put(basePeopleUrl + "/${person.id}")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updatePersonRequest)))
            .andExpect(status().isOk)
            .andReturn()

        val updatedPerson: Person = objectMapper.readValue(
            result.response.contentAsString,
            Person::class.java
        )

        val updatedPersonInDb: Person = personRepository.findById(person.id!!).get()
        assertThat(updatedPerson).isEqualTo(updatePersonRequest)
        assertThat(updatedPersonInDb).isEqualTo(updatePersonRequest)
    }

    @Test
    fun `DELETE should return 400 when person does not exist`() {
        val notSavedPersonId = 1103
        mockMvc.perform(delete("$basePeopleUrl/$notSavedPersonId")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should remove person and associated assignments`() {
        val personToDelete: Person = personRepository.save(Person(name = "John", spaceId = space.id!!))
        val personToRemain: Person = personRepository.save(Person(name = "Jack", spaceId = space.id!!))
        assertThat(personRepository.count()).isEqualTo(2)

        val product: Product = productRepository.save(Product(name = "product", spaceId = space.id!!))
        val assignmentToDelete: Assignment = assignmentRepository.save(Assignment(person = personToDelete, productId = product.id!!, spaceId = space.id!!))
        val assignmentToRemain: Assignment = assignmentRepository.save(Assignment(person = personToRemain, productId = product.id!!, spaceId = space.id!!))
        assertThat(assignmentRepository.count()).isEqualTo(2)

        mockMvc.perform(delete("$basePeopleUrl/${personToDelete.id}")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)

        assertThat(personRepository.findAll()).containsExactly(personToRemain)
        assertThat(assignmentRepository.findAll()).containsExactly(assignmentToRemain)

        assertThat(personRepository.findAll()).doesNotContain(personToDelete)
        assertThat(assignmentRepository.findAll()).doesNotContain(assignmentToDelete)
    }

    @Test
    fun `GET total should return total number of persons`() {
        personRepository.save(Person(name = "John", spaceId = space.id!!))
        personRepository.save(Person(name = "Jack", spaceId = space.id!!))
        personRepository.save(Person(name = "Jill", spaceId = space.id!!))

        val request = mockMvc.perform(get("${basePeopleUrl}/total")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isOk)
            .andReturn()

        val totalPersonCount = request.response.contentAsString.toLong()

        assertThat(totalPersonCount).isEqualTo(3)
    }
}
