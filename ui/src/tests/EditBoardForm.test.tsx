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
import {fireEvent} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import BoardClient from '../Boards/BoardClient';
import TestUtils, {renderWithRedux} from './TestUtils';
import {AxiosResponse} from 'axios';

describe('edit board form', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('editing a board', () => {
        it('should show the edit board modal when hambaga button clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            fireEvent.click(app.getByTestId('openEditBoardIcon-1'));

            expect(app.getByText('Edit Board')).toBeInTheDocument();
            expect(app.getByLabelText(/Name/).value).toEqual('Board One');
        });

        it('should show the delete board button in the edit board modal', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            fireEvent.click(app.getByTestId('openEditBoardIcon-1'));
            expect(app.getByText('Edit Board')).toBeInTheDocument();
            expect(app.getByText('Delete Board')).toBeInTheDocument();
        });

        it('should focus on the name when form appears', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            fireEvent.click(app.getByTestId('openEditBoardIcon-1'));
            expect(app.queryByLabelText('Name')).toHaveFocus();
        }
        );

        it('should hide the edit board modal when close button is clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            fireEvent.click(app.getByTestId('openEditBoardIcon-1'));
            fireEvent.click(app.getByTestId('modalCloseButton'));

            expect(app.queryByText('Edit Board')).toBeNull();
        });

        it('should hide the edit board modal when new name is submitted', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            fireEvent.click(app.getByTestId('openEditBoardIcon-1'));
            fireEvent.change(app.getByLabelText('Name'), {target: {value: 'board none'}});
            fireEvent.click(app.getByText('Save'));

            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByText('Edit Board')).toBeNull();
        });

        it('should call board client with the new board name when it is submitted', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            fireEvent.click(app.getByTestId('openEditBoardIcon-1'));
            fireEvent.change(app.getByLabelText('Name'), {target: {value: 'board none'}});
            fireEvent.click(app.getByText('Save'));

            await TestUtils.waitForHomePageToLoad(app);

            expect(BoardClient.updateBoard).toBeCalledTimes(1);
            expect(BoardClient.updateBoard).toBeCalledWith(1, 'board none');
        });

        it('should show the correct board name in the edit board modal when the hambaga icon is clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            fireEvent.click(app.getByTestId('openEditBoardIcon-2'));
            await TestUtils.waitForHomePageToLoad(app);

            expect(app.getByLabelText('Name').value).toEqual('Board Two');
        });

    });

    describe('deleting a board', () => {
        it('does not show the confirmation modal when the page loads', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByText('Are you sure you want to delete')).toBeNull();
        });

        it('shows the confirmation modal when the delete board button is clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const editBoardButton = await app.findByTestId('openEditBoardIcon-1');
            fireEvent.click(editBoardButton);

            const deleteBoardButton = await app.findByText('Delete Board');
            fireEvent.click(deleteBoardButton);

            expect(app.getByText(/Are you sure?/i)).toBeInTheDocument();
        });

        it('does not show the confirmation modal after the cancel button is clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const editBoardButton = await app.findByTestId('openEditBoardIcon-1');
            fireEvent.click(editBoardButton);

            const deleteBoardButton = await app.findByText('Delete Board');
            fireEvent.click(deleteBoardButton);

            const cancelButton = await app.findByTestId('confirmationModalCancel');
            fireEvent.click(cancelButton);

            expect(app.queryByText(/Are you sure you want to delete/i)).toBeNull();
        });

        it('does not show the confirmation modal after the yes button is clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const editBoardButton = await app.findByTestId('openEditBoardIcon-1');
            fireEvent.click(editBoardButton);

            const deleteBoardButton = await app.findByText('Delete Board');
            fireEvent.click(deleteBoardButton);

            const cancelButton = await app.findByText('Delete');
            fireEvent.click(cancelButton);

            expect(app.queryByText(/Are you sure you want to delete/i)).toBeNull();
        });

        it('sends delete request after the yes button is clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            const editBoardButton = await app.findByTestId('openEditBoardIcon-1');
            fireEvent.click(editBoardButton);

            const deleteBoardButton = await app.findByText('Delete Board');
            fireEvent.click(deleteBoardButton);

            const cancelButton = await app.findByText('Delete');
            fireEvent.click(cancelButton);

            expect(BoardClient.deleteBoard).toBeCalledTimes(1);
            expect(BoardClient.deleteBoard).toBeCalledWith(1);
        });

        it('when there are two boards and one is deleted, show the other', async () => {
            BoardClient.deleteBoard = jest.fn(() => Promise.resolve({} as AxiosResponse));

            const app = renderWithRedux(<PeopleMover/>);
            await app.findByText('Product 1');
            expect(app.queryByText('Product 2')).toBeNull();

            BoardClient.getAllBoards = jest.fn(() => Promise.resolve({
                data: [TestUtils.boards[1]],
            } as AxiosResponse
            ));

            const editBoardButton = await app.findByTestId('openEditBoardIcon-1');
            fireEvent.click(editBoardButton);

            const deleteBoardButton = await app.findByText('Delete Board');
            fireEvent.click(deleteBoardButton);

            const cancelButton = await app.findByText('Delete');
            fireEvent.click(cancelButton);

            await app.findByText('Product 2');
        });

        it('when there is only one board and user clicks on hambaga icon, disable the delete board link', async () => {
            BoardClient.getAllBoards = jest.fn(() => Promise.resolve({
                data: [
                    TestUtils.boards[0],
                ],
            } as AxiosResponse));

            const app = renderWithRedux(<PeopleMover/>);

            await app.findByText('Board One');
            await app.findByText('Product 1');
            expect(app.queryByText('Board Two')).not.toBeInTheDocument();

            const editBoardButton = await app.findByTestId('openEditBoardIcon-1');
            fireEvent.click(editBoardButton);

            const deleteButton = await app.findByTestId('deleteButton');
            expect(deleteButton).toHaveClass('isDisabled');
        });
    });
});