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

package com.ford.internalprojects.peoplemover.board;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository;
import com.ford.internalprojects.peoplemover.product.Product;
import com.ford.internalprojects.peoplemover.product.ProductRepository;
import com.ford.internalprojects.peoplemover.space.Space;
import com.ford.internalprojects.peoplemover.space.SpaceRepository;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class BoardControllerUpdateApiTest {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Space space;

    @Before
    public void setUp() {
        space = spaceRepository.save(new Space("tok"));
    }

    @After
    public void tearDown() {
        assignmentRepository.deleteAll();
        productRepository.deleteAll();
        boardRepository.deleteAll();
        spaceRepository.deleteAll();
    }

    @Test
    public void updateBoard_shouldReturn_OKWithBoard_WhenUpdatingBoard() throws Exception {
        Board savedBoard = boardRepository.save(new Board("board one", space.getId()));
        productRepository.save(new Product("product", savedBoard.getId(), space.getId()));

        Board boardFromUI = new Board("board two", space.getId());
        MvcResult result = mockMvc.perform(put("/api/board/" + savedBoard.getId() + "/" + space.getName())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(boardFromUI)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        Board actualBoard = objectMapper.readValue(response, Board.class);

        assertThat(actualBoard.getName()).isEqualTo(boardFromUI.getName());
        assertThat(actualBoard.getSpaceId()).isEqualTo(space.getId());
        assertThat(actualBoard.getId()).isEqualTo(savedBoard.getId());
        assertThat(actualBoard.getProducts().size()).isEqualTo(1);
    }

    @Test
    public void updateBoard_shouldReturn_OKWithBoard_WhenUpdatingBoard_ButNotChangingName() throws Exception {
        Board savedBoard = boardRepository.save(new Board("board one", space.getId()));

        Board boardRequest = new Board(savedBoard.getId(), savedBoard.getName(), space.getId(), new ArrayList<>());
        MvcResult result = mockMvc.perform(put("/api/board/" + savedBoard.getId() + "/" + space.getName())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(boardRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();

        assertThat(response)
                .contains("board one")
                .contains(savedBoard.getId().toString());
    }

    @Test
    public void updateBoard_shouldReturn_BadRequestWithErrorMessage_WhenUpdatingBoardToNowHaveNoName() throws Exception {
        Board savedBoard = boardRepository.save(new Board("board one", space.getId()));
        savedBoard.setName("");
        mockMvc.perform(put("/api/board/" + savedBoard.getId() + "/" + space.getName())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(savedBoard)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateBoard_shouldReturn_BadRequestWithErrorMessage_WhenUpdatingBoardThatDoesNotExist() throws Exception {
        Board board = boardRepository.save(new Board("board one", space.getId()));

        int anIdThatShouldNotExist = board.getId() + 1;

        Board updatedBoard = new Board(anIdThatShouldNotExist, "board two", space.getId(), new ArrayList<>());
        mockMvc.perform(put("/api/board/" + anIdThatShouldNotExist + "/" + space.getName())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedBoard)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateBoard_shouldReturn_BadRequestWithErrorMessage_WhenUpdatingBoardToHaveAlreadyTakenName() throws Exception {
        boardRepository.save(new Board("board one", space.getId()));
        Board board2 = boardRepository.save(new Board("board two", space.getId()));

        Board boardRequest = new Board(board2.getId(), "board one", space.getId(), Collections.emptyList());

        mockMvc.perform(put("/api/board/" + board2.getId() + "/" + space.getName())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(boardRequest)))
                .andExpect(status().isBadRequest());
    }
}
