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

describe('Calendar', () => {
    let resetCreateRange: () => void;

    const initialState: PreloadedState<GlobalStateProps> = {
        viewingDate: new Date(2019, 4, 14),
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
        await app.findByText('Viewing: May 14, 2019');
        expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(TestUtils.space.id, initialState.viewingDate);
    });

    it('should display chosen date when manually selected', async () => {
        const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
        const datePickerOpener = await app.findByText('Viewing: May 14, 2019');
        expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(TestUtils.space.id, initialState.viewingDate);
        fireEvent.click(datePickerOpener);

        const calendar = await app.findByTestId('calendar');
        const daySeventeen = await findByText(calendar, '17');
        fireEvent.click(daySeventeen);

        await app.findByText('Viewing: May 17, 2019');
        expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(TestUtils.space.id, new Date('2019-05-17T04:00:00.000Z'));
    });

    it('should have down caret when closed and up arrow when open', async () => {
        const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
        const datePickerOpener = await app.findByText('Viewing: May 14, 2019');

        await app.findByTestId('calendar-fa-caret-down');

        fireEvent.click(datePickerOpener);
        await app.findByTestId('calendar-fa-caret-up');
    });

    it('should close calendar popout when clicking calendar input label again', async () => {
        const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
        const datePickerOpener = await app.findByText('Viewing: May 14, 2019');

        fireEvent.click(datePickerOpener);
        fireEvent.click(datePickerOpener);

        const calendar = await app.findByTestId('calendar');
        await wait(() => {
            expect(queryByText(calendar, 'May')).not.toBeInTheDocument();
        });
    });
});