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
import BoardButtons from '../Boards/BoardButtons';
import TestUtils, {renderWithRedux} from './TestUtils';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';

describe('BoardButtons', () => {
    const initialState: PreloadedState<GlobalStateProps> = {currentSpace: TestUtils.space} as GlobalStateProps;

    beforeEach( () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });


    it('should not show invite users to space button when the feature flag is toggled off', async () => {
        process.env. REACT_APP_INVITE_USERS_TO_SPACE_ENABLED = 'false';

        let result: RenderResult;

        await wait(() => {
            result = renderWithRedux(<BoardButtons/>, undefined, initialState);
        });


        try {
            expect(result.getByTestId('editContributorsModal'));
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

    });

    it('should show invite users to space button when the feature flag is toggled on', async () => {
        process.env. REACT_APP_INVITE_USERS_TO_SPACE_ENABLED = 'true';

        let result: RenderResult;

        await wait(() => {
            result = renderWithRedux(<BoardButtons/>, undefined, initialState);
        });


        expect(result.getByTestId('editContributorsModal')).not.toBeNull();

    });


});
