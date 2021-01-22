/*
 * Copyright (c) 2020 Ford Motor Company
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

import {act, fireEvent, RenderResult, wait} from '@testing-library/react';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import PeopleMover from '../Application/PeopleMover';
import React from 'react';
import {Router} from 'react-router-dom';
import {createMemoryHistory} from 'history';
import {MemoryHistory} from 'history/createMemoryHistory';
import SpaceClient from '../Space/SpaceClient';
import Cookies from 'universal-cookie';
import {RunConfig} from '../index';
import {GlobalStateProps} from '../Redux/Reducers';

describe('Account Dropdown',  () => {
    let app: RenderResult;
    let history: MemoryHistory;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        SpaceClient.inviteUsersToSpace = jest.fn().mockImplementation(() => Promise.resolve({}));

        // eslint-disable-next-line @typescript-eslint/camelcase
        window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

        history = createMemoryHistory({ initialEntries: ['/teamName'] });
    });

    describe('Edit Access', function() {

        beforeEach(async () => {
            await act( async () => {
                await wait(async () => {
                    app = renderWithRedux(
                        <Router history={history}>
                            <PeopleMover/>
                        </Router>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);
                });
                const userIconButton = await app.findByTestId('userIcon');
                fireEvent.click(userIconButton);
            });
        });

        it('should open Share Access modal on click of text in dropdown',  async () => {
            await act( async () => {
                fireEvent.click(await app.findByTestId('shareAccess'));
            });
            expect(app.getByText('Invite others to view'));
        });

        it('should close Edit Contributors modal on click of Cancel button', async () => {
            await act( async () => {
                fireEvent.click(await app.findByTestId('shareAccess'));
                const cancelButton = await app.findByText('Cancel');
                fireEvent.click(cancelButton);
            });
            expect(app.queryByText('Edit Contributors')).toBe(null);
        });

        it('should submit invited contributors, current space name, and access token on click of Invite button', async () => {
            await act( async () => {
                fireEvent.click(await app.findByTestId('shareAccess'));

                const usersToInvite = app.getByTestId('inviteEditorsFormEmailTextarea');
                fireEvent.change(usersToInvite, {target: {value: 'some1@email.com,some2@email.com,some3@email.com'}});

                const saveButton = await app.findByText('Invite');
                fireEvent.click(saveButton);
            });
            expect(SpaceClient.inviteUsersToSpace).toHaveBeenCalledWith(TestUtils.space, ['some1@email.com', 'some2@email.com', 'some3@email.com']);
        });

        it('should remove accessToken from cookies and redirect to homepage on click of sign out', async () => {
            const cookies = new Cookies();
            await act( async () => {

                cookies.set('accessToken', 'FAKE_TOKEN');

                expect(cookies.get('accessToken')).toEqual('FAKE_TOKEN');

                fireEvent.click(await app.findByText('Sign Out'));
            });
            expect(cookies.get('accessToken')).toBeUndefined();
            expect(history.location.pathname).toEqual('/');
        });
    });

    describe('Read Only', function() {
        it('should not display Download Report and Share Access when it is in Read Only mode', async () => {
            await act( async () => {
                await wait(async () => {
                    app = renderWithRedux(
                        <Router history={history}>
                            <PeopleMover/>
                        </Router>, undefined, {currentSpace: TestUtils.space, isReadOnly: true} as GlobalStateProps);
                });
                const userIconButton = await app.findByTestId('userIcon');
                fireEvent.click(userIconButton);
            });

            await act( async () => {
                expect(await app.queryByTestId('shareAccess')).toBeNull();
                expect(await app.queryByTestId('download-report')).toBeNull();
            });
        });
    });
});
