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
import com.ford.internalprojects.peoplemover.assignment.Assignment;
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository;
import com.ford.internalprojects.peoplemover.location.SpaceLocationRepository;
import com.ford.internalprojects.peoplemover.person.Person;
import com.ford.internalprojects.peoplemover.person.PersonRepository;
import com.ford.internalprojects.peoplemover.product.Product;
import com.ford.internalprojects.peoplemover.product.ProductRepository;
import com.ford.internalprojects.peoplemover.role.SpaceRole;
import com.ford.internalprojects.peoplemover.role.SpaceRolesRepository;
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

import java.util.Collections;
import java.util.List;

import static com.google.common.collect.Sets.newHashSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class BoardControllerReadApiTest {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private SpaceLocationRepository spaceLocationRepository;
    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private SpaceRolesRepository spaceRolesRepository;

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
        personRepository.deleteAll();
        spaceLocationRepository.deleteAll();
        spaceRolesRepository.deleteAll();
        boardRepository.deleteAll();
        spaceRepository.deleteAll();
    }

    @Test
    public void getAllBoards_shouldReturn_OKWithBoardsInRepositoryWithAllConnectedAttributes() throws Exception {
        Board basicBoard1 = boardRepository.save(new Board("board one", space.getId()));
        Board board2 = boardRepository.save(new Board("another board two", space.getId()));
        Board board3 = boardRepository.save(new Board("board three", space.getId()));

        SpaceRole spaceRole = spaceRolesRepository.save(new SpaceRole(null, "Software Engineer", space.getId(), null));

        Person person = personRepository.save(new Person(
                null,
                "john",
                spaceRole,
                "",
                false,
                space.getId()
        ));
        Product product = productRepository.save(new Product("productForBoard1", basicBoard1.getId(), space.getId()));

        Assignment assignment = assignmentRepository.save(new Assignment(person, false, product.getId(), space.getId()));

        MvcResult result = mockMvc.perform(get("/api/board/tok"))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();

        final Board[] actualBoards = objectMapper.readValue(response, Board[].class);

        assertThat(actualBoards.length).isEqualTo(3);

        Product expectedProduct = new Product(
                product.getId(),
                product.getName(),
                basicBoard1.getId(),
                newHashSet(assignment),
                newHashSet(),
                null,
                null,
                "",
                null,
                false,
                "",
                space.getId()
        );
        Board expectedBoard1 = new Board(
                basicBoard1.getId(),
                basicBoard1.getName(),
                space.getId(),
                Collections.singletonList(expectedProduct)
        );
        assertThat(actualBoards).containsExactlyInAnyOrder(expectedBoard1, board2, board3);
    }

    @Test
    public void getAllProductsForABoardInAlphabeticalOrderByName() throws Exception {
        Board board = boardRepository.save(new Board("board", space.getId()));

        Product product1 = productRepository.save(new Product("product one", board.getId(), space.getId()));
        Product product2 = productRepository.save(new Product("product two", board.getId(), space.getId()));

        MvcResult result = mockMvc.perform(get("/api/board/tok"))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();

        final Board actualBoard = objectMapper.readValue(response, Board[].class)[0];

        List<Product> products = actualBoard.getProducts();
        assertThat(products).hasSize(2);
        assertThat(products).containsExactly(product1, product2);
    }

    @Test
    public void getAllBoardsInAnInvalidSpace_ReturnsABadRequestStatus() throws Exception {
        mockMvc.perform(get("/api/board/noexisten"))
                .andExpect(status().isBadRequest());
    }
}
