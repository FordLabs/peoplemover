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

import {fireEvent, wait} from '@testing-library/react';
import React from 'react';
import PeopleMover from '../Application/PeopleMover';
import TestUtils, {renderWithRedux} from './TestUtils';
import BoardClient from '../Boards/BoardClient';
import {Product} from '../Products/Product';
import {Board} from '../Boards/Board';
import {Assignment} from '../Assignments/Assignment';

describe('Unassigned Products', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('showing the unassigned product', () => {
        it('has the unassigned product drawer closed by default', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByText(/unassigned/)).toBeNull();
        });

        it('shows the unassigned product drawer when the handle is clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawerCaret = drawerCarets[0];
            fireEvent.click(unassignedDrawerCaret);

            await app.findByTestId('unassignedPeopleContainer');
        });

        it('hides the unassigned product drawer when the handle is clicked again', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawerCaret = drawerCarets[0];

            fireEvent.click(unassignedDrawerCaret);

            await app.findByTestId('unassignedPeopleContainer');

            fireEvent.click(unassignedDrawerCaret);
            expect(app.queryByText('unassignedPeopleContainer')).toBeNull();
        });

        it('hides the number of unassigned people when there are less than 1', async () => {
            const emptyUnassignedProduct: Product = {
                ...TestUtils.unassignedProduct,
                assignments: [],
                boardId: 2,
            };
            const testBoard: Board = {
                ...TestUtils.boards[1],
                products: [emptyUnassignedProduct],
            };

            (BoardClient.getAllBoards as Function) = jest.fn(() => Promise.resolve(
                {
                    data: [testBoard],
                }
            ));

            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByTestId('countBadge')).toBeNull();
        });
    });

    describe('Automated linkage between modals and drawers', () => {
        it('opens the unassigned drawer when an unassigned person is created', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByTestId('unassignedPeopleContainer')).not.toBeInTheDocument();
            fireEvent.click(app.getByText('Add Person'));
            await TestUtils.waitForHomePageToLoad(app);

            fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Some Person Name'}});
            fireEvent.change(app.getByLabelText('Role'), {target: {value: 'Software Engineer'}});

            fireEvent.click(app.getByText('Create'));

            await app.findByTestId('unassignedPeopleContainer');
        });

        it('should show a count badge on unassigned drawer', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const countBadge = await app.findByTestId('countBadge');
            expect(countBadge.innerHTML).toEqual('1');

            const createPersonButton = await app.findByText('Add Person');
            fireEvent.click(createPersonButton);

            const nameField = await app.findByLabelText('Name');
            fireEvent.change(nameField, {target: {value: 'Some Person Name'}});

            const newUnassignment: Assignment = {
                ...TestUtils.assignmentForUnassigned,
                id: 222,
            };
            const definitelyNotEmptyUnassignedProduct: Product = {
                ...TestUtils.unassignedProduct,
                assignments: [newUnassignment, TestUtils.assignmentForUnassigned],
                boardId: 2,
            };
            const testBoard: Board = {
                ...TestUtils.boards[1],
                products: [definitelyNotEmptyUnassignedProduct],
            };

            (BoardClient.getAllBoards as Function) = jest.fn(() => Promise.resolve(
                {
                    data: [testBoard],
                }
            ));

            const createButton = await app.findByText('Create');
            fireEvent.click(createButton);

            await wait(() => {
                expect(countBadge.innerHTML).toEqual('2');
            });
        });
    });

    describe('edit menus', () => {
        it('should open edit person dialog when clicking on ellipsis', async () => {
            const component = <PeopleMover/>;
            const initialState = { people: TestUtils.people};
            const app = renderWithRedux(component, undefined, initialState);

            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawer = drawerCarets[0];
            fireEvent.click(unassignedDrawer);

            const editUnassignment = await app.findByTestId(`editPersonIconContainer-${TestUtils.assignmentForUnassigned.id}`);
            fireEvent.click(editUnassignment);

            const unassignedPersonName: HTMLInputElement = await app.findByLabelText('Name') as HTMLInputElement;
            expect(unassignedPersonName.value).toEqual(TestUtils.assignmentForUnassigned.person.name);
        });

        it('should close unassigned edit menu when opening an edit menu in product list', async () => {
            const component = <PeopleMover/>;
            const initialState = { people: TestUtils.people};
            const app = renderWithRedux(component, undefined, initialState);

            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawer = drawerCarets[0];
            fireEvent.click(unassignedDrawer);

            const editUnassignment = await app.findByTestId(`editPersonIconContainer-${TestUtils.assignmentForUnassigned.id}`);
            fireEvent.click(editUnassignment);

            const unassignedPersonName = await app.findByLabelText('Name');
            expect(unassignedPersonName.value).toEqual(TestUtils.assignmentForUnassigned.person.name);

            const closeForm = await app.findByTestId('modalCloseButton');
            fireEvent.click(closeForm);

            const editProduct1Assignment = await app.findByTestId(`editPersonIconContainer-${TestUtils.assignmentForPerson1.id}`);
            fireEvent.click(editProduct1Assignment);

            const editPerson1 = await app.findByText('Edit Person');
            fireEvent.mouseDown(editPerson1);
            fireEvent.mouseUp(editPerson1);

            const person1Name = await app.findByLabelText('Name');
            expect(person1Name.value).toEqual(TestUtils.assignmentForPerson1.person.name);
        });
    });
});