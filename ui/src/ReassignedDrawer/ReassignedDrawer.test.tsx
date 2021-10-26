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
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import ReassignedDrawer from './ReassignedDrawer';
import AssignmentClient from '../Assignments/AssignmentClient';
import PeopleClient from '../People/PeopleClient';
import {AxiosResponse} from 'axios';
import thunk from 'redux-thunk';
import {applyMiddleware, createStore} from 'redux';
import rootReducer from '../Redux/Reducers';

describe('ReassignedDrawer', () => {
    let app: RenderResult;
    const mayFourteen2020: Date = new Date(2020, 4, 14);
    const fromProductName = 'Product 1';

    describe('archived people', () => {

        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            AssignmentClient.getReassignments = jest.fn(() => Promise.resolve(
                {
                    data: [{
                        person: TestUtils.archivedPerson,
                        originProductName: fromProductName,
                        destinationProductName: 'unassigned',
                    }],
                } as AxiosResponse
            ));

            const store = createStore(rootReducer, {
                currentSpace: TestUtils.space,
                viewingDate: mayFourteen2020,
                people: TestUtils.people,
            }, applyMiddleware(thunk));
            store.dispatch = jest.fn();

            await wait(async () => {
                app = renderWithRedux(<ReassignedDrawer/>, store);
            });
        });

        it('should show that they have been archived', async () => {
            expect(await app.findByText(TestUtils.archivedPerson.name)).toBeInTheDocument();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(await app.findByText(TestUtils.archivedPerson.spaceRole!.name)).toBeInTheDocument();
            expect(await app.findByText(/Product 1/)).toBeInTheDocument();
            expect(await app.queryByText(/unassigned/)).not.toBeInTheDocument();
            expect(await app.findByText(/archived/)).toBeInTheDocument();
        });

        it('should unarchive an archived person that gets reverted', async () => {
            AssignmentClient.deleteAssignmentForDate = jest.fn(() => Promise.resolve(
                { data: []} as AxiosResponse
            ));
            PeopleClient.updatePerson = jest.fn(() => Promise.resolve(
                {data: {...TestUtils.archivedPerson, archiveDate: null}} as AxiosResponse
            ));
            const revertButton = await app.findByText('Revert');
            fireEvent.click(revertButton);
            expect(AssignmentClient.deleteAssignmentForDate).toHaveBeenCalledTimes(1);
            expect(AssignmentClient.deleteAssignmentForDate).toHaveBeenCalledWith(mayFourteen2020, TestUtils.archivedPerson);
            expect(PeopleClient.updatePerson).toHaveBeenCalledTimes(1);
            expect(PeopleClient.updatePerson).toHaveBeenCalledWith(TestUtils.space, {...TestUtils.archivedPerson, archiveDate: undefined}, []);
        });
    });
});
