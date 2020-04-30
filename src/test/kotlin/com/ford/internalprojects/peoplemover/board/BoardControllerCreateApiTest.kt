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

package com.ford.internalprojects.peoplemover.board

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.producttag.ProductTag
import com.ford.internalprojects.peoplemover.producttag.ProductTagRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.*

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class BoardControllerCreateApiTest {
    @Autowired
    private lateinit var boardRepository: BoardRepository

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var productTagRepository: ProductTagRepository

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private lateinit var space: Space

    @Before
    fun setUp() {
        space = spaceRepository.save(Space("tok"))
    }

    @After
    fun tearDown() {
        assignmentRepository.deleteAll()
        productTagRepository.deleteAll()
        productRepository.deleteAll()
        boardRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun createBoardInSpace_shouldReturnOKAndTheBoard_WhenCreatingValidBoard() {
        val boardRequest = Board("board one", 1)
        val result = mockMvc
                .perform(
                        post("/api/board/tok")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(boardRequest))
                )
                .andExpect(status().isOk)
                .andReturn()
        val response = result.response.contentAsString
        val (_, name, spaceId, products) = objectMapper.readValue(response, Board::class.java)
        assertThat(name).isEqualTo("board one")
        assertThat(products).isNotNull
        val unassignedProduct = products[0]
        assertThat(unassignedProduct).isNotNull()
        assertThat(spaceId).isNotNull()
    }

    @Test
    fun createBoardInSpace_shouldFailIfSpaceTokenIsProvided_ButNoSuchSpaceExists() {
        val boardRequest = Board("board", space.id!!)
        mockMvc
                .perform(
                        post("/api/board/noSuchSpave")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(boardRequest))
                )
                .andExpect(status().isBadRequest)
        assertThat(boardRepository.findByNameIgnoreCase("board one"))
                .isEqualTo(Optional.empty<Any>())
    }

    @Test
    fun createBoard_shouldReturn_BadRequestWithErrorMessage_WhenCreatingBoardWithAlreadyTakenName() {
        val (_, name) = boardRepository.save(Board("board", space.id!!))
        val boardRequest = Board(name, space.id!!)
        mockMvc
                .perform(
                        post("/api/board/tok")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(boardRequest))
                )
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST should still create a board when board name already exists in another space`() {
        val board: Board = boardRepository.save(Board(name = "board one", spaceId = space.id!!))
        val emptySpace: Space = spaceRepository.save(Space(name = "emptySpace"))
        val boardRequest = Board(name = board.name, spaceId = emptySpace.id!!)
        val result = mockMvc
                .perform(
                        post("/api/board/emptySpace")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(boardRequest))
                )
                .andExpect(status().isOk)
                .andReturn()
        val response = result.response.contentAsString
        val actualBoard: Board = objectMapper.readValue(response, Board::class.java)

        assertThat(actualBoard.name).isEqualTo(boardRequest.name);
        assertThat(actualBoard.spaceId).isEqualTo(boardRequest.spaceId);

        val boards: List<Board?> = boardRepository.findAllBySpaceId(emptySpace.id, null)!!
        assertThat(boards.size).isOne()
        assertThat(boards[0]?.name).isEqualTo("board one")
    }

    @Test
    fun createBoard_shouldCreateUnassignedProduct_WhenCreatingBoard() {
        val boardRequest = Board("board", space.id!!)
        mockMvc
                .perform(
                        post("/api/board/tok")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(boardRequest))
                )
                .andExpect(status().isOk)
                .andReturn()
        val productOptional = productRepository.findByName(
                "unassigned"
        )
        assertThat(productOptional).isNotNull()
    }

    @Test
    fun createBoard_shouldReturnBadRequestWithErrorMessage_WhenCreatingBoardWithNoName() {
        val boardRequest = Board(name = "", spaceId = space.id!!)
        mockMvc
                .perform(
                        post("/api/board/tok")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(boardRequest))
                )
                .andExpect(status().isBadRequest)
    }

    @Test
    fun createBoard_shouldCreateBoardByCopyingFromOtherBoard() {
        val board: Board = boardRepository.save(Board("board", space.id!!))
        productRepository.save(Product(name = "product", boardId = board.id!!, spaceId = space.id!!))
        val savedProductTag = productTagRepository.save(
                ProductTag(spaceId = space.id!!, name = "Fin Tech")
        )
        val unsavedProduct = Product(name = "product", boardId = board.id!!, spaceId = space.id!!)
        val boardCopy = Board(null, "board two", space.id!!, listOf(unsavedProduct))
        mockMvc.perform(post("/api/board/tok")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(boardCopy)))
                .andExpect(status().isOk)
    }
}