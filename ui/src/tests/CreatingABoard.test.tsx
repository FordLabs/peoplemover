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

import React from 'react';
import {fireEvent, RenderResult, wait} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import BoardClient from '../Boards/BoardClient';
import CreateBoardForm from '../Boards/CreateBoardForm';
import TestUtils, {renderWithRedux} from './TestUtils';
import {AxiosResponse} from 'axios';
import {Board} from '../Boards/Board';

describe('the Board Creation form', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('on initial load', () => {
        it('should focus on the name when form appears', async () => {
            const form = renderWithRedux(<CreateBoardForm boards={[]}/>);
            expect(await form.findByLabelText('Name')).toHaveFocus();
        });

        it('should show placeholder text for the board name', async () => {
            const form = renderWithRedux(<CreateBoardForm boards={[]}/>);
            await form.findByPlaceholderText('e.g. Board 1');
        });
    });

    describe('board interactions', () => {
        let app: RenderResult;

        beforeEach(() => {
            TestUtils.mockClientCalls();
            app = renderWithRedux(<PeopleMover/>);
        });

        it('create board form when New Board button is clicked', async () => {
            fireEvent.click(await app.findByTestId('createBoardButton'));
            await app.findByText('Create New Board');
        });

        it('an enabled dropdown on create board form when copy from is selected and boards are available', async () => {
            fireEvent.click(await app.findByTestId('createBoardButton'));
            fireEvent.click(app.getByText('Copy From'));

            const copyFromBoardButton: HTMLSelectElement = await app.findByTestId('copyFromBoard') as HTMLSelectElement;
            expect(copyFromBoardButton.disabled).toBeFalsy();
        });

        it('a disabled dropdown on create board form when copy from is not selected', async () => {
            fireEvent.click(await app.findByTestId('createBoardButton'));

            const copyFromBoardButton: HTMLSelectElement = await app.findByTestId('copyFromBoard') as HTMLSelectElement;
            expect(copyFromBoardButton.disabled).toBeTruthy();
        });

        it('copy from section on create board form', async () => {
            fireEvent.click(await app.findByTestId('createBoardButton'));

            await app.findByText('Copy From');
        });

        it('create a blank board if you ask it to', async () => {
            const board3 = {
                ...TestUtils.boards[1],
                name: 'Namey',
                id: 22,
            };
            BoardClient.createEmptyBoard = jest.fn(() => Promise.resolve({
                data: board3,
            } as AxiosResponse));

            const createBoardButton = await app.findByTestId('createBoardButton');
            fireEvent.click(createBoardButton);

            const nameField = await app.findByLabelText('Name');
            fireEvent.change(nameField, {target: {value: 'Namey'}});

            const blankBoardButton = await app.findByText('Blank');
            fireEvent.click(blankBoardButton);

            (BoardClient.getAllBoards as Function) = jest.fn(() => Promise.resolve(
                {
                    data: [...TestUtils.boards, board3],
                }
            ));

            const saveButton = await app.findByText('Create');
            fireEvent.click(saveButton);

            expect(BoardClient.createEmptyBoard).toHaveBeenCalledWith('Namey');

            await wait(() => {
                expect(app.queryByText('Create New Board')).not.toBeInTheDocument();
            });
        });

        it('create a copy of an existing board if you ask it to', async () => {
            const createBoardButton = await app.findByTestId('createBoardButton');
            fireEvent.click(createBoardButton);

            const copyFromOption = await app.findByText('Copy From');
            fireEvent.click(copyFromOption);

            const copyFromBoardOption = await app.findByTestId('copyFromBoard');
            fireEvent.change(copyFromBoardOption, {target: {value: 'board two'}});

            const boardNameField = await app.findByLabelText('Name');
            fireEvent.change(boardNameField, {target: {value: 'board three'}});

            const saveButton = await app.findByText('Create');
            fireEvent.click(saveButton);
            
            const createBoardRequest: Board = {
                id: 2,
                name: 'board three',
                products: TestUtils.productsForBoard2,
                spaceId: 1,
            };
            await wait(() => {
                expect(BoardClient.createBoard).toHaveBeenCalledWith(createBoardRequest);
                expect(app.queryByText('Create Board')).toBeNull();
            });
        });

        it('not display duplication error message by default', async () => {
            fireEvent.click(await app.findByTestId('createBoardButton'));

            expect(app.queryByText(/already in use/)).toBeNull();
        });

        it('display duplication error message when submitting a board with a name that already exists', async () => {
            BoardClient.createEmptyBoard = jest.fn(() => Promise.reject({response: {status: 400}}));

            fireEvent.click(await app.findByTestId('createBoardButton'));

            const boardNameField = await app.findByLabelText('Name');
            fireEvent.change(boardNameField, {target: {value: 'board one'}});

            const saveButton = await app.findByText('Create');
            fireEvent.click(saveButton);

            await app.findByText(/already in use/);
        });
    });
});
