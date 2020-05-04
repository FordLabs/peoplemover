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

import com.ford.internalprojects.peoplemover.assignment.Assignment;
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository;
import com.ford.internalprojects.peoplemover.person.Person;
import com.ford.internalprojects.peoplemover.person.PersonRepository;
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

import java.util.Arrays;
import java.util.List;
import java.util.Spliterator;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class BoardControllerDeleteApiTest {
  @Autowired
  private BoardRepository boardRepository;

  @Autowired
  private ProductRepository productRepository;

  @Autowired
  private AssignmentRepository assignmentRepository;

  @Autowired
  private PersonRepository personRepository;

  @Autowired
  private SpaceRepository spaceRepository;

  @Autowired
  private MockMvc mockMvc;

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
    personRepository.deleteAll();
    spaceRepository.deleteAll();
  }

  @Test
  public void deleteBoard_shouldReturn_NoContent_WhenDeletingBoard()
    throws Exception {

    Board savedBoard = boardRepository.save(new Board("board", space.getId()));

    mockMvc
      .perform(delete("/api/board/" + savedBoard.getId()))
      .andExpect(status().isNoContent());

    assertThat(boardRepository.count()).isZero();
  }

  @Test
  public void deleteBoard_shouldNotDeleteOtherBoards_WhenDeletingBoard()
    throws Exception {
    Board board1 = new Board("board one", space.getId());
    Board board2 = new Board("board two", space.getId());
    boardRepository.saveAll(Arrays.asList(board1, board2));

    Board savedBoard1 = boardRepository.findByNameIgnoreCase("board one").get();

    mockMvc
      .perform(delete("/api/board/" + savedBoard1.getId()))
      .andExpect(status().isNoContent())
      .andReturn();

    assertThat(boardRepository.count()).isOne();
    Spliterator<Board> spliterator = boardRepository.findAll().spliterator();
    List<Board> boards = StreamSupport.stream(spliterator, false).collect(Collectors.toList());
    assertThat(boards.get(0).getName()).isEqualTo(board2.getName());
  }

  @Test
  public void deleteBoard_shouldDeleteProductsOnBoard_WhenDeletingBoard()
    throws Exception {
    Board savedBoard = boardRepository.save(new Board("board", space.getId()));

    Product product1 = new Product("product one", savedBoard.getId(), space.getId());
    Product product2 = new Product("product two", savedBoard.getId(), space.getId());

    productRepository.saveAll(Arrays.asList(product1, product2));

    mockMvc
      .perform(delete("/api/board/" + savedBoard.getId()))
      .andExpect(status().isNoContent());

    assertThat(productRepository.count()).isZero();
  }

  @Test
  public void deleteBoard_shouldNotDeleteProductsOnOtherBoards_WhenDeletingBoard()
    throws Exception {
    Board savedBoard1 = boardRepository.save(new Board("board one", space.getId()));
    Board savedBoard2 = boardRepository.save(new Board("board two", space.getId()));

    Product product1 = new Product("product one", savedBoard1.getId(), space.getId());
    Product product2 = new Product("product two", savedBoard2.getId(), space.getId());

    productRepository.saveAll(Arrays.asList(product1, product2));

    mockMvc.perform(delete("/api/board/" + savedBoard1.getId()))
      .andExpect(status().isNoContent());

    assertThat(productRepository.count()).isOne();

    Spliterator<Product> spliterator = productRepository.findAll().spliterator();
    List<Product> products = StreamSupport.stream(spliterator, false).collect(Collectors.toList());
    assertThat(products.get(0).getId()).isEqualTo(product2.getId());
    assertThat(products.get(0).getName()).isEqualTo(product2.getName());
  }

  @Test
  public void deleteBoard_shouldDeleteAssignmentsOnBoard_WhenDeletingBoard()
    throws Exception {

    Board savedBoard = boardRepository.save(new Board("board", space.getId()));

    Product savedProduct = productRepository.save( new Product("product", savedBoard.getId(), space.getId()));

    Person personOne = personRepository.save(new Person("person one", space.getId()));
    Person personTwo = personRepository.save(new Person("person two", space.getId()));

    assignmentRepository.saveAll(Arrays.asList(
      new Assignment(personOne, false, savedProduct.getId(), space.getId()),
      new Assignment(personTwo, false, savedProduct.getId(), space.getId())
    ));

    mockMvc
      .perform(delete("/api/board/" + savedBoard.getId()))
      .andExpect(status().isNoContent());

    assertThat(assignmentRepository.count()).isZero();
  }

  @Test
  public void deleteBoard_shouldNotDeletePeopleOnOtherBoard_WhenDeletingBoard()
    throws Exception {

    Board savedBoard1 = boardRepository.save(new Board("board one", space.getId()));
    Board savedBoard2 = boardRepository.save(new Board("board two", space.getId()));

    Product savedProduct1 = productRepository.save(new Product("product one", savedBoard1.getId(), space.getId()));
    Product savedProduct2 = productRepository.save(new Product("product two", savedBoard2.getId(), space.getId()));

    Person personOne = personRepository.save(new Person("person one", space.getId()));
    Person personTwo = personRepository.save(new Person("person two", space.getId()));

    assignmentRepository.saveAll(Arrays.asList(
            new Assignment(personOne, false, savedProduct1.getId(), space.getId()),
            new Assignment(personTwo, false, savedProduct2.getId(), space.getId())
    ));

    mockMvc
      .perform(delete("/api/board/" + savedBoard1.getId()))
      .andExpect(status().isNoContent());

    Spliterator<Assignment> spliterator = assignmentRepository.findAll().spliterator();
    List<Assignment> assignments = StreamSupport.stream(spliterator, false).collect(Collectors.toList());
    assertThat(assignmentRepository.count()).isOne();
    assertThat(assignments.get(0).getPerson().getName()).isEqualTo(personTwo.getName());
  }

  @Test
  public void deleteBoard_shouldReturn_BadRequestWithErrorMessage_WhenDeletingBoardThatDoesNotExist()
    throws Exception {
    Board board = boardRepository.save(new Board("board one", space.getId()));
    int anIdThatShouldNotExist = board.getId() + 1;

    mockMvc
      .perform(delete("/api/board/" + anIdThatShouldNotExist))
      .andExpect(status().isBadRequest());
  }
}
