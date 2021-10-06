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
import {createBrowserHistory, History} from 'history';
import {Router} from 'react-router-dom';
import PeopleMover from '../Application/PeopleMover';

describe('Archived People', () => {
    let app: RenderResult;
    let history: History;

    const mayFourteen: Date = new Date(2020, 4, 14);

    describe('Showing archived people', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            const mockStore = configureStore([]);
            const store = mockStore({
                currentSpace: TestUtils.space,
                viewingDate: mayFourteen,
                people: [...TestUtils.people, TestUtils.unassignedBigBossSE],
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

        it('shows the name of an archived person once opened, but not an unarchived person', async () => {
            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(await app.findByText(TestUtils.archivedPerson.name)).toBeInTheDocument();
            expect(app.queryByText(TestUtils.person1.name)).not.toBeInTheDocument();
        });

        it('shows the names of two archived people', async () => {
            const drawerCaret = await app.findByTestId('archivedPersonDrawerCaret');
            fireEvent.click(drawerCaret);
            expect(await app.findByText(TestUtils.archivedPerson.name)).toBeInTheDocument();
            expect(await app.findByText(TestUtils.unassignedBigBossSE.name)).toBeInTheDocument();
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
    });

    describe('Showing the drawer in the app', () => {
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

        it('should show the archived people drawer', () => {
            expect(app.getByText('Archived People')).toBeInTheDocument();
        });
    });
});
