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

import com.ford.internalprojects.peoplemover.space.Space;
import com.ford.internalprojects.peoplemover.space.SpaceRepository;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
public class BoardServiceTest {

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private BoardService underTest;

    @After
    public void cleanup() {
        boardRepository.deleteAll();

        spaceRepository.deleteAll();
    }

    @Test
    public void getAllInSpace_shouldReturnBoards_inAlphabeticalOrder() {
        Space space = spaceRepository.save(new Space("doesntMatter"));

        Board board1 = new Board("1. board1", space.getId());
        Board board2 = new Board("Oard2", space.getId());
        Board board3 = new Board("board3", space.getId());

        boardRepository.saveAll(Arrays.asList(board1, board2, board3));

        final List<Board> expectedBoards = Arrays.asList(
                board1, board3, board2
        );

        final List<Board> actualBoards = underTest.getAllInSpace(space.getName());

        assertThat(actualBoards.size()).isEqualTo(expectedBoards.size());
        for(int k = 0; k < actualBoards.size(); ++k) {
            Board currentBoard = actualBoards.get(k);
            assertThat(currentBoard.getName()).isEqualTo(expectedBoards.get(k).getName());
        }
    }
}
