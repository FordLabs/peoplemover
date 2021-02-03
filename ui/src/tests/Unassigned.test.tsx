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

describe('Unassigned Products', () => {
    const submitFormButtonText = 'Add';
    let app: RenderResult;
    let history: History;

    function applicationSetup(): void {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        history = createBrowserHistory();
        history.push('/uuid');

        app = renderWithRedux(
            <Router history={history}>
                <PeopleMover/>
            </Router>
        );
    }

    describe('Showing the unassigned product', () => {
        it('has the unassigned product drawer closed by default', async () => {
            await applicationSetup();
            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByText(/unassigned/)).toBeNull();
        });

        it('shows the unassigned product drawer when the handle is clicked', async () => {
            await applicationSetup();
            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawerCaret = drawerCarets[0];
            fireEvent.click(unassignedDrawerCaret);

            await app.findByTestId('unassignedPeopleContainer');
        });

        it('hides the unassigned product drawer when the handle is clicked again', async () => {
            await applicationSetup();
            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const unassignedDrawerCaret = drawerCarets[0];

            fireEvent.click(unassignedDrawerCaret);

            await app.findByTestId('unassignedPeopleContainer');

            fireEvent.click(unassignedDrawerCaret);
            expect(app.queryByText('unassignedPeopleContainer')).toBeNull();
        });

        it('hides the number of unassigned people when there are less than 1', async () => {
            const initialState: PreloadedState<GlobalStateProps> = {
                allGroupedTagFilterOptions: [
                    { label: 'Location Tags:', options: []},
                    { label: 'Product Tags:', options: [{}]},
                    { label: 'Role Tags:', options: []},
                ],
            } as GlobalStateProps;

            const emptyUnassignedProduct: Product = {
                ...TestUtils.unassignedProduct,
                assignments: [],
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            };

            const app2 = renderWithRedux(
                <UnassignedDrawer
                    product={emptyUnassignedProduct}
                    isUnassignedDrawerOpen={true}
                    setIsUnassignedDrawerOpen={jest.fn()}
                />,
                undefined,
                initialState
            );

            expect(app2.queryByTestId('countBadge')).toBeNull();
        });
    });

    describe('Automated linkage between modals and drawers', () => {
        it('opens the unassigned drawer when an unassigned person is created', async () => {
            await applicationSetup();
            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByTestId('unassignedPeopleContainer')).not.toBeInTheDocument();
            fireEvent.click(app.getByText('Add Person'));
            await TestUtils.waitForHomePageToLoad(app);

            fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Some Person Name'}});
            fireEvent.change(app.getByLabelText('Role'), {target: {value: 'Software Engineer'}});

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
            fireEvent.mouseDown(editPerson1);
            fireEvent.mouseUp(editPerson1);

            const person1Name = await app.findByLabelText('Name');
            // @ts-ignore
            expect(person1Name.value).toEqual(TestUtils.assignmentForPerson1.person.name);
        });
    });
});
