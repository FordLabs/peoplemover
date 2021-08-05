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

package com.ford.internalprojects.peoplemover.tag.product

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.tag.TagRequest
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

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    private lateinit var space: Space

    var baseProductTagsUrl: String = ""

    private fun getBaseProductTagsUrl(spaceUuid: String) = "/api/spaces/$spaceUuid/product-tags"

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "anotherSpaceName1"))
        baseProductTagsUrl = getBaseProductTagsUrl(space.uuid)
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = space.uuid, permission = PERMISSION_OWNER))
    }

    @After
    fun tearDown() {
        productTagRepository.deleteAll()
        productRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `POST should create product tag`() {
        val tagToCreate = TagRequest(name = "Fin Tech")

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
    fun `POST should return 409 when creating product tag with already existing name`() {
        val actualTag: ProductTag = productTagRepository.save(ProductTag(name = "Fin Tech", spaceUuid = space.uuid))
        mockMvc.perform(post(baseProductTagsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualTag)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `POST should return 403 when trying to create a product tag without write authorization`() {
        val requestBodyObject = TagRequest("Not a blank")

        mockMvc.perform(post(getBaseProductTagsUrl(space.uuid))
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `PUT should return 409 when editing product tag with already existing name in different case (name check is case insensitive)`() {
        val actualTag: ProductTag = productTagRepository.save(ProductTag(name = "Fin Tech", spaceUuid = space.uuid))
        mockMvc.perform(put("$baseProductTagsUrl/${actualTag.id}")
            .header("Authorization", "Bearer GOOD_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(actualTag.copy(name = actualTag.name.toLowerCase()))))
            .andExpect(status().isConflict)
    }

    @Throws(Exception::class)
    @Test
    fun `GET should return all product tags for a space`() {
        val productTag1: ProductTag = productTagRepository.save(ProductTag(name = "Fin Tech 1", spaceUuid = space.uuid))
        val productTag2: ProductTag = productTagRepository.save(ProductTag(name = "Fin Tech 2", spaceUuid = space.uuid))
        val productTag3: ProductTag = productTagRepository.save(ProductTag(name = "Fin Tech 3", spaceUuid = space.uuid))

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

    @Test
    fun `GET should return 403 when valid token does not have read access and the space's read-only flag is off`() {
        mockMvc.perform(get(baseProductTagsUrl)
            .header("Authorization", "Bearer ANONYMOUS_TOKEN"))
            .andExpect(status().isForbidden)
            .andReturn()
    }


    @Throws(Exception::class)
    @Test
    fun `GET should return 400 when space does not exist`() {
        mockMvc.perform(get(getBaseProductTagsUrl("doesNotExist"))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE product tag and remove product tag from associated product`() {
        val productTag: ProductTag = productTagRepository.save(
                ProductTag(name = "Fin Tech", spaceUuid = space.uuid)
        )
        val product: Product = productRepository.save(Product(
                name = "P1",
                tags = hashSetOf(productTag),
                spaceUuid = space.uuid
        ))

        assertThat(productTagRepository.count()).isOne()

        mockMvc.perform(delete("$baseProductTagsUrl/${productTag.id}")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)

        assertThat(productTagRepository.count()).isZero()

        val productInRepo: Product = productRepository.findByIdOrNull(product.id!!)!!
        assertThat(productInRepo.tags).isEmpty()
    }

    @Test
    fun `DELETE should return 400 when product tag does not exist`() {
        mockMvc.perform(delete("$baseProductTagsUrl/700")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `DELETE should return 400 when product tag is not associated with the space provided`() {
        val spaceNotAssociatedWithUser = spaceRepository.save(Space(name = "spaceNotAssociatedWithUser"))

        val productTag: ProductTag = productTagRepository.save(
                ProductTag(name = "Fin Tech", spaceUuid = spaceNotAssociatedWithUser.uuid)
        )

        mockMvc.perform(delete("$baseProductTagsUrl/${productTag.id!!}")
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isBadRequest)
    }


    @Test
    fun `DELETE should return 403 when trying to delete a product tag without write authorization`() {
        val productTag: ProductTag = productTagRepository.save(ProductTag(name = "Spongebob", spaceUuid = space.uuid))

        mockMvc.perform(delete("$baseProductTagsUrl/${productTag.id!!}")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN"))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `PUT should update product tag`() {
        val productTag: ProductTag = productTagRepository.save(ProductTag(name = "FordX", spaceUuid = space.uuid))
        val updatedTag = TagRequest(name = "Fin Tech")
        val result = mockMvc.perform(put("$baseProductTagsUrl/${productTag.id}")
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
        val attemptedEditRequest = TagRequest(name = "")
        mockMvc.perform(put("$baseProductTagsUrl/700")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(attemptedEditRequest)))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should return 400 when trying to edit a product tag not associated with the requested space`() {
        val spaceNotAssociatedWithUser = spaceRepository.save(Space(name = "spaceNotAssociatedWithUser"))

        val productTag: ProductTag = productTagRepository.save(
                ProductTag(name = "Fin Tech", spaceUuid = spaceNotAssociatedWithUser.uuid)
        )
        val attemptedEditRequest = TagRequest(name = "different name")

        mockMvc.perform(put("$baseProductTagsUrl/${productTag.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(attemptedEditRequest)))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should return 403 when trying to edit a product tag without write authorization`() {
        val productTag: ProductTag = productTagRepository.save(ProductTag(name = "Valerie Felicity Frizzle", spaceUuid = space.uuid))
        val requestBodyObject = TagRequest("Liz")

        mockMvc.perform(put("$baseProductTagsUrl/${productTag.id}")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isForbidden)
    }

    @Test
    fun `PUT should return 409 when editing product tag to an already existing name`() {
        productTagRepository.save(ProductTag(name = "Cool Tech", spaceUuid = space.uuid))
        val actualTag: ProductTag = productTagRepository.save(ProductTag(name = "Fin Tech", spaceUuid = space.uuid))
        val attemptedEditRequest = TagRequest(name = "Cool Tech")
        mockMvc.perform(put("$baseProductTagsUrl/${actualTag.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(attemptedEditRequest)))
                .andExpect(status().isConflict)
    }
}
