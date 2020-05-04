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

import React, {ChangeEvent, useState} from 'react';
import BoardClient from './BoardClient';
import '../Modal/Form.scss';
import {connect} from 'react-redux';
import {closeModalAction, setCurrentBoardAction} from '../Redux/Actions';
import {AxiosPromise} from 'axios';
import {Board} from './Board';
import {Product} from '../Products/Product';
import {Dispatch} from 'redux';
import {Assignment} from '../Assignments/Assignment';

interface CreateBoardFormProps {
    boards: Array<Board>;

    closeModal(): void;

    setCurrentBoard(board: Board, sortOptionValue: string): void;
}

function CreateBoardForm({boards, closeModal, setCurrentBoard}: CreateBoardFormProps): JSX.Element {
    const DUPLICATE_BOARD_MESSAGE = 'This board name is already in use. Please enter a unique board name.';

    const [currentBoardName, setCurrentBoardName] = useState<string>('');
    const [copyFromBoardName, setCopyFromBoardName] = useState<string>('');
    const [isBlankContentSource, setIsBlankContentSource] = useState<boolean>(true);
    const [nameCollisionError, setNameCollisionError] = useState<boolean>(false);

    function changeCopyFromBoard(event: ChangeEvent<HTMLSelectElement>): void {
        const incomingCopyFromBoardName = event.target.value;
        setCopyFromBoardName(incomingCopyFromBoardName);
    }

    function updateBoardName(event: ChangeEvent<HTMLInputElement>): void {
        const incomingSandboxName = event.target.value;
        setCurrentBoardName(incomingSandboxName);
    }

    async function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>): Promise<void> {
        if (event.key === 'Enter') {
            event.preventDefault();
            await createBoard();
        }
    }

    async function createBoard(): Promise<void> {
        let createBoardResultPromise: AxiosPromise;
        if (!isBlankContentSource) {
            createBoardResultPromise = BoardClient.createBoard(buildNewBoardFromOld(currentBoardName, copyFromBoardName));
        } else {
            createBoardResultPromise = BoardClient.createEmptyBoard(currentBoardName);
        }

        try {
            const boardResponse = await createBoardResultPromise;
            const createdBoard: Board = boardResponse.data;
            setCurrentBoard(createdBoard, localStorage.getItem('sortBy')!);
            closeModal();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setNameCollisionError(true);
            } else {
                setNameCollisionError(false);
            }
        }
    }

    function buildNewBoardFromOld(newBoardName: string, oldBoardName: string): Board {
        let newBoard: Board = {} as Board;

        for (const board of boards) {
            if (board.name === oldBoardName) {
                newBoard = board;
                removeIdsForBoardCopy(newBoard, newBoardName);
                break;
            }
        }

        return newBoard;
    }

    function removeIdsForBoardCopy(newBoard: Board, newBoardName: string): void {
        newBoard.products.forEach((product: Product) => {
            delete product.id;
            delete product.boardId;
            if (product.assignments) {
                product.assignments.forEach((assignment: Assignment) => {
                    delete assignment.id;
                    delete assignment.productId;
                });
            }
        });

        newBoard.name = newBoardName;
    }

    function displayNameCollisionError(): JSX.Element {
        return nameCollisionError ?
            <div className="errorMessage">
                {DUPLICATE_BOARD_MESSAGE}
            </div> :
            <></>;
    }

    return (
        <form className="formContainer form" onKeyDown={handleKeyDown}>
            <div className="formItem">
                <label
                    className="formItemLabel"
                    htmlFor="name">
                    Name
                </label>
                <input
                    className="formInput formTextInput"
                    type="text"
                    name="name"
                    id="name"
                    value={currentBoardName}
                    onChange={updateBoardName}
                    placeholder="e.g. Board 1"
                    autoFocus/>
            </div>
            <p className="formItem formItemLabel">
                Board Content
            </p>
            <div className="formItem">
                <label className="formItemLabel"
                    htmlFor="blankInput">
                    <input
                        className="formInput checkbox"
                        type="radio"
                        id="blankInput"
                        checked={isBlankContentSource}
                        onChange={(): void => setIsBlankContentSource(true)}
                    />
                    Blank</label>
            </div>
            <div className="formItem">
                <label className="formItemLabel"
                    htmlFor="copyFromInput">
                    <input
                        className="formInput checkbox"
                        id="copyFromInput"
                        type="radio"
                        checked={!isBlankContentSource}
                        onChange={(): void => setIsBlankContentSource(false)}
                    />
                    Copy From
                </label>

                <select
                    className="formInput sub"
                    id="copyFromBoard"
                    data-testid="copyFromBoard"
                    name="copyFromBoard"
                    onChange={changeCopyFromBoard}
                    disabled={isBlankContentSource || boards === undefined || boards.length < 1}
                    value={copyFromBoardName}>
                    <option value=""/>
                    {boards.map((board: Board) => (
                        <option key={board.id}
                            value={board.name}>
                            {board.name}
                        </option>)
                    )}
                </select>
            </div>
            {displayNameCollisionError()}
            <div className="yesNoButtons">
                <button className="formButton cancelFormButton" onClick={closeModal}>Cancel</button>
                <input className="formButton"
                    onClick={createBoard}
                    type="button"
                    value="Create"/>
            </div>
        </form>
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentBoard: (board: Board, sortOptionValue: string) => dispatch(setCurrentBoardAction(board, sortOptionValue)),
});

export default connect(null, mapDispatchToProps)(CreateBoardForm);