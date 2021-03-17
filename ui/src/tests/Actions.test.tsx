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

import {AvailableActions, setupSpaceAction} from '../Redux/Actions';
import configureStore from 'redux-mock-store';
import TestUtils from './TestUtils';
import thunk from 'redux-thunk';
import * as filterConstants from '../SortingAndFiltering/FilterConstants';

describe('Actions', () => {
    const mockStore = configureStore([thunk]);
    const store = mockStore({
        currentSpace: TestUtils.space,
        viewingDate: new Date(2020, 4, 14),
    });

    describe('setupSpaceAction', () => {
        it('should update the current space and filters', () => {
            const mock = jest.spyOn(filterConstants, 'getFilterOptionsForSpace');  // spy on otherFn
            mock.mockReturnValueOnce(Promise.resolve(TestUtils.allGroupedTagFilterOptions));  // mock the return value

            const expectedActions = [
                {type: AvailableActions.SET_CURRENT_SPACE, space: TestUtils.space },
                {type: AvailableActions.SET_ALL_FILTER_OPTIONS, allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(setupSpaceAction(TestUtils.space)).then(() => {
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });
});
