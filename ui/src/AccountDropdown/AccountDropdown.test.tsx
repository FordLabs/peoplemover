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

import {act, fireEvent, waitFor, screen} from '@testing-library/react';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import Cookies from 'universal-cookie';
import {RunConfig} from '../index';
import AccountDropdown from './AccountDropdown';
import configureStore from 'redux-mock-store';
import {AvailableActions} from '../Redux/Actions';
import ReportClient from '../Reports/ReportClient';
import {AvailableModals} from '../Modal/AvailableModals';

describe('Account Dropdown', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;
    });

    describe('Dropdown Options', () => {
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
            renderWithRedux(
                <MemoryRouter initialEntries={['/teamName']}>
                    <AccountDropdown showAllDropDownOptions={true}/>
                </MemoryRouter>,
                store,
            );
            const userIconButton = await screen.findByTestId('userIcon');
            fireEvent.click(userIconButton);
        });

        describe('Share Access', () => {
            it('should trigger edit contributors modal on "Share Access" click', async () => {
                await act(async () => {
                    fireEvent.click(await screen.findByText('Share Access'));
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
                    fireEvent.click(await screen.findByText('Download Report'));
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

                    fireEvent.click(await screen.findByText('Sign Out'));
                });
                expect(cookies.get('accessToken')).toBeUndefined();
                expect(window.location.pathname).toEqual('/');
            });
        });

        it('should focus the first dropdown option when opened', async () => {
            await waitFor(() => expect(screen.getByTestId('shareAccess')).toHaveFocus());
        });
    });

    describe('Read Only', function() {
        beforeEach(async () => {
            await waitFor(async () => {
                renderWithRedux(
                    <MemoryRouter initialEntries={['/teamName']}>
                        <AccountDropdown showAllDropDownOptions={true}/>
                    </MemoryRouter>,
                    undefined,
                    {currentSpace: TestUtils.space, isReadOnly: true}
                );
            });
        });
        it('should not display Download Report and Share Access when it is in Read Only mode', async () => {
            await act(async () => {
                const userIconButton = await screen.findByTestId('accountDropdownToggle');
                fireEvent.click(userIconButton);
            });

            await act(async () => {
                expect(await screen.queryByTestId('shareAccess')).toBeNull();
                expect(await screen.queryByTestId('downloadReport')).toBeNull();
            });
        });

        it('should focus the first dropdown option when opened', async () => {
            const spaceTileDropdownButton = await screen.findByTestId('accountDropdownToggle');
            spaceTileDropdownButton.click();
            await waitFor(() => expect(screen.getByTestId('sign-out')).toHaveFocus());
        });
    });
});
