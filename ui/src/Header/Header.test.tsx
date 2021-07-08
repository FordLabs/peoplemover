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

import React from 'react';
import {act, fireEvent, RenderResult, wait} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';
import Header from './Header';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {RunConfig} from '../index';
import {BrowserRouter as Router} from 'react-router-dom';
import Flagsmith from 'flagsmith';

jest.mock('Flagsmith');
const debounceTimeToWait = 100;
expect.extend(toHaveNoViolations);

describe('Header', () => {
    const initialState: PreloadedState<GlobalStateProps> = {currentSpace: TestUtils.space, currentUser: 'bob' } as GlobalStateProps;

    let app: RenderResult;
    let originalWindow: Window;

    beforeEach(async () => {
        originalWindow = window;
        delete window.location;
        (window as Window) = Object.create(window);
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    afterEach(() => {
        (window as Window) = originalWindow;
    });

    it('should have no axe violations', async () => {
        window.location = {origin: 'https://localhost', pathname: '/user/dashboard'} as Location;
        const app = await renderWithRedux(<Router><Header/></Router>, undefined, initialState);
        const results = await axe(app.container);
        expect(results).toHaveNoViolations();
    });

    it('should hide space buttons', async () => {
        window.location = {origin: 'https://localhost', pathname: '/user/dashboard'} as Location;
        app = renderWithRedux(
            <Router>
                <Header hideSpaceButtons={true}/>
            </Router>, undefined, initialState
        );
        expect(app.queryByTestId('filters')).toBeFalsy();
        expect(app.queryByTestId('sortBy')).toBeFalsy();

        const userIconButton = await app.findByTestId('accountDropdownToggle');
        await wait(() => {
            fireEvent.click(userIconButton);
        });
        expect(await app.queryByTestId('shareAccess')).toBeNull();
        expect(await app.queryByTestId('downloadReport')).toBeNull();
    });

    it('should not show the account dropdown when user is on the error page', () => {
        window.location = {origin: 'https://localhost', pathname: '/error/404'} as Location;
        app = renderWithRedux(
            <Router>
                <Header hideSpaceButtons={true}/>
            </Router>, undefined, initialState
        );

        expect(app.queryByText('bob')).toBeNull();
    });

    describe('Account Dropdown', () => {
        let app: RenderResult;
        beforeEach(async () => {
            jest.useFakeTimers();
            Flagsmith.hasFeature = jest.fn().mockReturnValue(true);
            window.location = {origin: 'https://localhost', pathname: '/aaaaaaaaaaaaaa'} as Location;
            app = await renderWithRedux(<Router><Header/></Router>, undefined, initialState);
        });

        it('should show username', async () => {
            expect(app.queryByText('USER_ID')).not.toBeNull();
        });

        it('should show time On Product Link when user is in a space', async () => {
            expect(await app.getByText('Time On Product >'));
        });

        it('should show Back to Space Link when user is in time on product page', async () => {
            fireEvent.click( await app.getByText('Time On Product >'));
            expect(await app.getByText('< Back'));
        });

        it('should not show invite users to space button when the feature flag is toggled off', async () => {
            // eslint-disable-next-line @typescript-eslint/camelcase
            window.runConfig = {invite_users_to_space_enabled: false} as RunConfig;

            act(() => {
                app.getByTestId('accountDropdownToggle').click();
                jest.advanceTimersByTime(debounceTimeToWait);
            });
            expect(app.queryByTestId('shareAccess')).toBeNull();
        });

        it('should show invite users to space button when the feature flag is toggled on', async () => {
            // eslint-disable-next-line @typescript-eslint/camelcase
            window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

            act(() => {
                app.getByTestId('accountDropdownToggle').click();
                jest.advanceTimersByTime(debounceTimeToWait);
            });
            expect(app.queryByTestId('shareAccess')).not.toBeNull();
        });
    });
});
