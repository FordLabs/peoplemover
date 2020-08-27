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

import TestUtils, {mockCreateRange, renderWithRedux} from './TestUtils';
import PeopleMover from '../Application/PeopleMover';
import React from 'react';
import {findByText, fireEvent, queryByText, wait} from '@testing-library/react';
import ProductClient from '../Products/ProductClient';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import AssignmentClient from '../Assignments/AssignmentClient';
import moment from 'moment-timezone';

describe('Calendar', () => {
    let resetCreateRange: () => void;
    const spaceUuid = TestUtils.space.uuid;

    const initialState: PreloadedState<GlobalStateProps> = {
        viewingDate: new Date(2020, 4, 14),
    } as GlobalStateProps;

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        resetCreateRange = mockCreateRange();
    });

    afterEach(() => {
        resetCreateRange();
    });

    it('should display current date on initial load', async () => {
        const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
        await app.findByText('Viewing: May 14, 2020');
        expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(spaceUuid, initialState.viewingDate);
    });

    it('should display highlighted dates when calendar is open', async () => {
        const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
        const datePickerOpener = await app.findByText('Viewing: May 14, 2020');
        expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(spaceUuid, initialState.viewingDate);

        fireEvent.click(datePickerOpener);
        expect(AssignmentClient.getAssignmentEffectiveDates).toHaveBeenCalledWith(spaceUuid);

        const calendar = await app.findByTestId('calendar');
        const dayFifteen = await findByText(calendar, '15');
        expect(dayFifteen).toHaveClass('react-datepicker__day--highlighted');
    });

    it('should display chosen date when manually selected', async () => {
        const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
        const datePickerOpener = await app.findByText('Viewing: May 14, 2020');
        expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(spaceUuid, initialState.viewingDate);
        fireEvent.click(datePickerOpener);

        const calendar = await app.findByTestId('calendar');
        const dayEighteen = await findByText(calendar, '18');
        fireEvent.click(dayEighteen);

        await app.findByText('Viewing: May 18, 2020');

        const localDate = moment.tz('2020-05-18', moment.tz.guess()).toDate();
        expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(spaceUuid, localDate);
    });

    it('should have down caret when closed and up arrow when open', async () => {
        const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
        const datePickerOpener = await app.findByText('Viewing: May 14, 2020');

        await app.findByTestId('calendar-fa-caret-down');

        fireEvent.click(datePickerOpener);
        await app.findByTestId('calendar-fa-caret-up');
        fireEvent.click(datePickerOpener);

        const calendar = await app.findByTestId('calendar');
        await wait(() => {
            expect(queryByText(calendar, 'May')).not.toBeInTheDocument();
        });
    });
});
