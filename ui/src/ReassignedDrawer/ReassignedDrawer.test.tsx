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

import {fireEvent, screen, waitFor} from '@testing-library/react';
import React from 'react';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import ReassignedDrawer from './ReassignedDrawer';
import AssignmentClient from '../Assignments/AssignmentClient';
import PeopleClient from '../People/PeopleClient';
import thunk from 'redux-thunk';
import {applyMiddleware, createStore, Store} from 'redux';
import rootReducer from '../Redux/Reducers';
import ProductClient from '../Products/ProductClient';
import {RecoilRoot} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {PeopleState} from '../State/PeopleState';

jest.mock('../Products/ProductClient');

describe('ReassignedDrawer', () => {
    let store: Store;
    const mayFourteen2020: Date = new Date(2020, 4, 14);
    const fromProductName = 'Product 1';

    describe('archived people', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            AssignmentClient.getReassignments = jest.fn().mockResolvedValue( {
                data: [{
                    person: TestData.archivedPerson,
                    originProductName: fromProductName,
                    destinationProductName: 'unassigned',
                }],
            });

            store = createStore(rootReducer, {
                currentSpace: TestData.space,
            }, applyMiddleware(thunk));

            await waitFor(async () => {
                renderWithRedux(
                    <RecoilRoot initializeState={({set}) => {
                        set(ViewingDateState, mayFourteen2020)
                        set(PeopleState, TestData.people)
                    }}>
                        <MemoryRouter initialEntries={['/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']}>
                            <Routes>
                                <Route path="/:teamUUID" element={<ReassignedDrawer/>} />
                            </Routes>
                        </MemoryRouter>
                    </RecoilRoot>,
                    store
                );
            });
        });

        it('should show that they have been archived', async () => {
            expect(await screen.findByText(TestData.archivedPerson.name)).toBeInTheDocument();
            expect(await screen.findByText(TestData.archivedPerson.spaceRole!.name)).toBeInTheDocument();
            expect(await screen.findByText(/Product 1/)).toBeInTheDocument();
            expect(await screen.queryByText(/unassigned/)).not.toBeInTheDocument();
            expect(await screen.findByText(/archived/)).toBeInTheDocument();
        });

        it('should unarchive an archived person that gets reverted', async () => {
            AssignmentClient.deleteAssignmentForDate = jest.fn().mockResolvedValue({ data: []});
            PeopleClient.updatePerson = jest.fn().mockResolvedValue({data: {...TestData.archivedPerson, archiveDate: null}});
            const revertButton = await screen.findByText('Revert');
            await waitFor(() => {
                fireEvent.click(revertButton);
            });
            expect(AssignmentClient.deleteAssignmentForDate).toHaveBeenCalledTimes(1);
            expect(AssignmentClient.deleteAssignmentForDate).toHaveBeenCalledWith(mayFourteen2020, TestData.archivedPerson);
            expect(PeopleClient.updatePerson).toHaveBeenCalledTimes(1);
            expect(PeopleClient.updatePerson).toHaveBeenCalledWith(TestData.space, {...TestData.archivedPerson, archiveDate: undefined}, []);
            expect(ProductClient.getProductsForDate).toHaveBeenCalledTimes(1);
            expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(TestData.space.uuid, mayFourteen2020);
            expect(PeopleClient.getAllPeopleInSpace).toHaveBeenCalledTimes(1);
            expect(PeopleClient.getAllPeopleInSpace).toHaveBeenCalledWith(TestData.space.uuid);
        });
    });
});
