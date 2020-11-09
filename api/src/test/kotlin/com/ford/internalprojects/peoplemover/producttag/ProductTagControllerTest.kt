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

package com.ford.internalprojects.peoplemover.producttag

import com.fasterxml.jackson.databind.ObjectMapper
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
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ProductTagControllerTest {
    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var productTagRepository: ProductTagRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private lateinit var space: Space

    var baseProductTagsUrl: String = ""

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "anotherSpaceName"))
        baseProductTagsUrl = "/api/spaces/" + space.uuid + "/product-tags"
    }

    @After
    fun tearDown() {
        productTagRepository.deleteAll()
        productRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `POST should create product tag`() {
        val tagToCreate = ProductTagAddRequest(name = "Fin Tech")

        val result = mockMvc.perform(post(baseProductTagsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(tagToCreate)))
            .andExpect(status().isOk)
            .andReturn()

        val actualTag: ProductTag = objectMapper.readValue(
            result.response.contentAsString,
            ProductTag::class.java
        )
        assertThat(actualTag.name).isEqualTo(tagToCreate.name)
    }

    @Test
    fun `POST should return 400 when creating tag for non existent space`() {
        mockMvc.perform(post("/api/spaces/doesNotExist/product-tags")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(ProductTag(name = "", spaceId = 0))))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST should return 409 when creating product tag with already existing name`() {
        val actualTag: ProductTag = productTagRepository.save(ProductTag(spaceId = space.id!!, name = "Fin Tech"))
        mockMvc.perform(post(baseProductTagsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(actualTag)))
            .andExpect(status().isConflict)
    }

    @Throws(Exception::class)
    @Test
    fun `GET should return all product tags for a space`() {
        val productTag1: ProductTag = productTagRepository.save(ProductTag(spaceId = space.id!!, name = "Fin Tech 1"))
        val productTag2: ProductTag = productTagRepository.save(ProductTag(spaceId = space.id!!, name = "Fin Tech 2"))
        val productTag3: ProductTag = productTagRepository.save(ProductTag(spaceId = space.id!!, name = "Fin Tech 3"))

        val result = mockMvc.perform(get(baseProductTagsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isOk)
            .andReturn()

        val expectedProductTags: List<ProductTag> = objectMapper.readValue(
            result.response.contentAsString,
            objectMapper.typeFactory.constructCollectionType(MutableList::class.java, ProductTag::class.java)
        )
        assertThat(expectedProductTags.size).isEqualTo(3)
        assertThat(expectedProductTags[0]).isEqualTo(productTag1)
        assertThat(expectedProductTags[1]).isEqualTo(productTag2)
        assertThat(expectedProductTags[2]).isEqualTo(productTag3)
    }

    @Throws(Exception::class)
    @Test
    fun `GET should return 400 when space does not exist`() {
        mockMvc.perform(get("/api/spaces/doesNotExist/product-tags")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE product tag and remove product tag from associated product`() {
        val productTag: ProductTag = productTagRepository.save(
            ProductTag(spaceId =  space.id!!, name =  "Fin Tech")
        )
        val product: Product = productRepository.save(Product(
            name = "P1",
            productTags = hashSetOf(productTag),
            spaceId = space.id!!
        ))

        assertThat(productTagRepository.count()).isOne()

        mockMvc.perform(delete("$baseProductTagsUrl/${productTag.id}")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isOk)

        assertThat(productTagRepository.count()).isZero()

        val productInRepo: Product = productRepository.findByIdOrNull(product.id!!)!!
        assertThat(productInRepo.productTags).isEmpty()
    }

    @Test
    fun `DELETE should return 400 when product tag does not exist`() {
        mockMvc.perform(delete("$baseProductTagsUrl/700")
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should update product tag`() {
        val productTag: ProductTag = productTagRepository.save(ProductTag(spaceId = space.id!!, name = "FordX"))
        val updatedTag = ProductTagEditRequest(id = productTag.id!!, name = "Fin Tech")
        val result = mockMvc.perform(put(baseProductTagsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updatedTag)))
            .andExpect(status().isOk)
            .andReturn()
        val actualProductTag: ProductTag = objectMapper.readValue(
            result.response.contentAsString,
            ProductTag::class.java
        )
        assertThat(actualProductTag.name).isEqualTo(updatedTag.name)
    }

    @Test
    fun `PUT should return 400 when trying to edit non existent product tag`() {
        val attemptedEditRequest = ProductTagEditRequest(id = 700, name = "")
        mockMvc.perform(put(baseProductTagsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(attemptedEditRequest)))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should return 409 when trying to edit product tag name to existing name`() {
        val productTag1: ProductTag = productTagRepository.save(ProductTag(spaceId = space.id!!, name = "FordX"))
        val productTag2: ProductTag = productTagRepository.save(ProductTag(spaceId = space.id!!, name = "Fin Tech"))
        val updatedTag = ProductTagEditRequest(id = productTag1.id!!, name = productTag2.name)

        mockMvc.perform(put(baseProductTagsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updatedTag)))
            .andExpect(status().isConflict)
    }
}