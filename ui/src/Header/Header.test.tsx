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

import React from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import Header from './Header';
import TestUtils, {renderWithRecoil} from '../Utils/TestUtils';
import {RunConfig} from '../index';
import {MemoryRouter} from 'react-router-dom';
import flagsmith from 'flagsmith';
import {CurrentSpaceState} from '../State/CurrentSpaceState';
import TestData from '../Utils/TestData';

const debounceTimeToWait = 100;

describe('Header', () => {
    let location: (string | Location) & Location;

    beforeEach(() => {
        location = window.location;
        Reflect.deleteProperty(window, 'location');

        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    afterEach(() => {
        window.location = location;
    });

    it('should have no axe violations', async () => {
        window.location = {origin: 'https://localhost', pathname: '/user/dashboard'} as Location;
        const {container} = renderWithRecoil(
            <MemoryRouter>
                <Header/>
            </MemoryRouter>,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should hide space buttons', async () => {
        window.location = {origin: 'https://localhost', pathname: '/user/dashboard'} as Location;
        renderWithRecoil(
            <MemoryRouter>
                <Header hideSpaceButtons={true}/>
            </MemoryRouter>,
        );
        expect(screen.queryByTestId('filters')).toBeFalsy();
        expect(screen.queryByTestId('sortBy')).toBeFalsy();

        const userIconButton = await screen.findByTestId('accountDropdownToggle');
        fireEvent.click(userIconButton);

        await waitFor(() => expect(screen.queryByTestId('shareAccess')).toBeNull());
        expect(screen.queryByTestId('downloadReport')).toBeNull();
    });

    it('should not show the account dropdown when user is on the error page', () => {
        window.location = {origin: 'https://localhost', pathname: '/error/404'} as Location;
        renderWithRecoil(
            <MemoryRouter>
                <Header hideSpaceButtons={true}/>
            </MemoryRouter>,
        );

        expect(screen.queryByText('bob')).toBeNull();
    });

    describe('Account Dropdown', () => {

        beforeEach(async () => {
            jest.useFakeTimers();
            flagsmith.hasFeature = jest.fn().mockReturnValue(true);
            window.location = {origin: 'https://localhost', pathname: '/aaaaaaaaaaaaaa'} as Location;

            renderWithRecoil(
                <MemoryRouter>
                    <Header/>
                </MemoryRouter>,
                ({set}) => {
                    set(CurrentSpaceState, TestData.space)
                }
            );

            await screen.findByTestId('accountDropdownToggle');
        });

        it('should show username', async () => {
            expect(screen.queryByText('USER_ID')).not.toBeNull();
        });

        it('should show time On Product Link when user is in a space', async () => {
            expect(screen.getByText('Time On Product >'));
        });

        it('should show Back to Space Link when user is in time on product page', async () => {
            fireEvent.click(screen.getByText('Time On Product >'));
            expect(screen.getByText('< Back'));
        });

        it('should not show invite users to space button when the feature flag is toggled off', async () => {
            window.runConfig = {invite_users_to_space_enabled: false} as RunConfig;
            
            screen.getByTestId('accountDropdownToggle').click();
            jest.advanceTimersByTime(debounceTimeToWait);

            expect(screen.queryByTestId('shareAccess')).toBeNull();
        });

        it('should show invite users to space button when the feature flag is toggled on', async () => {
            window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

            screen.getByTestId('accountDropdownToggle').click();
            jest.advanceTimersByTime(debounceTimeToWait);

            expect(await screen.findByTestId('shareAccess')).toBeDefined();
        });
    });
});
