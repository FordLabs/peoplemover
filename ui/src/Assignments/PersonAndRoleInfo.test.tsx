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
import {Assignment} from './Assignment';

describe('PersonAndRoleInfo component for TimeOnProduct', () => {

    it('should show a one day time on product on hover on timer icon and is not viewOnly', async () => {
        let store = createStore(rootReducer, {currentSpace:TestUtils.space, isReadOnly:false});
        store.dispatch = jest.fn();
        const testAssignment: Assignment = {
            id: 1,
            productId: 1,
            placeholder: false,
            person: TestUtils.hank,
            spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            effectiveDate: new Date(2020, 6, 1),
            startDate: new Date(2020, 0, 1),
            endDate: new Date(2020, 0, 1),
        };
        let app = renderWithRedux(<PersonAndRoleInfo
            assignment={testAssignment}
            isUnassignedProduct={false}/>, store);

        const icons = await app.container.getElementsByClassName('hoverableIcon');
        expect(icons.length).toEqual(3);

        await fireEvent.mouseOver(icons[2]);

        expect(app.getByText('Time on Product:')).toBeVisible();
        expect(app.getByText('1/1/20 - 1/1/20 (1 day)')).toBeVisible();
    });

    it('should show seven days time on product on hover on timer icon and is not viewOnly', async () => {
        let store = createStore(rootReducer, {currentSpace:TestUtils.space, isReadOnly:false});
        store.dispatch = jest.fn();
        const testAssignment: Assignment = {
            id: 1,
            productId: 1,
            placeholder: false,
            person: TestUtils.hank,
            spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            effectiveDate: new Date(2020, 6, 1),
            startDate: new Date(2020, 0, 1),
            endDate: new Date(2020, 0, 7),
        };
        let app = renderWithRedux(<PersonAndRoleInfo
            assignment={testAssignment}
            isUnassignedProduct={false}/>, store);

        const icons = await app.container.getElementsByClassName('hoverableIcon');
        expect(icons.length).toEqual(3);

        await fireEvent.mouseOver(icons[2]);

        expect(app.getByText('Time on Product:')).toBeVisible();
        expect(app.getByText('1/1/20 - 1/7/20 (7 days)')).toBeVisible();
    });

    it('should show no icons when in viewOnly', async () => {
        let store = createStore(rootReducer, {currentSpace:TestUtils.space, isReadOnly:true});
        store.dispatch = jest.fn();
        let app = renderWithRedux(<PersonAndRoleInfo
            assignment={TestUtils.assignmentForHank}
            isUnassignedProduct={false}/>, store);

        const icons = await app.container.getElementsByClassName('hoverableIcon');
        expect(icons.length).toEqual(0);
    });

});
