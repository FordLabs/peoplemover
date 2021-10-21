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

import {RenderResult, wait} from '@testing-library/react';
import React from 'react';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import configureStore from 'redux-mock-store';
import ReassignedDrawer from './ReassignedDrawer';
import AssignmentClient from '../Assignments/AssignmentClient';
import {AxiosResponse} from 'axios';

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
                        fromProductName: fromProductName,
                        toProductName: 'unassigned',
                    }],
                } as AxiosResponse
            ));

            const mockStore = configureStore([]);
            const store = mockStore({
                currentSpace: TestUtils.space,
                viewingDate: mayFourteen2020,
                people: TestUtils.people,
            });

            await wait(async () => {
                app = renderWithRedux(<ReassignedDrawer/>, store);
            });
        });

        it('should show that they have been archived', async () => {
            expect(await app.findByText(TestUtils.archivedPerson.name)).toBeInTheDocument();
            expect(await app.findByText(TestUtils.archivedPerson.spaceRole!.name)).toBeInTheDocument();
            expect(await app.findByText(/Product 1/)).toBeInTheDocument();
            expect(await app.queryByText(/unassigned/)).not.toBeInTheDocument();
            expect(await app.findByText(/archived/)).toBeInTheDocument();
        });
    });
});
