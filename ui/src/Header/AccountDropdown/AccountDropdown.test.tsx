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
import {renderWithRecoil} from '../../Utils/TestUtils';
import TestData from '../../Utils/TestData';
import React from 'react';
import Cookies from 'universal-cookie';
import {RunConfig} from '../../index';
import AccountDropdown from './AccountDropdown';
import ReportClient from '../../Services/Api/ReportClient';
import {ViewingDateState} from '../../State/ViewingDateState';
import {IsReadOnlyState} from '../../State/IsReadOnlyState';
import {ModalContents, ModalContentsState} from '../../State/ModalContentsState';
import {RecoilObserver} from '../../Utils/RecoilObserver';
import ShareAccessForm from './ShareAccessForm/ShareAccessForm';
import {CurrentSpaceState} from '../../State/CurrentSpaceState';
import {MemoryRouter} from 'react-router-dom';

describe('Account Dropdown', () => {
    beforeEach(async () => {
        window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;
    });

    it('should show current user\'s name', () => {
        renderWithRecoil(<AccountDropdown showAllDropDownOptions={true}/>);

        const expectedCurrentUser = 'USER_ID'
        expect(screen.getByTestId('currentUserMessage')).toHaveTextContent(`Welcome, ${expectedCurrentUser}`)
    });

    describe('Dropdown Options', () => {
        const expectedViewingDate = new Date(2020, 4, 14);
        let modalContent: ModalContents | null;

        beforeEach(async () => {
            ReportClient.getReportsWithNames = jest.fn().mockResolvedValue({});
            modalContent = null;

            renderWithRecoil(
                <MemoryRouter>
                    <RecoilObserver
                        recoilState={ModalContentsState}
                        onChange={(value: ModalContents) => {
                            modalContent = value;
                        }}
                    />
                    <AccountDropdown showAllDropDownOptions={true}/>
                </MemoryRouter>,
                ({set}) => {
                    set(ViewingDateState, expectedViewingDate)
                    set(CurrentSpaceState, TestData.space)
                }
            )
            const userIconButton = await screen.findByTestId('userIcon');
            fireEvent.click(userIconButton);
        });

        describe('Share Access', () => {
            it('should trigger edit contributors modal on "Share Access" click', async () => {
                fireEvent.click(await screen.findByText('Share Access'));
                await waitFor(() => expect(modalContent).toEqual({
                    title: 'Share Access',
                    component: <ShareAccessForm />,
                    hideTitle: true,
                    hideCloseBtn: true,
                    hideBackground: true
                }));
            });
        });

        describe('Download Report', () => {
            it('should trigger a report download on "Download Report" click', async () => {
                fireEvent.click(await screen.findByText('Download Report'));

                expect(ReportClient.getReportsWithNames).toHaveBeenCalledWith(
                    TestData.space.name,
                    TestData.space.uuid,
                    expectedViewingDate
                );
            });
        });

        describe('Sign Out', () => {
            it('should remove accessToken from cookies and redirect to homepage on click of sign out', async () => {
                const cookies = new Cookies();
                cookies.set('accessToken', 'FAKE_TOKEN');
                expect(cookies.get('accessToken')).toEqual('FAKE_TOKEN');

                fireEvent.click(await screen.findByText('Sign Out'));
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
            renderWithRecoil(
                <MemoryRouter>
                    <AccountDropdown showAllDropDownOptions={true}/>
                </MemoryRouter>,
                ({set}) => {
                    set(IsReadOnlyState, true)
                    set(CurrentSpaceState, TestData.space)
                }
            );
        });
        it('should not display Download Report and Share Access when it is in Read Only mode', async () => {
            const userIconButton = await screen.findByTestId('accountDropdownToggle');
            fireEvent.click(userIconButton);

            expect(await screen.queryByTestId('shareAccess')).toBeNull();
            expect(await screen.queryByTestId('downloadReport')).toBeNull();
        });

        it('should focus the first dropdown option when opened', async () => {
            const spaceTileDropdownButton = await screen.findByTestId('accountDropdownToggle');
            spaceTileDropdownButton.click();
            await waitFor(() => expect(screen.getByTestId('sign-out')).toHaveFocus());
        });
    });
});
