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

import currentSpaceReducer from '../Redux/Reducers/currentSpaceReducer';
import {AvailableActions} from '../Redux/Actions';
import {Space} from '../Space/Space';

describe('current space reducer', () => {
    const space: Space = {
        id: 1,
        name: 'Space One',
        roles: [],
        locations: [],
        lastModifiedDate: '2019-01-01',
        todayViewIsPublic: false,
    };

    it('should set current space given space', function() {
        const actualSpace = currentSpaceReducer(
            {} as Space,
            {
                type: AvailableActions.SET_CURRENT_SPACE,
                space: space,
            },
        );

        expect(actualSpace).toBe(space);
    });

});
