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
import {act, RenderResult} from '@testing-library/react';
import Header from './Header';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {RunConfig} from '../index';

describe('Header', () => {
    const initialState: PreloadedState<GlobalStateProps> = {currentSpace: TestUtils.space} as GlobalStateProps;
    let comp: RenderResult;

    beforeEach( async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        comp = await renderWithRedux(<Header/>, undefined, initialState);
    });

    describe('Account Dropdown', () => {
        it('should show username', async () => {
            expect(comp.queryByText('USER_ID')).not.toBeNull();
        });

        it('should not show invite users to space button when the feature flag is toggled off', async () => {
            // eslint-disable-next-line @typescript-eslint/camelcase
            window.runConfig = {invite_users_to_space_enabled: false} as RunConfig;

            act(() => {
                comp.getByTestId('editContributorsModal').click();
            });
            expect(comp.queryByTestId('share-access')).toBeNull();
        });

        it('should show invite users to space button when the feature flag is toggled on', async () => {
            // eslint-disable-next-line @typescript-eslint/camelcase
            window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

            act(() => {
                comp.getByTestId('editContributorsModal').click();
            });
            expect(comp.queryByTestId('share-access')).not.toBeNull();
        });
    });
});
