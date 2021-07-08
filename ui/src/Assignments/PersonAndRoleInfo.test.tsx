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
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import PersonAndRoleInfo from './PersonAndRoleInfo';
import {fireEvent} from '@testing-library/react';
import {createStore} from 'redux';
import rootReducer from '../Redux/Reducers';
import {setCurrentModalAction} from '../Redux/Actions';
import {AvailableModals} from '../Modal/AvailableModals';

describe('PersonAndRoleInfo component for TimeOnProduct', () => {

    it('should show number of days on project when timeOnProject is pass', async () => {
        let store = createStore(rootReducer, {});
        store.dispatch = jest.fn();
        let app = renderWithRedux(<PersonAndRoleInfo
            assignment={TestUtils.assignmentForHank}
            isUnassignedProduct={false}
            isReadOnly={true}
            timeOnProduct={55}/>, store);

        const editPersonLink = app.getByText('55 days');
        expect(await editPersonLink).toBeVisible();

        await fireEvent.click(editPersonLink);

        expect(store.dispatch).toHaveBeenCalledWith(
            setCurrentModalAction({
                modal: AvailableModals.EDIT_PERSON,
                item: TestUtils.assignmentForHank,
            }));
    });
});
