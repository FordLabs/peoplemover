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

import React from 'react';
import {act, fireEvent, RenderResult, wait} from '@testing-library/react';
import Header from './Header';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {RunConfig} from '../index';

describe('Header', () => {
    const initialState: PreloadedState<GlobalStateProps> = {currentSpace: TestUtils.space} as GlobalStateProps;
    let app: RenderResult;

    beforeEach( async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    it('should hide space buttons', async () => {
        app = renderWithRedux(
            <Header hideSpaceButtons={true}/>, undefined, initialState
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

    describe('Account Dropdown', () => {
        let app: RenderResult;
        beforeEach(async () => {
            app = await renderWithRedux(<Header/>, undefined, initialState);
        });

        it('should show username', async () => {
            expect(app.queryByText('USER_ID')).not.toBeNull();
        });

        it('should not show invite users to space button when the feature flag is toggled off', async () => {
            // eslint-disable-next-line @typescript-eslint/camelcase
            window.runConfig = {invite_users_to_space_enabled: false} as RunConfig;

            act(() => {
                app.getByTestId('accountDropdownToggle').click();
            });
            expect(app.queryByTestId('shareAccess')).toBeNull();
        });

        it('should show invite users to space button when the feature flag is toggled on', async () => {
            // eslint-disable-next-line @typescript-eslint/camelcase
            window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

            act(() => {
                app.getByTestId('accountDropdownToggle').click();
            });
            expect(app.queryByTestId('shareAccess')).not.toBeNull();
        });
    });
});
