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

import {act, fireEvent, RenderResult, wait} from '@testing-library/react';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import React from 'react';
import {Router} from 'react-router-dom';
import {createMemoryHistory} from 'history';
import {MemoryHistory} from 'history/createMemoryHistory';
import Cookies from 'universal-cookie';
import {RunConfig} from '../index';
import {GlobalStateProps} from '../Redux/Reducers';
import AccountDropdown from './AccountDropdown';
import configureStore from 'redux-mock-store';
import {AvailableActions} from '../Redux/Actions';
import ReportClient from '../Reports/ReportClient';
import {AvailableModals} from '../Modal/AvailableModals';

jest.mock('axios');

describe('Account Dropdown', () => {
    let app: RenderResult;
    let history: MemoryHistory;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        // eslint-disable-next-line @typescript-eslint/camelcase
        window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

        history = createMemoryHistory({initialEntries: ['/teamName']});
    });

    describe('Dropdown Options', () => {
        let app: RenderResult;
        const mockStore = configureStore([]);
        const expectedCurrentSpace = TestUtils.space;
        const expectedViewingDate = new Date(2020, 4, 14);
        const store = mockStore({
            currentSpace: expectedCurrentSpace,
            viewingDate: expectedViewingDate,
        });

        beforeEach(async () => {
            ReportClient.getReportsWithNames = jest.fn().mockResolvedValue({});

            store.dispatch = jest.fn();
            app = renderWithRedux(
                <Router history={history}>
                    <AccountDropdown/>
                </Router>,
                store,
            );
            const userIconButton = await app.findByTestId('userIcon');
            fireEvent.click(userIconButton);
        });

        describe('Share Access', () => {
            it('should trigger edit contributors modal on "Share Access" click', async () => {
                await act(async () => {
                    fireEvent.click(await app.findByText('Share Access'));
                });
                expect(store.dispatch).toHaveBeenCalledWith({
                    type: AvailableActions.SET_CURRENT_MODAL,
                    modal: AvailableModals.SHARE_SPACE_ACCESS,
                    item: undefined,
                });
            });
        });

        describe('Download Report', () => {
            it('should trigger a report download on "Download Report" click', async () => {
                await act(async () => {
                    fireEvent.click(await app.findByText('Download Report'));
                });
                expect(ReportClient.getReportsWithNames).toHaveBeenCalledWith(
                    expectedCurrentSpace.name,
                    expectedCurrentSpace.uuid,
                    expectedViewingDate
                );
            });
        });

        describe('Sign Out', () => {
            it('should remove accessToken from cookies and redirect to homepage on click of sign out', async () => {
                const cookies = new Cookies();
                await act(async () => {
                    cookies.set('accessToken', 'FAKE_TOKEN');

                    expect(cookies.get('accessToken')).toEqual('FAKE_TOKEN');

                    fireEvent.click(await app.findByText('Sign Out'));
                });
                expect(cookies.get('accessToken')).toBeUndefined();
                expect(history.location.pathname).toEqual('/');
            });
        });

        it('should focus the first dropdown option when opened', async () => {
            await wait(() => expect(app.getByTestId('shareAccess')).toHaveFocus());
        });
    });

    describe('Read Only', function() {
        beforeEach(async () => {
            await wait(async () => {
                app = renderWithRedux(
                    <Router history={history}>
                        <AccountDropdown/>
                    </Router>,
                    undefined,
                    {currentSpace: TestUtils.space, isReadOnly: true} as GlobalStateProps
                );
            });
        });
        it('should not display Download Report and Share Access when it is in Read Only mode', async () => {
            await act(async () => {
                const userIconButton = await app.findByTestId('accountDropdownToggle');
                fireEvent.click(userIconButton);
            });

            await act(async () => {
                expect(await app.queryByTestId('shareAccess')).toBeNull();
                expect(await app.queryByTestId('downloadReport')).toBeNull();
            });
        });

        it('should focus the first dropdown option when opened', async () => {
            const spaceTileDropdownButton = await app.findByTestId('accountDropdownToggle');
            spaceTileDropdownButton.click();
            await wait(() => expect(app.getByTestId('sign-out')).toHaveFocus());
        });
    });
});
