package com.ford.internalprojects.peoplemover.board

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.product.ProductRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status


@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class BoardControllerTotalApiTest {
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
    fun getTotalCountOfBoards_shouldReturnOKAndTotalNumberOfBoards() {
        val board1: Board = boardRepository.save(Board(name = "board one", spaceId = space.id!!))
        val board2: Board = boardRepository.save(Board(name = "board two", spaceId = space.id!!))
        val result = mockMvc
                .perform(
                        MockMvcRequestBuilders.get("/api/board/total")
                )
                .andExpect(status().isOk)
                .andReturn()
        val totalBoardCount = result.response.contentAsString.toInt()
        assertThat(totalBoardCount).isEqualTo(2)
    }
}