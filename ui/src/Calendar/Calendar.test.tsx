/*
 * Copyright (c) 2022 Ford Motor Company
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

import TestUtils, {mockCreateRange, renderWithRedux} from '../Utils/TestUtils';
import React from 'react';
import {fireEvent, queryByText, screen, waitFor} from '@testing-library/react';
import Calendar from './Calendar';
import configureStore from 'redux-mock-store';
import {RecoilRoot} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {IsReadOnlyState} from '../State/IsReadOnlyState';

describe('Calendar', () => {
    let resetCreateRange: () => void;

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        resetCreateRange = mockCreateRange();
    });

    afterEach(() => {
        resetCreateRange();
    });

    it('should have Viewing label and calendar icon',  () => {
        setupCalenderComponent()
        screen.getByText(/viewing:/i);
        screen.getByText(/calendar_today/i);
    });

    it('should display current date on initial load', async () => {
        setupCalenderComponent()
        const dateViewElement = getCalendarToggleButton();
        expect(dateViewElement.innerHTML).toContain('Nov 14, 2020');
    });

    it('should have down caret when closed and up arrow when open', async () => {
        setupCalenderComponent()
        const datePickerOpener = getCalendarToggleButton();

        await screen.findByTestId('calendar_down-arrow');

        fireEvent.click(datePickerOpener);
        await screen.findByTestId('calendar_up-arrow');
        fireEvent.click(datePickerOpener);

        const calendar = await screen.findByTestId('calendar');
        await waitFor(() => expect(queryByText(calendar, 'May')).not.toBeInTheDocument());
    });

    it('should show month and year in the header when opened', async () => {
        setupCalenderComponent()
        await screen.findByTestId('calendar_down-arrow');
        fireEvent.click(getCalendarToggleButton());

        await screen.findByText('November 2020');
    });

    it('should calendar toggle should be disabled when in read only mode', () => {
        setupCalenderComponent(true)
        expect(getCalendarToggleButton()).toBeDisabled();
    });
});

function setupCalenderComponent(isReadOnly = false) {
    const mockStore = configureStore([]);
    const reduxStore = mockStore({
        currentSpace: TestUtils.space,
    });

    renderWithRedux(
        <RecoilRoot initializeState={({set}) => {
            set(ViewingDateState, new Date(2020, 10, 14))
            set(IsReadOnlyState, isReadOnly)
        }}>
            <Calendar/>
        </RecoilRoot>,
        reduxStore
    )
}

function getCalendarToggleButton() {
    return screen.getByTestId('calendarToggle')
}
