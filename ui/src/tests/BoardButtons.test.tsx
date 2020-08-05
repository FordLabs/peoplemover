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

import React from 'react';
import {RenderResult, wait} from '@testing-library/react';
import SpaceButtons from '../Header/SpaceButtons';
import TestUtils, {renderWithRedux} from './TestUtils';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {RunConfig} from "../index";

describe('SpaceButtons', () => {
    const initialState: PreloadedState<GlobalStateProps> = {currentSpace: TestUtils.space} as GlobalStateProps;

    beforeEach( () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });


    it('should not show invite users to space button when the feature flag is toggled off', async () => {
        window.runConfig = {invite_users_to_space_enabled: false} as RunConfig;

        let result: RenderResult;

        await wait(() => {
            result = renderWithRedux(<SpaceButtons/>, undefined, initialState);
        });

        result.getByTestId('editContributorsModal').click();

        try {
            expect(result.getByTestId('invite-members'));
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

    });

    it('should show invite users to space button when the feature flag is toggled on', async () => {
        window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

        let result: RenderResult;

        await wait(() => {
            result = renderWithRedux(<SpaceButtons/>, undefined, initialState);
        });

        result.getByTestId('editContributorsModal').click();

        expect(result.getByTestId('invite-members')).not.toBeNull();
    });


});
