/*
 * Copyright (c) 2022 Ford Motor Company
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

import {fireEvent, screen, waitFor} from '@testing-library/react';
import React from 'react';
import PeopleMover from '../PeopleMover/PeopleMover';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import {Product} from '../Products/Product';
import {MemoryRouter} from 'react-router-dom';
import UnassignedDrawer from './UnassignedDrawer';
import {act} from 'react-dom/test-utils';
import AssignmentClient from '../Assignments/AssignmentClient';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';

xdescribe('Unassigned Products', () => {
    const submitFormButtonText = 'Add';

    describe('Showing the unassigned product', () => {
        beforeEach(  async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            renderWithRedux(
                <MemoryRouter initialEntries={['/uuid']}>
                    <PeopleMover/>
                </MemoryRouter>
            );

            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())
        });
        it('has the unassigned product drawer closed by default', async () => {
            expect(screen.queryByText(/unassigned/)).toBeNull();
        });

        it('shows the unassigned product drawer when the handle is clicked', async () => {
            const unassignedDrawerCaret = await screen.findByTestId('unassignedDrawerCaret');
            fireEvent.click(unassignedDrawerCaret);

            await screen.findByTestId('unassignedPeopleContainer');
        });

        it('hides the unassigned product drawer when the handle is clicked again', async () => {
            const unassignedDrawerCaret = await screen.findByTestId('unassignedDrawerCaret');

            fireEvent.click(unassignedDrawerCaret);

            await screen.findByTestId('unassignedPeopleContainer');

            fireEvent.click(unassignedDrawerCaret);
            expect(screen.queryByText('unassignedPeopleContainer')).toBeNull();
        });
    });

    describe('showing the unassigned product, but...', () => {
        const renderWithUnassignedProduct = (products: Product[]) => {
            renderWithRedux(
                <UnassignedDrawer/>,
                undefined,
                {
                    allGroupedTagFilterOptions: [
                        { label: 'Location Tags:', options: []},
                        { label: 'Product Tags:', options: []},
                        { label: 'Role Tags:', options: []},
                        { label: 'Person Tags:', options: []},
                    ],
                    isUnassignedDrawerOpen: true,
                    products: products,
                    currentSpace: TestUtils.space,
                }
            );
        }

        it('hides the number of unassigned people when there are less than 1', async () => {
            const emptyUnassignedProduct: Product = {
                ...TestUtils.unassignedProduct,
                assignments: [],
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            };
            renderWithUnassignedProduct([emptyUnassignedProduct])

            await waitFor(() => expect(screen.queryByTestId('countBadge')).toBeNull());
        });

        it('does not show archived people as unassigned', async () => {
            renderWithUnassignedProduct( [TestUtils.unassignedProduct])

            await waitFor(() => expect(screen.queryByText(TestUtils.archivedPerson.name)).toBeNull());
        });

        it('should show an archived person as unassigned if their archive date has not passed', async () => {
            const product = {...TestUtils.unassignedProduct, assignments:[TestUtils.assignmentForHank]};
            renderWithUnassignedProduct( [product])
            screen.getByText(TestUtils.hank.name);
        });
    });

    describe('Automated linkage between modals and drawers', () => {
        beforeEach(  async  () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            renderWithRedux(
                <MemoryRouter initialEntries={['/uuid']}>
                    <PeopleMover/>
                </MemoryRouter>
            );

            await waitFor(() => expect(AssignmentClient.getReassignments).toHaveBeenCalled())
        });

        it('opens the unassigned drawer when an unassigned person is created', async () => {
            const addPerson = await screen.findByTestId('addPersonButton');
            expect(screen.queryByTestId('unassignedPeopleContainer')).not.toBeInTheDocument();
            await act(async () => {
                fireEvent.click(addPerson);
            });
            const personNameField = await screen.getByLabelText('Name');
            fireEvent.change(personNameField, {target: {value: 'Some Person Name'}});

            fireEvent.click(screen.getByText(submitFormButtonText));

            await screen.findByTestId('unassignedPeopleContainer');
        });
    });

    describe('Edit menus', () => {
        const initialState = {people: TestUtils.people, productTags: [TestUtils.productTag1]};

        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            await waitFor( () => {
                renderWithRedux(
                    <MemoryRouter initialEntries={['/uuid']}>
                        <PeopleMover/>
                    </MemoryRouter>,
                    undefined,
                    initialState
                );
            });
        });

        it('should open edit person dialog when clicking on ellipsis', async () => {
            const unassignedDrawerCaret = await screen.findByTestId('unassignedDrawerCaret');
            fireEvent.click(unassignedDrawerCaret);

            const editUnassignment = await screen.findByTestId(`editPersonIconContainer__unassigned_person_7`);
            fireEvent.click(editUnassignment);

            const unassignedPersonName: HTMLInputElement = await screen.findByLabelText('Name') as HTMLInputElement;
            expect(unassignedPersonName.value).toEqual(TestUtils.unassignedPerson.name);
        });

        // @todo should be a cypress test
        xit('should close unassigned edit menu when opening an edit menu in product list', async () => {
            const unassignedDrawerCaret = await screen.findByTestId('unassignedDrawerCaret');
            fireEvent.click(unassignedDrawerCaret);

            const editUnassignment = await screen.findByTestId(`editPersonIconContainer__unassigned_person_7`);
            fireEvent.click(editUnassignment);

            const unassignedPersonName = await screen.findByLabelText('Name');
            expect(unassignedPersonName).toHaveValue(TestUtils.unassignedPerson.name);

            const closeForm = await screen.findByTestId('modalCloseButton');
            fireEvent.click(closeForm);

            const editProduct1Assignment = await screen.findByTestId(`editPersonIconContainer__person_1`);
            await act(async () => {
                fireEvent.click(editProduct1Assignment);
            });

            const editPerson1 = await screen.findByText('Edit Person');
            fireEvent.click(editPerson1);

            const person1Name = await screen.findByLabelText('Name');
            expect(person1Name).toHaveValue(TestUtils.assignmentForPerson1.person.name);
        });
    });
});
