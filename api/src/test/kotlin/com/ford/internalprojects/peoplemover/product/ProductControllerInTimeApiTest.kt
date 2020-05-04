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

package com.ford.internalprojects.peoplemover.product

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.board.Board
import com.ford.internalprojects.peoplemover.board.BoardRepository
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
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerInTimeApiTest {
    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var boardRepository: BoardRepository

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var mockMvc: MockMvc

    private lateinit var space: Space
    private lateinit var board: Board
    private lateinit var product1: Product
    private lateinit var product2: Product

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "tok"))
        board = boardRepository.save(Board(name = "board", spaceId = space.id!!))
        product1 = productRepository.save(Product(
                name = "product one",
                startDate = LocalDate.of(2020, 5, 1),
                endDate = LocalDate.of(2020, 6, 1),
                boardId = board.id!!,
                spaceId = space.id!!
        ))
        product2 = productRepository.save(Product(
                name = "product two",
                startDate = LocalDate.of(2020, 4, 1),
                endDate = LocalDate.of(2020, 6, 1),
                boardId = board.id!!,
                spaceId = space.id!!
        ))
    }

    @After
    fun tearDown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        boardRepository.deleteAll()
        personRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `GET should return all products for date they are both active`() {
        val requestedDate = "2020-05-01"
        val result = mockMvc.perform(get("/api/product/${space.id}/$requestedDate"))
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
    fun `GET should return only second product for date only second active`() {
        val requestedDate = "2020-04-01"
        val result = mockMvc.perform(get("/api/product/${space.id}/$requestedDate"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        assertThat(actualProducts.size).isOne()
        val actualProduct2: Product = actualProducts[0]
        assertThat(actualProduct2).isEqualTo(product2)
    }

    @Test
    fun `GET should return no products for date that is before both start dates`() {
        val requestedDate = "2020-03-01"
        val result = mockMvc.perform(get("/api/product/${space.id}/$requestedDate"))
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
                boardId = board.id!!,
                spaceId = space.id!!
        ))

        val requestedDate = "2020-09-01"
        val result = mockMvc.perform(get("/api/product/${space.id}/$requestedDate"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        assertThat(actualProducts.size).isOne()
        val actualProduct: Product = actualProducts[0]
        assertThat(actualProduct).isEqualTo(nullStartProduct)
    }

    @Test
    fun `GET should return only the null end date product`() {
        val nullStartProduct: Product = productRepository.save(Product(
                name = "product with null start date",
                startDate = LocalDate.of(2020, 6, 1),
                boardId = board.id!!,
                spaceId = space.id!!
        ))

        val requestedDate = "2020-09-01"
        val result = mockMvc.perform(get("/api/product/${space.id}/$requestedDate"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        assertThat(actualProducts.size).isOne()
        val actualProduct: Product = actualProducts[0]
        assertThat(actualProduct).isEqualTo(nullStartProduct)
    }
}
