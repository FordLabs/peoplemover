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
import ArchivedPersonDrawer from './ArchivedPersonDrawer';
import configureStore from 'redux-mock-store';

describe('Archived People', () => {
    let app: RenderResult;

    const mayFourteen: Date = new Date(2020, 4, 14);

    describe('Showing archived people', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            const mockStore = configureStore([]);
            const store = mockStore({
                currentSpace: TestUtils.space,
                viewingDate: mayFourteen,
                people: TestUtils.people,
            });

            await wait(() => {
                app = renderWithRedux(
                    <ArchivedPersonDrawer/>, store, undefined
                );
            });
        });

        it('has the Archived Person drawer', async () => {
            expect(app.queryByText(/Archived People/)).toBeInTheDocument();
        });

        it('shows the name of an archived person once opened', async () => {
            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(await app.findByText(TestUtils.unassignedPerson.name)).toBeInTheDocument();
        });

        it('does not show names of people who are not archived', async () => {
            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(app.queryByText(TestUtils.person1.name)).not.toBeInTheDocument();
        });

        it('should not show people who have not passed their archived date', async () => {
            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(app.queryByText(TestUtils.hank.name)).not.toBeInTheDocument();
        });

        it('can be closed and opened again', async () => {
            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(await app.findByText(TestUtils.unassignedPerson.name)).toBeInTheDocument();
            fireEvent.click(drawerCaret);
            expect(await app.queryByText(TestUtils.unassignedPerson.name)).not.toBeInTheDocument();

        });
    });
});
