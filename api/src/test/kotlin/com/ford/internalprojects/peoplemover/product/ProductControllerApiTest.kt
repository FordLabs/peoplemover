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
import com.ford.internalprojects.peoplemover.assignment.AssignmentV1
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocation
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocationRepository
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import com.ford.internalprojects.peoplemover.tag.product.ProductTagRepository
import com.ford.internalprojects.peoplemover.utilities.CHAR_260
import com.ford.internalprojects.peoplemover.utilities.CHAR_520
import com.ford.internalprojects.peoplemover.utilities.EMPTY_NAME
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.*
import kotlin.collections.HashSet

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
    private lateinit var productTagRepository: ProductTagRepository

    @Autowired
    private lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    private lateinit var mockMvc: MockMvc
    private lateinit var space: Space
    private lateinit var spaceWithoutAccess: Space
    private lateinit var tag: ProductTag
    private lateinit var location: SpaceLocation

    var baseProductsUrl: String = ""

    private fun getBaseProductUrl(spaceUuid: String) = "/api/spaces/${spaceUuid}/products"
    private fun getSingleProductUrl(productId: Int) = baseProductsUrl + "/${productId}"

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "tok"))
        spaceWithoutAccess = spaceRepository.save(Space(name = "tik"))
        baseProductsUrl = getBaseProductUrl(space.uuid)
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))
        tag = productTagRepository.save(ProductTag(spaceUuid = space.uuid, name = "AV Product"))
        location = spaceLocationRepository.save(SpaceLocation(spaceUuid = space.uuid, name = "Mars"))
    }

    @After
    fun tearDown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        personRepository.deleteAll()
        spaceLocationRepository.deleteAll()
        spaceRepository.deleteAll()
        productTagRepository.deleteAll()
    }

    @Test
    fun `POST should create new Product`() {
        val productAddRequest = ProductRequest(
                name = "product one",
                tags = setOf(tag),
                spaceLocation = location
        )

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
        assertThat(actualProduct.spaceUuid).isEqualTo(space.uuid)
        assertThat(actualProduct).isEqualTo(productInDB)
        assertThat(actualProduct.tags).containsOnly(tag)
        assertThat(actualProduct.spaceLocation).isEqualTo(location)
    }

    @Test
    fun `POST should return 400 when trying to create product with no product name`() {
        val productAddRequest = ProductRequest(name = "")

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
        productRepository.save(Product(name = "product one", spaceUuid = space.uuid))
        val productAddRequest = ProductRequest(name = "product one")

        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productAddRequest)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `POST should return 403 when trying to create a product without write authorization`() {
        val requestBodyObject = ProductRequest("Not blank")

        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isForbidden)
    }


    @Test
    fun `PUT should return 400 when trying to update product with too many characters in notes field`() {
        val product: Product = productRepository.save(Product(name = "test", spaceUuid = space.uuid))
        val productEditRequest = ProductRequest(
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
        val product: Product = productRepository.save(Product(name = "test", spaceUuid = space.uuid))
        val person: Person = personRepository.save(Person(name = "bob", spaceUuid = space.uuid))
        assignmentRepository.save(AssignmentV1(person = person, productId = product.id!!, spaceUuid = space.uuid))
        val productEditRequest = ProductRequest(
                name = "product two"
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
        val product1: Product = productRepository.save(Product(name = "product one", spaceUuid = space.uuid))
        val product2: Product = productRepository.save(Product(name = "product two", spaceUuid = space.uuid))
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
                .content(objectMapper.writeValueAsString(Product(name = "", spaceUuid = space.uuid))))
                .andExpect(status().isBadRequest)
                .andReturn()
        val response = result.resolvedException!!.message
        assertThat(response).contains("Invalid Product")
    }

    @Test
    fun `PUT should return 403 when trying to edit a product without write authorization`() {
        val product: Product = productRepository.save(Product("name", spaceUuid = space.uuid))
        val requestBodyObject = ProductRequest("newName", HashSet())

        mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `PUT should return 400 when trying to edit a product in a space that you don not have access to`() {
        val product: Product = productRepository.save(Product("name", spaceUuid = spaceWithoutAccess.uuid))
        val requestBodyObject = ProductRequest("newName", HashSet())

        mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should delete product`() {
        val product: Product = productRepository.save(Product(name = "test", spaceUuid = space.uuid))

        mockMvc.perform(delete(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        assertThat(productRepository.count()).isZero()
    }

    @Test
    fun `DELETE product should unassign person from product`() {
        val product: Product = productRepository.save(Product(name = "test", spaceUuid = space.uuid))
        val unassignedProduct: Product = productRepository.save(Product(name = "unassigned", spaceUuid = space.uuid))
        val person = personRepository.save(Person(name = "person", spaceUuid = space.uuid))
        assignmentRepository.save(AssignmentV1(person = person, productId = product.id!!, spaceUuid = space.uuid))

        mockMvc.perform(delete(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val people: Iterable<AssignmentV1> = assignmentRepository.findAll()
        assertThat(assignmentRepository.count()).isOne()
        assertThat(people.first().person.name).isEqualTo(person.name)
        assertThat(people.first().productId).isEqualTo(unassignedProduct.id)
    }

    @Test
    fun `DELETE product should unassign person from product and handle cases where person is already unassigned`() {
        val product: Product = productRepository.save(Product(name = "test", spaceUuid = space.uuid))
        val unassignedProduct: Product = productRepository.save(Product(name = "unassigned", spaceUuid = space.uuid))
        val person = personRepository.save(Person(name = "person", spaceUuid = space.uuid))
        assignmentRepository.save(AssignmentV1(person = person, productId = product.id!!, spaceUuid = space.uuid))
        assignmentRepository.save(AssignmentV1(person = person, productId = unassignedProduct.id!!, spaceUuid = space.uuid))

        mockMvc.perform(delete(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val people: Iterable<AssignmentV1> = assignmentRepository.findAll()
        assertThat(assignmentRepository.count()).isOne()
        assertThat(people.first().person.name).isEqualTo(person.name)
        assertThat(people.first().productId).isEqualTo(unassignedProduct.id!!)
    }

    @Test
    fun `DELETE should return 400 when trying to delete non existing product`() {
        mockMvc.perform(delete(getSingleProductUrl(700))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should return 400 when trying to delete a product in a space you don not have access to`() {
        val product: Product = productRepository.save(Product(name = "test", spaceUuid = spaceWithoutAccess.uuid))
        mockMvc.perform(delete(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should return 403 when trying to delete a product without write authorization`() {
        val product: Product = productRepository.save(Product(name = "test", spaceUuid = space.uuid))
        mockMvc.perform(delete(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer ANONYMOUS_TOKEN"))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `post should validate the url send with the product`() {
        val productAddRequestWithoutHttps = ProductRequest(
                name = "product without https",
                url = "www.fordlabs.com"
        )

        val productAddRequestWithHttpsAndNoSlash = ProductRequest(
                name = "product with https",
                url = "https:www.fordlabs.com"
        )

        val productAddRequestWithHttp = ProductRequest(
                name = "product with http",
                url = "http:www.fordlabs.com"
        )

        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productAddRequestWithoutHttps)))
                .andExpect(status().isOk)
                .andReturn()

        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productAddRequestWithHttpsAndNoSlash)))
                .andExpect(status().isOk)
                .andReturn()

        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productAddRequestWithHttp)))
                .andExpect(status().isOk)
                .andReturn()

        val productWithoutHttpsInDB: Product = productRepository.findByName("product without https")!!
        assertThat(productWithoutHttpsInDB.name).isEqualTo("product without https")
        assertThat(productWithoutHttpsInDB.url).isEqualTo("https://www.fordlabs.com")

        val productWithHttpsInDB: Product = productRepository.findByName("product with https")!!
        assertThat(productWithHttpsInDB.name).isEqualTo("product with https")
        assertThat(productWithHttpsInDB.url).isEqualTo("https://www.fordlabs.com")

        val productWithHttpInDB: Product = productRepository.findByName("product with http")!!
        assertThat(productWithHttpInDB.name).isEqualTo("product with http")
        assertThat(productWithHttpInDB.url).isEqualTo("http:www.fordlabs.com")
    }

    @Test
    fun `put should append https if product url does not have it at the beginning`() {

        val product: Product = productRepository.save(Product(name = "test", spaceUuid = space.uuid))
        val productEditRequest = ProductRequest(
                name = "product one",
                url = "www.fordlabs.com"
        )

        mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productEditRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val productInDB: Optional<Product> = productRepository.findById(product.id!!)

        assertThat(productInDB.get().name).isEqualTo("product one")
        assertThat(productInDB.get().url).isEqualTo("https://www.fordlabs.com")
    }

    @Test
    fun `POST should disallow invalid ProductRequest inputs`() {
        val nameTooLong = Product(name = CHAR_260, spaceUuid = space.uuid)
        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nameTooLong)))
                .andExpect(status().isBadRequest)
                .andReturn()
        val nameBlank = Product(name = EMPTY_NAME, spaceUuid = space.uuid)
        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nameBlank)))
                .andExpect(status().isBadRequest)
                .andReturn()
        val notesTooLong = Product(name = "person name", spaceUuid = space.uuid, notes = CHAR_520)
        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notesTooLong)))
                .andExpect(status().isBadRequest)
                .andReturn()
        val dorfTooLong = Product(name = "person name", spaceUuid = space.uuid, dorf = CHAR_260)
        mockMvc.perform(post(baseProductsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dorfTooLong)))
                .andExpect(status().isBadRequest)
                .andReturn()
    }

    @Test
    fun `PUT should disallow invalid ProductRequest inputs`() {
        val product: Product = productRepository.save(Product(name = "test", spaceUuid = space.uuid))
        val nameTooLong = Product(id = product.id, name = CHAR_260, spaceUuid = space.uuid)
        mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nameTooLong)))
                .andExpect(status().isBadRequest)
                .andReturn()
        val nameBlank = Product(id = product.id, name = EMPTY_NAME, spaceUuid = space.uuid)
        mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nameBlank)))
                .andExpect(status().isBadRequest)
                .andReturn()
        val notesTooLong = Product(id = product.id, name = "product name", spaceUuid = space.uuid, notes = CHAR_520)
        mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notesTooLong)))
                .andExpect(status().isBadRequest)
                .andReturn()
        val dorfTooLong = Product(id = product.id, name = "person name", spaceUuid = space.uuid, dorf = CHAR_260)
        mockMvc.perform(put(getSingleProductUrl(product.id!!))
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dorfTooLong)))
                .andExpect(status().isBadRequest)
                .andReturn()
    }
}
