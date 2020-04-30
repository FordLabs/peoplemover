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

import com.ford.internalprojects.peoplemover.board.exceptions.BoardAlreadyExistsException;
import com.ford.internalprojects.peoplemover.board.exceptions.BoardNotExistsException;
import com.ford.internalprojects.peoplemover.product.Product;
import com.ford.internalprojects.peoplemover.product.ProductService;
import com.ford.internalprojects.peoplemover.space.Space;
import com.ford.internalprojects.peoplemover.space.SpaceRepository;
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException;
import com.ford.internalprojects.peoplemover.utilities.HelperUtils;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static com.google.common.collect.Lists.newArrayList;

@Service
public class BoardService {
  private BoardRepository boardRepository;
  private ProductService productService;
  private SpaceRepository spaceRepository;

  public BoardService(
    BoardRepository boardRepository,
    ProductService productService,
    SpaceRepository spaceRepository
  ) {
    this.boardRepository = boardRepository;
    this.productService = productService;
    this.spaceRepository = spaceRepository;
  }

  public List<Board> getAllInSpace(String spaceName) {
    Space spaceRequest = Optional.ofNullable(spaceRepository.findByNameIgnoreCase(spaceName))
      .orElseThrow(() -> new SpaceNotExistsException(spaceName));

    return boardRepository.findAllBySpaceId(
      spaceRequest.getId(),
      Sort.by(Sort.Order.asc("name").ignoreCase())
    );
  }

  Board createForSpace(Board board, String spaceName) {
    Space space = Optional.ofNullable(spaceRepository.findByNameIgnoreCase(spaceName))
      .orElseThrow(() -> new SpaceNotExistsException(spaceName));

    return this.createBoardByName(
        board.getName(),
        newArrayList(board.getProducts()),
        space
      );
  }

  private Board createBoardByName(String boardName, List<Product> products, Space space) {
    Board savedBoard =
      this.create(new Board(boardName, space.getId()), space);
    var newProducts = productService.copyProducts(products, savedBoard);
    if (products.isEmpty()) {
      newProducts.add(this.productService.create(new Product("unassigned", savedBoard.getId(), space.getId())));
    }

    return new Board(
            savedBoard.getId(),
            savedBoard.getName(),
            savedBoard.getSpaceId(),
            newProducts
    );
  }

  private Board create(Board board, Space space) {
    if (hasBoardWithId(board.getId()) || spaceHasBoardWithName(space, board.getName())) {
      throw new BoardAlreadyExistsException(board.getName());
    }
    return boardRepository.saveAndUpdateSpaceLastModified(board);
  }

  public Board createBoardForNewSpace(String boardName, Space space) {
    space.setLastModifiedDate(HelperUtils.getCurrentTimeStamp());
    Board savedBoard = this.boardRepository.saveAndUpdateSpaceLastModified(new Board(boardName, space.getId()));
    var defaultProductNames = Arrays.asList("My Product", "unassigned");
    defaultProductNames.forEach(
      productName -> this.productService.create(new Product(productName, savedBoard.getId(), space.getId()))
    );
    return savedBoard;
  }

  Board update(Board boardWithChanges, String spaceName) {
    Board currentBoard = boardRepository
      .findById(boardWithChanges.getId())
      .orElseThrow(BoardNotExistsException::new);
    currentBoard.setName(boardWithChanges.getName());

    Space space = Optional.ofNullable(spaceRepository.findByNameIgnoreCase(spaceName))
      .orElseThrow(() -> new SpaceNotExistsException(spaceName));
    if (
      spaceHasBoardWithNameAndNotId(
        space,
        boardWithChanges.getName(),
        boardWithChanges.getId()
      )
    ) {
      throw new BoardAlreadyExistsException(boardWithChanges.getName());
    }
    return boardRepository.saveAndUpdateSpaceLastModified(currentBoard);
  }

  @Transactional
  public void delete(Integer boardId) {
    if (!hasBoardWithId(boardId)) {
      throw new BoardNotExistsException();
    }
    productService.deleteForBoardId(boardId);

    var boardToDelete = boardRepository.findById(boardId).get();
    boardRepository.deleteAndUpdateSpaceLastModified(boardToDelete);
  }

  private boolean hasBoardWithId(Integer boardId) {
    return boardId != null && boardRepository.findById(boardId).isPresent();
  }

  private boolean spaceHasBoardWithName(Space space, String name) {
    return (
      space
        .getBoards()
        .stream()
        .anyMatch(x -> x.getName().equalsIgnoreCase(name))
    );
  }

  private boolean spaceHasBoardWithNameAndNotId(
    Space space,
    String name,
    int boardId
  ) {
    return (
      space
        .getBoards()
        .stream()
        .filter(x -> !x.getId().equals(boardId))
        .anyMatch(x -> x.getName().equalsIgnoreCase(name))
    );
  }
}
