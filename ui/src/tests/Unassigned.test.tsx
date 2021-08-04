/*
 * Copyright (c) 2021 Ford Motor Company
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

import {fireEvent, RenderResult, wait} from '@testing-library/react';
import React from 'react';
import PeopleMover from '../Application/PeopleMover';
import TestUtils, {renderWithRedux} from './TestUtils';
import {Product} from '../Products/Product';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {createBrowserHistory, History} from 'history';
import {Router} from 'react-router-dom';
import UnassignedDrawer from '../Assignments/UnassignedDrawer';
import {act} from 'react-dom/test-utils';

describe('Unassigned Products', () => {
    const submitFormButtonText = 'Add';
    let app: RenderResult;
    let history: History;

    describe('Showing the unassigned product', () => {
        beforeEach(  async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            history = createBrowserHistory();
            history.push('/uuid');

            await wait(() => {
                app = renderWithRedux(
                    <Router history={history}>
                        <PeopleMover/>
                    </Router>
                );
            });
        });
        it('has the unassigned product drawer closed by default', async () => {
            expect(app.queryByText(/unassigned/)).toBeNull();
        });

        it('shows the unassigned product drawer when the handle is clicked', async () => {
            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawerCaret = drawerCarets[0];
            fireEvent.click(unassignedDrawerCaret);

            await app.findByTestId('unassignedPeopleContainer');
        });

        it('hides the unassigned product drawer when the handle is clicked again', async () => {
            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawerCaret = drawerCarets[0];

            fireEvent.click(unassignedDrawerCaret);

            await app.findByTestId('unassignedPeopleContainer');

            fireEvent.click(unassignedDrawerCaret);
            expect(app.queryByText('unassignedPeopleContainer')).toBeNull();
        });
    });

    describe('showing the unanssigned product, but...', () => {
        it('hides the number of unassigned people when there are less than 1', async () => {
            const emptyUnassignedProduct: Product = {
                ...TestUtils.unassignedProduct,
                assignments: [],
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            };

            const initialState: PreloadedState<GlobalStateProps> = {
                allGroupedTagFilterOptions: [
                    { label: 'Location Tags:', options: []},
                    { label: 'Product Tags:', options: [{}]},
                    { label: 'Role Tags:', options: []},
                    { label: 'Person Tags:', options: []},
                ],
                isUnassignedDrawerOpen: true,
                products: [emptyUnassignedProduct],
                currentSpace: TestUtils.space,
            } as GlobalStateProps;

            let app2: RenderResult;
            await wait(() => {
                app2 = renderWithRedux(
                    <UnassignedDrawer/>,
                    undefined,
                    initialState
                );
            });

            expect(app2.queryByTestId('countBadge')).toBeNull();
        });
    });

    describe('Automated linkage between modals and drawers', () => {
        beforeEach(  () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            history = createBrowserHistory();
            history.push('/uuid');


            app = renderWithRedux(
                <Router history={history}>
                    <PeopleMover/>
                </Router>
            );

        });

        it('opens the unassigned drawer when an unassigned person is created', async () => {
            const addPerson = await app.findByTestId('addPersonButton');
            expect(app.queryByTestId('unassignedPeopleContainer')).not.toBeInTheDocument();
            await act(async () => {
                fireEvent.click(addPerson);
            });
            const personNameField = await app.getByLabelText('Name');
            fireEvent.change(personNameField, {target: {value: 'Some Person Name'}});

            fireEvent.click(app.getByText(submitFormButtonText));

            await app.findByTestId('unassignedPeopleContainer');
        });
    });

    describe('Edit menus', () => {
        const initialState: PreloadedState<GlobalStateProps> = {people: TestUtils.people, productTags: [TestUtils.productTag1]} as GlobalStateProps;

        beforeEach(async () => {
            history = createBrowserHistory();
            history.push('/uuid');

            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            await wait( () => {
                app = renderWithRedux(
                    <Router history={history}>
                        <PeopleMover/>
                    </Router>,
                    undefined,
                    initialState
                );
            });
        });

        it('should open edit person dialog when clicking on ellipsis', async () => {
            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawer = drawerCarets[0];
            fireEvent.click(unassignedDrawer);

            const editUnassignment = await app.findByTestId(`editPersonIconContainer__unassigned_person_7`);
            fireEvent.click(editUnassignment);

            const unassignedPersonName: HTMLInputElement = await app.findByLabelText('Name') as HTMLInputElement;
            expect(unassignedPersonName.value).toEqual(TestUtils.assignmentForUnassigned.person.name);
        });

        it('should close unassigned edit menu when opening an edit menu in product list', async () => {
            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawer = drawerCarets[0];
            fireEvent.click(unassignedDrawer);

            const editUnassignment = await app.findByTestId(`editPersonIconContainer__unassigned_person_7`);
            fireEvent.click(editUnassignment);

            const unassignedPersonName = await app.findByLabelText('Name');
            // @ts-ignore
            expect(unassignedPersonName.value).toEqual(TestUtils.assignmentForUnassigned.person.name);

            const closeForm = await app.findByTestId('modalCloseButton');
            fireEvent.click(closeForm);

            await wait(async () => {
                const editProduct1Assignment = await app.findByTestId(`editPersonIconContainer__person_1`);
                fireEvent.click(editProduct1Assignment);
            });

            const editPerson1 = await app.findByText('Edit Person');
            fireEvent.click(editPerson1);

            const person1Name = await app.findByLabelText('Name');
            // @ts-ignore
            expect(person1Name.value).toEqual(TestUtils.assignmentForPerson1.person.name);
        });
    });
});
