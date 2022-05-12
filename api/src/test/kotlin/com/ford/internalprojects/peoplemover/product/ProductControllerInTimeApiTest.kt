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

package com.ford.internalprojects.peoplemover.product

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.assignment.AssignmentV1
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ProductControllerInTimeApiTest {

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    private lateinit var spaceWithEditAccess: Space
    private lateinit var spaceWithReadOnlyAccess: Space
    private lateinit var person: Person
    private lateinit var product1: Product
    private lateinit var product2: Product
    private lateinit var product3: Product

    val mar1 = "2019-03-01"
    val apr1 = "2019-04-01"
    val apr2 = "2019-04-02"
    val may1 = "2019-05-01"
    val may2 = "2019-05-02"
    val jun1 = "2019-06-01"
    val sep1 = "2019-09-01"
    val today = LocalDate.now().format(DateTimeFormatter.ISO_DATE)

    var baseProductsUrl = ""

    private fun getBaseProductsUrl(spaceUuid: String) = "/api/spaces/$spaceUuid/products"
    val readOnlySpaceUuid = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"

    @BeforeEach
    fun setUp() {
        spaceWithEditAccess = spaceRepository.save(Space(name = "tik", uuid = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"))
        spaceWithReadOnlyAccess = spaceRepository.save(Space(name = "tok", uuid = readOnlySpaceUuid, todayViewIsPublic = true))
        person = personRepository.save(Person(name = "Benjamin Button", newPerson = true, spaceUuid = spaceWithEditAccess.uuid))
        product1 = productRepository.save(Product(
                name = "product one",
                startDate = LocalDate.parse(apr1),
                endDate = LocalDate.parse(jun1),
                spaceUuid = spaceWithEditAccess.uuid
        ))
        product2 = productRepository.save(Product(
                name = "product two",
                startDate = LocalDate.parse(may1),
                endDate = LocalDate.parse(jun1),
                spaceUuid = spaceWithEditAccess.uuid
        ))
        product3 = productRepository.save(Product(
                name = "product three, no write access",
                startDate = LocalDate.parse(may1),
                endDate = LocalDate.parse(today),
                spaceUuid = spaceWithReadOnlyAccess.uuid
        ))
        baseProductsUrl = getBaseProductsUrl(spaceWithEditAccess.uuid)

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = spaceWithEditAccess.uuid, permission = PERMISSION_OWNER))

    }

    @AfterEach
    fun tearDown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        personRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `GET should return all products given date when they are both active`() {
        val result = mockMvc.perform(get("$baseProductsUrl?requestedDate=$may1")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        val actualProduct1: Product = actualProducts[0]
        val actualProduct2: Product = actualProducts[1]
        assertThat(actualProduct1).isEqualTo(product1)
        assertThat(actualProduct2).isEqualTo(product2)
    }

    @Test
    fun `GET should include assignments for archived people`() {
        person.archiveDate = LocalDate.parse("1066-10-14")
        personRepository.save(person)
        val assignment = assignmentRepository.save(AssignmentV1(person=person, productId=product1.id ?: 0, spaceUuid=spaceWithEditAccess.uuid, effectiveDate = LocalDate.parse("1999-01-01")))

        val result = mockMvc.perform(get("$baseProductsUrl?requestedDate=$may1")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        val actualProduct1: Product = actualProducts[0]
        assertThat(actualProduct1.id).isEqualTo(product1.id)
        assertThat(actualProduct1.assignments.size).isOne()
        assertThat(actualProduct1.assignments.first().id).isEqualTo(assignment.id);
        assertThat(actualProduct1.assignments.first().person.archiveDate).isEqualTo(LocalDate.parse("1066-10-14"))
    }

    @Test
    fun `GET should return FORBIDDEN when accessing products without edit permission for a date that is not today`() {
        val baseUrl = getBaseProductsUrl(spaceWithReadOnlyAccess.uuid)
        mockMvc.perform(get("$baseUrl?requestedDate=$may1")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `GET should return OK when accessing products without edit permission for tomorrow`() {
        val baseUrl = getBaseProductsUrl(spaceWithReadOnlyAccess.uuid)
        val tomorrow = LocalDate.now().plusDays(1L).format(DateTimeFormatter.ISO_DATE)
        mockMvc.perform(get("$baseUrl?requestedDate=$tomorrow")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
    }

    @Test
    fun `GET should return OK when accessing products without edit permission for yesterday`() {
        val baseUrl = getBaseProductsUrl(spaceWithReadOnlyAccess.uuid)
        val yesterday = LocalDate.now().minusDays(1L).format(DateTimeFormatter.ISO_DATE)
        mockMvc.perform(get("$baseUrl?requestedDate=$yesterday")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
    }

    @Test
    fun `GET should return 403 when valid token does not have read access and the space's read-only flag is off`() {
        mockMvc.perform(get("$baseProductsUrl?requestedDate=$today")
            .header("Authorization", "Bearer ANONYMOUS_TOKEN"))
            .andExpect(status().isForbidden)
            .andReturn()
    }

    @Test
    fun `GET should return products for read only space when requesting today's data`() {
        val baseUrl = getBaseProductsUrl(spaceWithReadOnlyAccess.uuid)
        val result = mockMvc.perform(get("$baseUrl?requestedDate=$today")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        val actualProduct: Product = actualProducts[0]
        assertThat(actualProduct).isEqualTo(product3)
    }

    @Test
    fun `GET should return all products even after end date has passed`() {
        val result = mockMvc.perform(get("$baseProductsUrl?requestedDate=$sep1")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        val actualProduct1: Product = actualProducts[0]
        val actualProduct2: Product = actualProducts[1]
        assertThat(actualProduct1).isEqualTo(product1)
        assertThat(actualProduct2).isEqualTo(product2)
    }

    @Test
    fun `GET should return only first product given date when only first product is active`() {
        val result = mockMvc.perform(get("$baseProductsUrl?requestedDate=$apr1")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        assertThat(actualProducts.size).isOne()
        val actualProduct2: Product = actualProducts[0]
        assertThat(actualProduct2).isEqualTo(product1)
    }

    @Test
    fun `GET should return products with only assignments effective on or before given date`() {
        val formerAssignment: AssignmentV1 = assignmentRepository.save(AssignmentV1(
                person = person,
                productId = product1.id!!,
                effectiveDate = LocalDate.parse(apr1),
                spaceUuid = spaceWithEditAccess.uuid
        ))
        val currentAssignment: AssignmentV1 = assignmentRepository.save(AssignmentV1(
                person = person,
                productId = product1.id!!,
                effectiveDate = LocalDate.parse(apr2),
                startDate = LocalDate.parse(apr1),
                spaceUuid = spaceWithEditAccess.uuid
        ))
        val futureAssignment: AssignmentV1 = assignmentRepository.save(AssignmentV1(
                person = person,
                productId = product1.id!!,
                effectiveDate = LocalDate.parse(may1),
                spaceUuid = spaceWithEditAccess.uuid
        ))

        val result = mockMvc.perform(get("$baseProductsUrl?requestedDate=$apr2")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        val actualProduct2: Product = actualProducts[0]

        assertThat(assignmentRepository.count()).isEqualTo(3)
        assertThat(actualProduct2.assignments.size).isOne()
        assertThat(actualProduct2.assignments).contains(currentAssignment)
        assertThat(actualProduct2.assignments).doesNotContain(formerAssignment, futureAssignment)
    }

    @Test
    fun `GET should return no products for date that is before both start dates`() {
        val result = mockMvc.perform(get("$baseProductsUrl?requestedDate=$mar1")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        assertThat(actualProducts.size).isZero()
    }

    @Test
    fun `GET should return only the null start date product`() {
        val nullStartProduct: Product = productRepository.save(Product(
                name = "product with null start date",
                endDate = LocalDate.of(2020, 10, 1),
                spaceUuid = spaceWithEditAccess.uuid
        ))

        val result = mockMvc.perform(get("$baseProductsUrl?requestedDate=$sep1")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        assertThat(actualProducts.size).isEqualTo(3)
        assertThat(actualProducts[0]).isEqualTo(product1)
        assertThat(actualProducts[1]).isEqualTo(product2)
        assertThat(actualProducts[2]).isEqualTo(nullStartProduct)
    }

    @Test
    fun `PUT should update assignments when moving start date to future date`() {
        assignmentRepository.save(AssignmentV1(person = person, productId = product1.id!!, effectiveDate = LocalDate.parse(apr1), spaceUuid = spaceWithEditAccess.uuid))

        val newProductStartDate = LocalDate.parse(apr2)

        val productEditRequest = ProductRequest(
                name = product1.name,
                startDate = newProductStartDate
        )

        val result = mockMvc.perform(put(baseProductsUrl + "/" + product1.id)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productEditRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val expectedAssignment = AssignmentV1(person = person, productId = product1.id!!, effectiveDate = newProductStartDate, spaceUuid = spaceWithEditAccess.uuid)
        val actualAssignment = assignmentRepository.findAll().first()

        assertThat(assignmentRepository.count()).isOne()
        assertThat(actualAssignment)
            .usingRecursiveComparison()
            .ignoringFields("id")
            .isEqualTo(expectedAssignment)

        val actualProduct: Product = objectMapper.readValue(
                result.response.contentAsString,
                Product::class.java
        )

        assertThat(actualProduct.startDate).isEqualTo(newProductStartDate)
    }

    @Test
    fun `PUT should not alter other assignments when moving start date to future date`() {
        val untouchedAssignment = assignmentRepository.save(
                AssignmentV1(person = person, productId = product1.id!!, effectiveDate = LocalDate.parse(may1), spaceUuid = spaceWithEditAccess.uuid)
        )
        assignmentRepository.save(
                AssignmentV1(person = person, productId = product2.id!!, effectiveDate = LocalDate.parse(may1), spaceUuid = spaceWithEditAccess.uuid)
        )

        val newProductStartDate = LocalDate.parse(may2)

        val productEditRequest = ProductRequest(
                name = product2.name,
                startDate = newProductStartDate
        )

        mockMvc.perform(put(baseProductsUrl + "/" + product2.id)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productEditRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val expectedSameAssignment = AssignmentV1(person = person, productId = product1.id!!, effectiveDate = newProductStartDate, spaceUuid = spaceWithEditAccess.uuid)
        val expectedNewAssignment = AssignmentV1(person = person, productId = product2.id!!, effectiveDate = newProductStartDate, spaceUuid = spaceWithEditAccess.uuid)
        val actualAssignments = assignmentRepository.findAll().toList()

        assertThat(assignmentRepository.count()).isEqualTo(3)

        assertThat(actualAssignments[0]).isEqualTo(untouchedAssignment)
        assertThat(actualAssignments[1])
            .usingRecursiveComparison()
            .ignoringFields("id")
            .isEqualTo(expectedSameAssignment)
        assertThat(actualAssignments[2])
            .usingRecursiveComparison()
            .ignoringFields("id")
            .isEqualTo(expectedNewAssignment)
    }

    @Test
    fun `PUT should delete old assignment when moving start date of product to future date while person is on a different`() {
        assignmentRepository.save(AssignmentV1(person = person, productId = product1.id!!, effectiveDate = LocalDate.parse(apr1), spaceUuid = spaceWithEditAccess.uuid))
        val currentAssignment = assignmentRepository.save(AssignmentV1(person = person, productId = product2.id!!, effectiveDate = LocalDate.parse(may1), spaceUuid = spaceWithEditAccess.uuid))

        val newProductStartDate = LocalDate.parse(may2)

        val productEditRequest = ProductRequest(
                name = product1.name,
                startDate = newProductStartDate
        )

        mockMvc.perform(put(baseProductsUrl + "/" + product1.id)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productEditRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val actualAssignments = assignmentRepository.findAll().toList()

        assertThat(assignmentRepository.count()).isOne()
        assertThat(actualAssignments.first()).isEqualTo(currentAssignment)
    }
}
