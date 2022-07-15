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
import {renderWithRecoil} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import ReassignedDrawer from './ReassignedDrawer';
import AssignmentClient from '../Assignments/AssignmentClient';
import PeopleClient from '../People/PeopleClient';
import ProductClient from '../Products/ProductClient';
import {ViewingDateState} from '../State/ViewingDateState';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {PeopleState} from '../State/PeopleState';
import {CurrentSpaceState} from '../State/CurrentSpaceState';

jest.mock('Products/ProductClient');
jest.mock('People/PeopleClient');
jest.mock('Assignments/AssignmentClient');

describe('ReassignedDrawer', () => {
    const mayFourteen2020: Date = new Date(2020, 4, 14);
    const fromProductName = 'Product 1';

    describe('Archived people', () => {
        beforeEach(async () => {
            AssignmentClient.getReassignments = jest.fn().mockResolvedValue( {
                data: [{
                    person: TestData.archivedPerson,
                    originProductName: fromProductName,
                    destinationProductName: 'unassigned',
                }],
            });

            renderWithRecoil(
                <MemoryRouter initialEntries={['/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']}>
                    <Routes>
                        <Route path="/:teamUUID" element={<ReassignedDrawer/>} />
                    </Routes>
                </MemoryRouter>,
                ({set}) => {
                    set(ViewingDateState, mayFourteen2020)
                    set(PeopleState, TestData.people)
                    set(CurrentSpaceState, TestData.space)
                }
            )

            await waitFor(() => expect(AssignmentClient.getReassignments).toHaveBeenCalled())
        });

        it('should show that they have been archived', async () => {
            expect(screen.getByText(TestData.archivedPerson.name)).toBeInTheDocument();
            expect(screen.getByText(TestData.archivedPerson.spaceRole!.name)).toBeInTheDocument();
            expect(screen.getByText(/Product 1/)).toBeInTheDocument();
            expect(screen.queryByText(/unassigned/)).not.toBeInTheDocument();
            expect(screen.getByText(/archived/)).toBeInTheDocument();
        });

        it('should unarchive an archived person that gets reverted', async () => {
            AssignmentClient.deleteAssignmentForDate = jest.fn().mockResolvedValue({ data: []});
            PeopleClient.updatePerson = jest.fn().mockResolvedValue({data: {...TestData.archivedPerson, archiveDate: null}});

            const revertButton = await screen.findByText('Revert');
            fireEvent.click(revertButton);

            await waitFor(() => expect(AssignmentClient.deleteAssignmentForDate).toHaveBeenCalledTimes(1));
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

