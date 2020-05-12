/*
 *
 *  * Copyright (c) 2019 Ford Motor Company
 *  * All rights reserved.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  * http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import currentSpaceReducer from '../Redux/Reducers/currentSpaceReducer';
import {AvailableActions} from '../Redux/Actions';
import TestUtils from './TestUtils';
import {Space} from "../SpaceDashboard/Space";
import {Board} from "../Boards/Board";

describe('current space reducer', () => {
    const board1: Board = { id: 1, name: 'Board One', products: TestUtils.products, spaceId: 1 };
    const board2: Board = { id: 2, name: 'Board Two', products: TestUtils.productsForBoard2, spaceId: 1 };

    const space: Space = {
        id: 1,
        name: 'Space One',
        boards: [board1, board2],
        roles: [],
        locations: [],
        lastModifiedDate: '2019-01-01',
    };

    it('should set current space given space', function () {
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