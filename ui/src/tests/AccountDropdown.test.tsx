/*
 * Copyright (c) 2019 Ford Motor Company
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
import TestUtils, {renderWithRedux} from './TestUtils';
import PeopleMover from '../Application/PeopleMover';
import React from 'react';
import {Router} from 'react-router-dom';
import {createMemoryHistory} from 'history';
import {MemoryHistory} from 'history/createMemoryHistory';
import SpaceClient from '../SpaceDashboard/SpaceClient';
import Cookies from 'universal-cookie';
import {RunConfig} from "../index";

describe('Account Dropdown',  () => {
    let app: RenderResult;

    let history: MemoryHistory;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

        history = createMemoryHistory({ initialEntries: ['/teamName'] });
        await act( async () => {
            await wait(async () => {
                app = renderWithRedux(
                    <Router history={history}>
                        <PeopleMover/>
                    </Router>
                );
            });
            const userIconButton = await app.findByTestId('userIcon');
            fireEvent.click(userIconButton);
        });
    });

    it('Should open Edit Contributors modal on click of text in dropdown',  async () => {
        await act( async () => {
            fireEvent.click(await app.findByText('Invite Members'));
        });
        expect(app.getByText('Edit Contributors'));
    });

    it('should close Edit Contributors modal on click of Cancel button', async () => {
        await act( async () => {
            fireEvent.click(await app.findByText('Invite Members'));
            const cancelButton = await app.findByText('Cancel');
            fireEvent.click(cancelButton);
        });
        expect(app.queryByText('Edit Contributors')).toBe(null);
    });

    it('should submit invited contributors, current space name, and access token on click of Save button', async () => {
        await act( async () => {
            fireEvent.click(await app.findByText('Invite Members'));
            SpaceClient.inviteUsersToSpace = jest.fn().mockImplementation(() => Promise.resolve({}));

            const usersToInvite = app.getByTestId('emailTextArea');
            fireEvent.change(usersToInvite, {target: {value: 'some1@email.com,some2@email.com,some3@email.com'}});

            const saveButton = await app.findByText('Save');
            fireEvent.click(saveButton);
        });
        expect(SpaceClient.inviteUsersToSpace).toHaveBeenCalledWith('teamName', ['some1@email.com', 'some2@email.com', 'some3@email.com']);
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
