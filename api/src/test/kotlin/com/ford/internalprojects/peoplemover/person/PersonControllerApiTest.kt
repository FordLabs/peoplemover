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

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.*
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.SpaceService
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocationRepository
import com.ford.internalprojects.peoplemover.tag.person.PersonTag
import com.ford.internalprojects.peoplemover.tag.person.PersonTagRepository
import com.ford.internalprojects.peoplemover.tag.role.SpaceRole
import com.ford.internalprojects.peoplemover.tag.role.SpaceRolesRepository
import com.ford.internalprojects.peoplemover.utilities.CHAR_260
import com.ford.internalprojects.peoplemover.utilities.EMPTY_NAME
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate

@AutoConfigureMockMvc
@SpringBootTest
@ActiveProfiles("test")
class PersonControllerApiTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var spaceService: SpaceService

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var spaceRolesRepository: SpaceRolesRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var assignmentService: AssignmentService

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    private lateinit var personTagRepository: PersonTagRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    private lateinit var space: Space
    private lateinit var spaceTwo: Space

    private lateinit var tag: PersonTag

    var basePeopleUrl: String = ""

    private fun getBasePeopleUrl(spaceUuid: String) = "/api/spaces/$spaceUuid/people"

    @BeforeEach
    fun setUp() {
        space = spaceService.createSpaceWithName("spaceWithThisName", "Nobody")
        spaceTwo = spaceService.createSpaceWithName("spaceThatUserDoesNotHaveAccessTo", "Nobody")

        tag = personTagRepository.save(PersonTag(spaceUuid = space.uuid, name = "Agency Employee"))

        basePeopleUrl = getBasePeopleUrl(space.uuid)

        userSpaceMappingRepository.save(
            UserSpaceMapping(
                userId = "USER_ID",
                spaceUuid = space.uuid,
                permission = PERMISSION_OWNER
            )
        )

    }

    @AfterEach
    fun tearDown() {
        assignmentRepository.deleteAll()
        spaceRolesRepository.deleteAll()
        personRepository.deleteAll()
        productRepository.deleteAll()
        spaceLocationRepository.deleteAll()
        spaceRepository.deleteAll()
        personTagRepository.deleteAll()
    }

    @Test
    fun `POST should add a new person to the repository`() {
        val spaceRole: SpaceRole = spaceRolesRepository.save(
            SpaceRole(
                name = "Software Engineer",
                spaceUuid = space.uuid
            )
        )

        val personToCreate = Person(
            name = "John",
            spaceRole = spaceRole,
            notes = "Some Notes",
            newPerson = true,
            spaceUuid = space.uuid,
            tags = setOf(tag),
            customField1 = "John35"
        )
        assertThat(personRepository.count()).isZero()
        val result = mockMvc.perform(
            post(basePeopleUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(personToCreate))
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualPerson: Person = objectMapper.readValue(result.response.contentAsString, Person::class.java)

        assertThat(personRepository.count()).isOne()
        val personInDb: Person = personRepository.findAllBySpaceUuid(space.uuid).first()

        assertThat(actualPerson.name).isEqualTo(personToCreate.name)
        assertThat(actualPerson.spaceRole).isEqualTo(personToCreate.spaceRole)
        assertThat(actualPerson.notes).isEqualTo(personToCreate.notes)
        assertThat(actualPerson.newPerson).isEqualTo(personToCreate.newPerson)
        assertThat(actualPerson.spaceUuid).isEqualTo(personToCreate.spaceUuid)
        assertThat(actualPerson).isEqualTo(personInDb)
        assertThat(actualPerson.tags).containsOnly(tag)
        assertThat(actualPerson.customField1).isEqualTo(personToCreate.customField1)
    }

    @Test
    fun `POST should not require custom field`() {
        val spaceRole: SpaceRole = spaceRolesRepository.save(
            SpaceRole(
                name = "Software Engineer",
                spaceUuid = space.uuid
            )
        )

        val personToCreate = Person(
            name = "John",
            spaceRole = spaceRole,
            notes = "Some Notes",
            newPerson = true,
            spaceUuid = space.uuid,
            tags = setOf(tag)
        )
        assertThat(personRepository.count()).isZero()
        val result = mockMvc.perform(
            post(basePeopleUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(personToCreate))
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualPerson: Person = objectMapper.readValue(result.response.contentAsString, Person::class.java)

        assertThat(personRepository.count()).isOne()
        val personInDb: Person = personRepository.findAllBySpaceUuid(space.uuid).first()

        assertThat(actualPerson.name).isEqualTo(personToCreate.name)
        assertThat(actualPerson.spaceRole).isEqualTo(personToCreate.spaceRole)
        assertThat(actualPerson.notes).isEqualTo(personToCreate.notes)
        assertThat(actualPerson.newPerson).isEqualTo(personToCreate.newPerson)
        assertThat(actualPerson.spaceUuid).isEqualTo(personToCreate.spaceUuid)
        assertThat(actualPerson).isEqualTo(personInDb)
        assertThat(actualPerson.tags).containsOnly(tag)
        assertThat(actualPerson.customField1).isEqualTo(null)
    }

    @Test
    fun `POST should return 403 when trying to add person to a space without write authorization`() {
        val requestBodyObject = Person(name = "name", spaceUuid = space.uuid)

        mockMvc.perform(
            post(basePeopleUrl)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject))
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `POST should return 200 and put the user in the url path space, not the person space uuid`() {
        val newPersonName = "tryToAddToSpaceTwo"
        val requestBodyObject = Person(name = newPersonName, spaceUuid = spaceTwo.uuid)

        mockMvc.perform(
            post(basePeopleUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject))
        )
            .andExpect(status().isOk)

        assertThat(personRepository.findAllBySpaceUuid(space.uuid).map { it.name }).contains(newPersonName)
        assertThat(personRepository.findAllBySpaceUuid(spaceTwo.uuid)).isEmpty()
    }

    @Test
    fun `POST should return 200 when archiving a person who is not archived, and the person becomes unassigned and archived`() {
        val today = LocalDate.now()
        var product = Product(name = "productOne", spaceUuid = space.uuid)
        productRepository.save(product)
        val requestBodyObject = Person(name = "archivedPerson", spaceUuid = space.uuid)
        personRepository.save(requestBodyObject)
        val assignment = AssignmentV1(
            productId = product.id!!,
            person = requestBodyObject,
            effectiveDate = LocalDate.ofYearDay(2020, 1),
            spaceUuid = space.uuid
        )
        assignmentRepository.save(assignment)
        val archivePersonRequest = ArchivePersonRequest(today)

        mockMvc.perform(
            post("$basePeopleUrl/${requestBodyObject.id}/archive")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(archivePersonRequest))
        )
            .andExpect(status().isOk)

        val archivedPerson = personRepository.findById(requestBodyObject.id!!)
        assertThat(archivedPerson.get().archiveDate).isEqualTo(today)
        val unassignedProduct = productRepository.findProductByNameAndSpaceUuid("unassigned", space.uuid)
        assertThat(unassignedProduct?.assignments?.size).isOne()
        val unassignedPerson = unassignedProduct?.assignments?.first()?.person
        assertThat(unassignedPerson?.name).isEqualTo("archivedPerson")
        assertThat(unassignedPerson?.archiveDate).isEqualTo(today)
    }

    @Test
    fun `POST should return 200 when archiving a person who already is archived, but not change archive date`() {
        val unassignedProduct = productRepository.findProductByNameAndSpaceUuid("unassigned", space.uuid)
        val requestBodyObject =
            Person(name = "archivedPerson", spaceUuid = space.uuid, archiveDate = LocalDate.ofYearDay(2020, 1))
        personRepository.save(requestBodyObject)
        val archivePersonRequest = ArchivePersonRequest(LocalDate.now())
        val createAssignmentRequest = CreateAssignmentsRequest(
            LocalDate.ofYearDay(2020, 1),
            setOf(ProductPlaceholderPair(unassignedProduct!!.id!!, false))
        )
        val assignments = assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(
            createAssignmentRequest,
            space.uuid,
            requestBodyObject.id!!
        )

        mockMvc.perform(
            post("$basePeopleUrl/${requestBodyObject.id}/archive")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(archivePersonRequest))
        )
            .andExpect(status().isOk)

        val archivedPerson = personRepository.findById(requestBodyObject.id!!)
        assertThat(archivedPerson.get().archiveDate).isEqualTo("2020-01-01")
        val actualAssignment = assignmentRepository.getByPersonIdAndSpaceUuid(archivedPerson.get().id!!, space.uuid)
        assertThat(actualAssignment.size).isOne()
        assertThat(actualAssignment.first().id).isEqualTo(assignments.first().id)
    }

    @Test
    fun `POST should return 200 when archiving a person who is already unassigned, but not yet archived`() {
        val today = LocalDate.now()
        val unassignedProduct = productRepository.findProductByNameAndSpaceUuid("unassigned", space.uuid)
        val requestBodyObject = Person(name = "archivedPerson", spaceUuid = space.uuid)
        personRepository.save(requestBodyObject)
        val archivePersonRequest = ArchivePersonRequest(today)
        val createAssignmentRequest = CreateAssignmentsRequest(
            LocalDate.ofYearDay(2020, 1),
            setOf(ProductPlaceholderPair(unassignedProduct!!.id!!, false))
        )
        val assignments = assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(
            createAssignmentRequest,
            space.uuid,
            requestBodyObject.id!!
        )

        mockMvc.perform(
            post("$basePeopleUrl/${requestBodyObject.id}/archive")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(archivePersonRequest))
        )
            .andExpect(status().isOk)

        val archivedPerson = personRepository.findById(requestBodyObject.id!!)
        assertThat(archivedPerson.get().archiveDate).isEqualTo(today)
        val actualAssignment = assignmentRepository.getByPersonIdAndSpaceUuid(archivedPerson.get().id!!, space.uuid)
        assertThat(actualAssignment.size).isOne()
        assertThat(actualAssignment.first().id).isEqualTo(assignments.first().id)
    }

    @Test
    fun `POST should return 400 when archiving someone who does not exist`() {
        val archivePersonRequest = ArchivePersonRequest(LocalDate.now())

        mockMvc.perform(
            post("$basePeopleUrl/1/archive")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(archivePersonRequest))
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST should return 403 when archiving someone for a space that doesn't exist`() {
        val archivePersonRequest = ArchivePersonRequest(LocalDate.now())

        mockMvc.perform(
            post(getBasePeopleUrl("fake-uuid") + "/1/archive")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(archivePersonRequest))
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `POST should return 403 when trying to archive a person in a space without write authorization`() {
        val requestBodyObject = Person(name = "oldname", spaceUuid = space.uuid)
        personRepository.save(requestBodyObject)
        val archivePersonRequest = ArchivePersonRequest(LocalDate.now())

        mockMvc.perform(
            post("${basePeopleUrl}/${requestBodyObject.id!!}/archive")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(archivePersonRequest))
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `POST should return 400 when trying to archive a person and no archive date is supplied`() {
        val requestBodyObject = Person(name = "oldname", spaceUuid = space.uuid)
        personRepository.save(requestBodyObject)

        mockMvc.perform(
            post("${basePeopleUrl}/${requestBodyObject.id!!}/archive")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "archiveDate": null
                    }
                """.trimIndent()
                )
        ).andExpect(status().isBadRequest)
    }

    @Test
    fun `POST should return 400 when trying to archive a person and no content is supplied`() {
        val requestBodyObject = Person(name = "oldname", spaceUuid = space.uuid)
        personRepository.save(requestBodyObject)

        mockMvc.perform(
            post("${basePeopleUrl}/${requestBodyObject.id!!}/archive")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should return 403 when trying to edit a person in a space without write authorization`() {
        val requestBodyObject = Person(name = "oldname", spaceUuid = space.uuid)
        personRepository.save(requestBodyObject)

        mockMvc.perform(
            put("${getBasePeopleUrl(spaceUuid = space.uuid)}/${requestBodyObject.id!!}")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject))
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `PUT should return 400 when trying to edit a person that is not in the space you have access to`() {
        val requestBodyObject = Person(name = "oldname", spaceUuid = spaceTwo.uuid)
        personRepository.save(requestBodyObject)

        mockMvc.perform(
            put("${getBasePeopleUrl(spaceUuid = space.uuid)}/${requestBodyObject.id!!}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject))
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `GET should return an empty set when no people belong to a space`() {
        val emptySpace: Space = spaceRepository.save(Space(name = "ChuckECheese"))
        userSpaceMappingRepository.save(
            UserSpaceMapping(
                userId = "USER_ID",
                spaceUuid = emptySpace.uuid,
                permission = PERMISSION_OWNER
            )
        )

        val result = mockMvc
            .perform(
                get(getBasePeopleUrl(emptySpace.uuid))
                    .header("Authorization", "Bearer GOOD_TOKEN")
            )
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
        val expectedPerson: Person = personRepository.save(
            Person(
                name = "HEY I SHOULD SHOW UP IN THE RESULTS",
                spaceUuid = space.uuid
            )
        )
        val unexpectedPerson: Person = personRepository.save(
            Person(
                name = "HEY I SHOULD NOT SHOW UP",
                spaceUuid = otherSpace.uuid
            )
        )
        val result = mockMvc
            .perform(
                get(basePeopleUrl)
                    .header("Authorization", "Bearer GOOD_TOKEN")
            )
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
    fun `GET should return 403 when valid token does not have read access and the space's read-only flag is off`() {
        mockMvc.perform(
            get(basePeopleUrl)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        )
            .andExpect(status().isForbidden)
            .andReturn()
    }

    @Test
    fun `GET should return 200 read-only when valid token that isn't an editor requests a space while read-only flag is on`() {
        val space1: Space = spaceRepository.save(Space(name = "SpaceOne", todayViewIsPublic = true))

        mockMvc.perform(
            get(getBasePeopleUrl(space1.uuid))
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()
    }

    @Test
    fun `GET should return 400 when requesting people from invalid space`() {
        mockMvc.perform(
            get(getBasePeopleUrl("FiveNightsAtFreddys"))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isBadRequest)
            .andReturn()
    }

    @Test
    fun `PUT should update a person`() {
        val softwareEngineer: SpaceRole = spaceRolesRepository.save(
            SpaceRole(
                name = "Software Engineer",
                spaceUuid = space.uuid
            )
        )
        val engineer = spaceRolesRepository.save(
            SpaceRole(
                name = "Engineer",
                spaceUuid = space.uuid
            )
        )
        val person: Person = personRepository.save(
            Person(
                name = "John",
                spaceUuid = space.uuid,
                spaceRole = softwareEngineer
            )
        )
        val updatePersonRequest = Person(
            id = person.id,
            name = "New John",
            spaceUuid = space.uuid,
            spaceRole = engineer,
            archiveDate = LocalDate.ofYearDay(2020, 2)
        )
        val result = mockMvc.perform(
            put(basePeopleUrl + "/${person.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatePersonRequest))
        )
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
        mockMvc.perform(
            delete("$basePeopleUrl/$notSavedPersonId")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should return 403 when trying to delete a person without write authorization`() {
        val personToDelete: Person = personRepository.save(Person(name = "Donald", spaceUuid = space.uuid))

        mockMvc.perform(
            delete("$basePeopleUrl/${personToDelete.id!!}")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `DELETE should return 400 when trying to delete a person in a space you do not have access to`() {
        val personToDelete: Person = personRepository.save(Person(name = "Donald", spaceUuid = spaceTwo.uuid))

        mockMvc.perform(
            delete("$basePeopleUrl/${personToDelete.id!!}")
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should remove person and associated assignments`() {
        val personToDelete: Person = personRepository.save(Person(name = "John", spaceUuid = space.uuid))
        val personToRemain: Person = personRepository.save(Person(name = "Jack", spaceUuid = space.uuid))
        assertThat(personRepository.count()).isEqualTo(2)

        val product: Product = productRepository.save(Product(name = "product", spaceUuid = space.uuid))
        val assignmentToDelete: AssignmentV1 = assignmentRepository.save(
            AssignmentV1(
                person = personToDelete,
                productId = product.id!!,
                spaceUuid = space.uuid
            )
        )
        val assignmentToRemain: AssignmentV1 = assignmentRepository.save(
            AssignmentV1(
                person = personToRemain,
                productId = product.id!!,
                spaceUuid = space.uuid
            )
        )
        assertThat(assignmentRepository.count()).isEqualTo(2)

        mockMvc.perform(
            delete("$basePeopleUrl/${personToDelete.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)

        assertThat(personRepository.findAll()).containsExactly(personToRemain)
        assertThat(assignmentRepository.findAll()).containsExactly(assignmentToRemain)

        assertThat(personRepository.findAll()).doesNotContain(personToDelete)
        assertThat(assignmentRepository.findAll()).doesNotContain(assignmentToDelete)
    }

    @Test
    fun `POST should disallow invalid PersonRequest inputs`() {
        val nameTooLong = Person(name = CHAR_260, spaceUuid = space.uuid)
        mockMvc.perform(
            post(basePeopleUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nameTooLong))
        )
            .andExpect(status().isBadRequest)
            .andReturn()
        val nameBlank = Person(name = EMPTY_NAME, spaceUuid = space.uuid)
        mockMvc.perform(
            post(basePeopleUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nameBlank))
        )
            .andExpect(status().isBadRequest)
            .andReturn()
        val notesTooLong = Person(name = "person name", spaceUuid = space.uuid, notes = CHAR_260)
        mockMvc.perform(
            post(basePeopleUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notesTooLong))
        )
            .andExpect(status().isBadRequest)
            .andReturn()
    }

    @Test
    fun `PUT should disallow invalid PersonRequest inputs`() {
        val person = personRepository.save(Person(name = "test person", spaceUuid = space.uuid))
        val nameTooLong = Person(id = person.id!!, name = CHAR_260, spaceUuid = space.uuid)
        mockMvc.perform(
            put(basePeopleUrl + "/${person.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nameTooLong))
        )
            .andExpect(status().isBadRequest)
            .andReturn()
        val nameBlank = Person(id = person.id!!, name = EMPTY_NAME, spaceUuid = space.uuid)
        mockMvc.perform(
            put(basePeopleUrl + "/${person.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nameBlank))
        )
            .andExpect(status().isBadRequest)
            .andReturn()
        val notesTooLong = Person(id = person.id!!, name = "person name", spaceUuid = space.uuid, notes = CHAR_260)
        mockMvc.perform(
            put(basePeopleUrl + "/${person.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notesTooLong))
        )
            .andExpect(status().isBadRequest)
            .andReturn()
    }
}
