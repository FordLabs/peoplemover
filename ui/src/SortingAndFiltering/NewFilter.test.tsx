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
import {renderWithRedux} from '../tests/TestUtils';
import {AvailableActions} from '../Redux/Actions';
import NewFilter from './NewFilter';
import {FilterTypeListings} from './FilterConstants';
import {createStore} from 'redux';
import rootReducer from '../Redux/Reducers';
import {AvailableModals} from '../Modal/AvailableModals';

describe('Filter Dropdown', () => {
    let store: import('redux').Store<import('redux').AnyAction>;

    beforeEach(() => {
        store = createStore(rootReducer, {});
        store.dispatch = jest.fn();
    });

    describe('Add new filter button', () => {
        it('opens the location modal when handling location tags and the add/edit tags button is clicked', async () => {
            const app = renderWithRedux(<NewFilter filterType={FilterTypeListings.Location}/>, store, undefined);
            const dropdownButton = await app.findByTestId(`dropdown_button_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            dropdownButton.click();
            const addLocationButton = await app.findByText('Add/Edit your Product Location');
            addLocationButton.click();
            expect(store.dispatch).toHaveBeenCalledWith({type: AvailableActions.SET_CURRENT_MODAL, modal: AvailableModals.MY_LOCATION_TAGS });
        });
    });

    describe('Listeners', () => {
        it('should show the correct checkbox state for selected filters', async () => {
            store = createStore(rootReducer, {
                allGroupedTagFilterOptions: [
                    { label: 'Location Tags:', options: [
                        {label: 'foo', value: 'foo', selected: true},
                        {label: 'bar', value: 'bar', selected: false},
                    ]},
                    { label: 'Product Tags:', options: []},
                    { label: 'Role Tags:', options: []},
                ],
            });

            const app = renderWithRedux(<NewFilter filterType={FilterTypeListings.Location}/>, store, undefined);
            const dropdownButton = await app.findByTestId(`dropdown_button_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            dropdownButton.click();
            const secondCheckbox = await app.findByLabelText('bar');
            expect(secondCheckbox).not.toBeChecked();
            const firstCheckbox = await app.findByLabelText('foo');
            expect(firstCheckbox).toBeChecked();
        });
    });

    describe('Filter Count', () => {
        it('should show the right number of filters that are selected', async () => {
            store = createStore(rootReducer, {
                allGroupedTagFilterOptions: [
                    {
                        label: 'Location Tags:', options: [
                            {label: 'foo', value: 'foo', selected: true},
                            {label: 'bar', value: 'bar', selected: false},
                            {label: 'goo', value: 'goo', selected: false},
                        ],
                    },
                    {label: 'Product Tags:', options: []},
                    {label: 'Role Tags:', options: []},
                ],
            });
            const app = renderWithRedux(<NewFilter filterType={FilterTypeListings.Location}/>, store, undefined);
            const locationCounter = await app.findByTestId(`filter_count_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            expect(locationCounter).toContainHTML('1');
            const dropdownButton = await app.findByTestId(`dropdown_button_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            dropdownButton.click();
            const secondCheckbox = await app.findByLabelText('bar');
            secondCheckbox.click();
            dropdownButton.click();
            expect(locationCounter).toContainHTML('2');
        });

        it('should show the right number of filters that are selected', async () => {
            store = createStore(rootReducer, {
                allGroupedTagFilterOptions: [
                    {
                        label: 'Location Tags:', options: [
                            {label: 'foo', value: 'foo', selected: false},
                            {label: 'bar', value: 'bar', selected: false},
                            {label: 'goo', value: 'goo', selected: false},
                        ],
                    },
                    {label: 'Product Tags:', options: []},
                    {label: 'Role Tags:', options: []},
                ],
            });
            const app = renderWithRedux(<NewFilter filterType={FilterTypeListings.Location}/>, store, undefined);
            const locationCounter = await app.findByTestId(`filter_count_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            expect(locationCounter).toContainHTML('All');
        });
    });
});
