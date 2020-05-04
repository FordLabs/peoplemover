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

import com.ford.internalprojects.peoplemover.utilities.BasicLogger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/board")
public class BoardController {
  private BoardService boardService;
  private BasicLogger logger;

  public BoardController(BoardService boardService, BasicLogger logger) {
    this.boardService = boardService;
    this.logger = logger;
  }

  @GetMapping(path = "/{spaceName}")
  public ResponseEntity<List<Board>> getAllBoardsInSpace(
    @PathVariable String spaceName
  ) {
    this.logger.logInfoMessage(
        String.format("board retrieved for space: [%s].", spaceName)
      );
    return ResponseEntity.ok(boardService.getAllInSpace(spaceName));
  }

  @PostMapping(path = "/{spaceName}")
  public ResponseEntity<Board> createBoard(
    @PathVariable String spaceName,
    @Valid @RequestBody Board boardRequest
  ) {
    Board createdBoard = boardService.createForSpace(boardRequest, spaceName);
    this.logger.logInfoMessage(
        String.format(
          "Board [%s] with id [%s] created for space: [%s].",
          createdBoard.getName(),
          createdBoard.getId(),
          spaceName
        )
      );
    return ResponseEntity.ok(createdBoard);
  }

  @PutMapping(path = "/{boardId}/{spaceName}")
  public ResponseEntity updateBoard(
    @PathVariable Integer boardId,
    @PathVariable String spaceName,
    @Valid @RequestBody Board boardRequest
  )
    throws Exception {
    boardRequest.setId(boardId);

    Board savedBoard = boardService.update(boardRequest, spaceName);

    this.logger.logInfoMessage(
        String.format(
          "Board with id [%s] updated for space: [%s].",
          savedBoard.getId(),
          spaceName
        )
      );
    return ResponseEntity.ok(savedBoard);
  }

  @DeleteMapping(path = "/{boardId}")
  public ResponseEntity deleteBoard(@PathVariable Integer boardId)
    throws Exception {
    boardService.delete(boardId);
    this.logger.logInfoMessage(
        String.format("Board with id [%s] deleted.", boardId)
      );
    return ResponseEntity.noContent().build();
  }
}
