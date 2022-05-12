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

package com.ford.internalprojects.peoplemover.assignment

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AssignmentControllerReassignmentsApiTest : AssignmentControllerApiBaseTest() {
    @Test
    fun `GET should return all reassignments for the given spaceUuid and exact requested date`() {
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productThree.id!!,
                effectiveDate = LocalDate.parse(april2),
                spaceUuid = editableSpace.uuid
            )
        )

        val reassignment = Reassignment(
            person = person,
            originProductName = productOne.name,
            destinationProductName = productTwo.name
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, april1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isOne()
        assertThat(actualReassignments).contains(reassignment)
    }

    @Test
    fun `GET should handle reassignment logic for person with multiple assignments changing only one of the assignments`() {
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productThree.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )

        val reassignment = Reassignment(
            person = person,
            originProductName = productOne.name,
            destinationProductName = productThree.name
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, april1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isOne()
        assertThat(actualReassignments).contains(reassignment)
    }

    @Test
    fun `GET should return all reassignments should handle multiple historical assignments in db`() {

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productThree.id!!,
                effectiveDate = LocalDate.parse(april2),
                spaceUuid = editableSpace.uuid
            )
        )

        val reassignment = Reassignment(
            person = person,
            originProductName = productTwo.name,
            destinationProductName = productThree.name
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, april2))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isOne()
        assertThat(actualReassignments).contains(reassignment)
    }

    private fun baseReassignmentUrl(spaceUuid: String, date: String) = "/api/spaces/$spaceUuid/reassignment/$date"

    @Test
    fun `GET should return reassignments with empty string fromProductName when there are no previous assignments`() {

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        val reassignment = Reassignment(
            person = person,
            originProductName = "",
            destinationProductName = productOne.name
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, march1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isOne()
        assertThat(actualReassignments).contains(reassignment)
    }

    @Test
    fun `GET should return no reassignment when fromProductName is empty and toProductName is unassigned`() {
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = unassignedProduct.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, march1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isZero()
    }

    @Test
    fun `GET should handle reassignments for multiple people being reassigned and sort in reverse chronological order`() {


        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )
        assignmentRepository.save(
            AssignmentV1(
                person = personTwo,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = personTwo,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )

        val reassignmentForPerson = Reassignment(
            person = person,
            originProductName = productOne.name,
            destinationProductName = productTwo.name
        )

        val reassignmentForPersonTwo = Reassignment(
            person = personTwo,
            originProductName = productTwo.name,
            destinationProductName = productOne.name
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, april1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isEqualTo(2)
        assertThat(actualReassignments[0]).isEqualTo(reassignmentForPerson)
        assertThat(actualReassignments[1]).isEqualTo(reassignmentForPersonTwo)
    }

    @Test
    fun `GET should handle one assignment being cancelled when a person is on multiple assignments`() {
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = personTwo,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )

        val reassignmentForPerson = Reassignment(
            person = person,
            originProductName = productOne.name,
            destinationProductName = ""
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, april1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isEqualTo(1)
        assertThat(actualReassignments).contains(reassignmentForPerson)
    }

    @Test
    fun `GET should handle one assignment being cancelled when a person is on multiple assignments and there is more than one reassignment`() {
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = personTwo,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = personTwo,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )

        val reassignmentForPerson = Reassignment(
            person = person,
            originProductName = productOne.name,
            destinationProductName = ""
        )

        val reassignmentForPersonTwo = Reassignment(
            person = personTwo,
            originProductName = productTwo.name,
            destinationProductName = productOne.name
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, april1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isEqualTo(2)
        assertThat(actualReassignments).contains(reassignmentForPerson)
        assertThat(actualReassignments).contains(reassignmentForPersonTwo)
    }

    @Test
    fun `GET should handle one assignment being cancelled and one being reassigned when a person is on multiple assignments and there is more than one reassignment`() {
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productThree.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = personTwo,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = personTwo,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )

        val reassignmentForPerson = Reassignment(
            person = person,
            originProductName = productOne.name + " & " + productTwo.name,
            destinationProductName = productThree.name
        )

        val reassignmentForPersonTwo = Reassignment(
            person = personTwo,
            originProductName = productTwo.name,
            destinationProductName = productOne.name
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, april1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isEqualTo(2)
        assertThat(actualReassignments).contains(reassignmentForPerson)
        assertThat(actualReassignments).contains(reassignmentForPersonTwo)
    }

    @Test
    fun `GET should handle when one person is moved from two products to another two products `() {
        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productTwo.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productThree.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = person,
                productId = productFour.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = editableSpace.uuid
            )
        )


        val reassignmentForPerson = Reassignment(
            person = person,
            originProductName = productOne.name + " & " + productTwo.name,
            destinationProductName = productFour.name + " & " + productThree.name
        )


        val result = mockMvc.perform(
            get(baseReassignmentUrl(editableSpace.uuid, april1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isEqualTo(1)
        assertThat(actualReassignments).contains(reassignmentForPerson)
    }

    @Test
    fun `GET should return all reassignments when requested date is today for read only space`() {
        assignmentRepository.save(
            AssignmentV1(
                person = personInReadOnlySpace,
                productId = readOnlyProductOne.id!!,
                effectiveDate = LocalDate.parse(march1),
                spaceUuid = readOnlySpace.uuid
            )
        )

        assignmentRepository.save(
            AssignmentV1(
                person = personInReadOnlySpace,
                productId = readOnlyProductTwo.id!!,
                effectiveDate = LocalDate.parse(april1),
                spaceUuid = readOnlySpace.uuid
            )
        )
        assignmentRepository.save(
            AssignmentV1(
                person = personInReadOnlySpace,
                productId = readOnlyProductOne.id!!,
                effectiveDate = LocalDate.parse(today),
                spaceUuid = readOnlySpace.uuid
            )
        )

        val reassignment = Reassignment(
            person = personInReadOnlySpace,
            originProductName = readOnlyProductTwo.name,
            destinationProductName = readOnlyProductOne.name
        )

        val result = mockMvc.perform(
            get(baseReassignmentUrl(readOnlySpace.uuid, today))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()

        val actualReassignments: List<Reassignment> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Reassignment::class.java)
        )

        assertThat(actualReassignments.size).isOne()
        assertThat(actualReassignments).contains(reassignment)
    }

    @Test
    fun `GET should return all reassignments when requested date is tomorrow for read only space`() {
        val tomorrow = LocalDate.now().plusDays(1L).format(DateTimeFormatter.ISO_DATE)
        mockMvc.perform(
            get(baseReassignmentUrl(readOnlySpace.uuid, tomorrow))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()
    }

    @Test
    fun `GET should return all reassignments when requested date is yesterday for read only space`() {
        val yesterday = LocalDate.now().minusDays(1L).format(DateTimeFormatter.ISO_DATE)
        mockMvc.perform(
            get(baseReassignmentUrl(readOnlySpace.uuid, yesterday))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isOk)
            .andReturn()
    }

    @Test
    fun `GET should return FORBIDDEN when requested date is not valid for read only space`() {
        mockMvc.perform(
            get(baseReassignmentUrl(readOnlySpace.uuid, march1))
                .header("Authorization", "Bearer GOOD_TOKEN")
        )
            .andExpect(status().isForbidden)
            .andReturn()

    }
}
