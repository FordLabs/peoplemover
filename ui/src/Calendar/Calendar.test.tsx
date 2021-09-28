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

import TestUtils, {mockCreateRange, renderWithRedux} from '../tests/TestUtils';
import React from 'react';
import {fireEvent, queryByText, wait} from '@testing-library/react';
import Calendar from './Calendar';
import configureStore from 'redux-mock-store';

describe('Calendar', () => {
    let resetCreateRange: () => void;

    const mockStore = configureStore([]);
    const store = mockStore({
        viewingDate: new Date(2020, 10, 14),
        currentSpace: TestUtils.space,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        resetCreateRange = mockCreateRange();
    });

    afterEach(() => {
        resetCreateRange();
    });

    it('should have Viewing label and calendar icon',  () => {
        const app = renderWithRedux(<Calendar/>, store);
        app.getByText(/viewing:/i);
        app.getByText(/calendar_today/i);
    });

    it('should display current date on initial load', async () => {
        const app = renderWithRedux(<Calendar/>, store);
        const dateViewElement = await app.findByTestId('calendarToggle');
        expect(dateViewElement.innerHTML).toContain('Nov 14, 2020');
    });

    it('should have down caret when closed and up arrow when open', async () => {
        const app = renderWithRedux(<Calendar/>, store);
        const datePickerOpener = await app.findByTestId('calendarToggle');

        await app.findByTestId('calendar_down-arrow');

        fireEvent.click(datePickerOpener);
        await app.findByTestId('calendar_up-arrow');
        fireEvent.click(datePickerOpener);

        const calendar = await app.findByTestId('calendar');
        await wait(() => {
            expect(queryByText(calendar, 'May')).not.toBeInTheDocument();
        });
    });

    it('should show month and year in the header when opened', async () => {
        const app = renderWithRedux(<Calendar/>, store);
        const datePickerOpener = await app.findByTestId('calendarToggle');

        await app.findByTestId('calendar_down-arrow');
        fireEvent.click(datePickerOpener);

        await app.findByText('November 2020');
    });
});
