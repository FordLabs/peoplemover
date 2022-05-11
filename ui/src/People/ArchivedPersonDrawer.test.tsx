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

import {fireEvent, RenderResult, waitFor, screen} from '@testing-library/react';
import React from 'react';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import ArchivedPersonDrawer from './ArchivedPersonDrawer';
import configureStore from 'redux-mock-store';
describe('Archived People', () => {
    let app: RenderResult;

    const mayFourteen2020: Date = new Date(2020, 4, 14);
    const mayFourteen1999: Date = new Date(1999, 4, 14);

    describe('Showing archived people', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            const mockStore = configureStore([]);
            const store = mockStore({
                currentSpace: TestUtils.space,
                viewingDate: mayFourteen2020,
                people: [...TestUtils.people, TestUtils.unassignedBigBossSE],
            });

            await waitFor(() => {
                app = renderWithRedux(
                    <ArchivedPersonDrawer/>, store, undefined
                );
            });
        });

        it('has the Archived Person drawer', async () => {
            expect(app.queryByText(/Archived People/)).toBeInTheDocument();
        });

        it('shows the names of two archived people but not one unarchived person', async () => {
            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(await app.findByText(TestUtils.archivedPerson.name)).toBeInTheDocument();
            expect(await app.findByText(TestUtils.unassignedBigBossSE.name)).toBeInTheDocument();
            expect(app.queryByText(TestUtils.person1.name)).not.toBeInTheDocument();
            expect(app.container.getElementsByClassName('archivedPersonCard').length).toEqual(2);
            expect((await app.findByTestId('archivedPersonDrawerCountBadge')).innerHTML).toEqual('2');
        });

        it('should not show people who have not passed their archived date', async () => {
            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(app.queryByText(TestUtils.hank.name)).not.toBeInTheDocument();
        });

        it('can be closed and opened again', async () => {
            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(await app.findByText(TestUtils.archivedPerson.name)).toBeInTheDocument();
            fireEvent.click(drawerCaret);
            expect(await app.queryByText(TestUtils.archivedPerson.name)).not.toBeInTheDocument();
        });

        it('should not show an archived person if the viewing date is before their archive date', async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            const mockStore = configureStore([]);
            const store = mockStore({
                currentSpace: TestUtils.space,
                viewingDate: mayFourteen1999,
                people: [...TestUtils.people, TestUtils.unassignedBigBossSE],
            });

            await waitFor(() => {
                app.unmount();
                app = renderWithRedux(
                    <ArchivedPersonDrawer/>, store, undefined
                );
            });

            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(await app.queryByText(TestUtils.archivedPerson.name)).not.toBeInTheDocument();
            expect(await app.findByText(TestUtils.unassignedBigBossSE.name)).toBeInTheDocument();
            expect(app.queryByText(TestUtils.person1.name)).not.toBeInTheDocument();
            expect(app.container.getElementsByClassName('archivedPersonCard').length).toEqual(1);
        });
    });

    describe('Showing the drawer in the app', () => {
        beforeEach(  async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            await TestUtils.renderPeopleMoverComponent();
        });

        it('should show the archived people drawer', () => {
            expect(screen.getByText('Archived People')).toBeInTheDocument();
        });
    });
});
