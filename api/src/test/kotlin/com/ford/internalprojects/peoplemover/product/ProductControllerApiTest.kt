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

package com.ford.internalprojects.peoplemover.product

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.location.SpaceLocationRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
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
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.*

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ProductControllerApiTest {

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    private lateinit var mockMvc: MockMvc
    private lateinit var space: Space

    var baseProductsUrl: String = ""

    private fun getBaseProductUrl(spaceUuid: String) = "/api/spaces/${spaceUuid}/products"
    private fun getSingleProductUrl(productId: Int) = baseProductsUrl + "/${productId}"

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "tok", uuid = "aaa-aaa-aaaa-aaaaa"))
        baseProductsUrl = getBaseProductUrl(space.uuid)
        userSpaceMappingRepository.save(UserSpaceMapping(spaceId = space.id!!, userId = "USER_ID", spaceUuid = space.uuid))
    }

    @After
    fun tearDown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        personRepository.deleteAll()
        spaceLocationRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `POST should create new Product`() {
        val productAddRequest = ProductAddRequest(name = "product one")

        val result = mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productAddRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val actualProduct: Product = objectMapper.readValue(
                result.response.contentAsString,
                Product::class.java
        )
        val productInDB: Product = productRepository.findByName("product one")!!

        assertThat(actualProduct.name).isEqualTo(productAddRequest.name)
        assertThat(actualProduct.spaceId).isEqualTo(space.id!!)
        assertThat(actualProduct).isEqualTo(productInDB)
    }

    @Test
    fun `POST should return 400 when trying to create product with no product name`() {
        val productAddRequest = ProductAddRequest(name = "")

        val result = mockMvc.perform(
                post(baseProductsUrl)
                        .header("Authorization", "Bearer GOOD_TOKEN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productAddRequest))
        )
                .andExpect(status().isBadRequest)
                .andReturn()

        val response = result.resolvedException!!.message
        assertThat(response).contains("Invalid Product in Request. Did you forget to provide a name for the product?")
    }

    @Test
    fun `POST should return 409 when trying to create product of the same name`() {
        productRepository.save(Product(name = "product one", spaceId = space.id!!, spaceUuid = space.uuid))
        val productAddRequest = ProductAddRequest(name = "product one")

        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productAddRequest)))
                .andExpect(status().isConflict)
    }

      @Test
      fun `POST should return 403 when trying to create a product without write authorization`() {
        val requestBodyObject = ProductAddRequest("Not blank")

        mockMvc.perform(post(baseProductsUrl)
              .header("Authorization", "Bearer ANONYMOUS_TOKEN")
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(requestBodyObject)))
              .andExpect(status().isForbidden)
      }


    @Test
    fun `PUT should return 406 when trying to update product with too many characters in notes field`() {
        val product: Product = productRepository.save(Product(name = "test", spaceId = space.id!!, spaceUuid = space.uuid))
        val productEditRequest = ProductEditRequest(
                id = product.id!!,
                name = product.name,
                notes = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678" +
                        "9012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345" +
                        "6789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012" +
                        "3456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
                        "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456" +
                        "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456" +
                        "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456" +
                        "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456" +
                        "789012345678901234567890"
        )
        mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productEditRequest)))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should update a product`() {
        val product: Product = productRepository.save(Product(name = "test", spaceId = space.id!!, spaceUuid = space.uuid))
        val person: Person = personRepository.save(Person(name = "bob", spaceId = space.id!!, spaceUuid = space.uuid))
        assignmentRepository.save(Assignment(person = person, productId = product.id!!, spaceId = space.id!!))
        val productEditRequest = ProductEditRequest(
                name = "product two",
                id = product.id!!
        )

        val result = mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productEditRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val expectedProduct: Product = product.copy(
                name = "product two"
        )
        val actualProduct: Product = objectMapper.readValue(
                result.response.contentAsString,
                Product::class.java
        )
        // should actualProduct have the assignment in it? productInDb will have it
        val productInDb: Product = productRepository.findByIdOrNull(product.id!!)!!
        assertThat(actualProduct).isEqualTo(expectedProduct)
        assertThat(actualProduct).isEqualToIgnoringGivenFields(productInDb, "assignments")
    }

    @Test
    fun `PUT should return 409 when updating product with an already existing product name`() {
        val product1: Product = productRepository.save(Product(name = "product one", spaceId = space.id!!, spaceUuid = space.uuid))
        val product2: Product = productRepository.save(Product(name = "product two", spaceId = space.id!!, spaceUuid = space.uuid))
        product1.name = product2.name

        mockMvc.perform(put(getSingleProductUrl(product1.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `PUT should return 400 when trying to update non existing product`() {
        val result = mockMvc.perform(put(getSingleProductUrl(700))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Product(name = "", spaceId = space.id!!, spaceUuid = space.uuid))))
                .andExpect(status().isBadRequest)
                .andReturn()
        val response = result.resolvedException!!.message
        assertThat(response).contains("Invalid Product")
    }

    @Test
    fun `PUT should return 403 when trying to edit a product without write authorization`() {
        val product: Product = productRepository.save(Product("name", space.id!!, spaceUuid = space.uuid))
        val requestBodyObject = ProductEditRequest(product.id!!, "newName",HashSet())

        mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `DELETE should delete product`() {
        val product: Product = productRepository.save(Product(name = "test", spaceId = space.id!!, spaceUuid = space.uuid))

        mockMvc.perform(delete(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        assertThat(productRepository.count()).isZero()
    }

    @Test
    fun `DELETE should delete associated assignments`() {
        val product: Product = productRepository.save(Product(name = "test", spaceId = space.id!!, spaceUuid = space.uuid))
        val unassignedProduct: Product = productRepository.save(Product(name = "unassigned", spaceId = space.id!!, spaceUuid = space.uuid))
        val person = personRepository.save(Person(name = "person", spaceId = space.id!!, spaceUuid = space.uuid))
        assignmentRepository.save(Assignment(person = person, productId = product.id!!, spaceId = space.id!!))

        mockMvc.perform(delete(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val people: Iterable<Assignment> = assignmentRepository.findAll()
        assertThat(assignmentRepository.count()).isOne()
        assertThat(people.first().person.name).isEqualTo(person.name)
        assertThat(people.first().productId).isEqualTo(unassignedProduct.id)
    }

    @Test
    fun `DELETE should return 400 when trying to delete non existing product`() {
        mockMvc.perform(delete(getSingleProductUrl(700))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should return 403 when trying to delete a product without write authorization`() {
        val product: Product = productRepository.save(Product(name = "test", spaceId = space.id!!, spaceUuid = space.uuid))
        mockMvc.perform(delete(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer ANONYMOUS_TOKEN"))
                .andExpect(status().isForbidden)
    }

}
