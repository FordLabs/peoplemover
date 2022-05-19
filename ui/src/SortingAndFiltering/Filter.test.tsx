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

import React from 'react';
import {renderWithRedux} from '../Utils/TestUtils';
import {AvailableActions} from '../Redux/Actions';
import Filter from './Filter';
import {FilterType, FilterTypeListings} from './FilterLibraries';
import {createStore, Store} from 'redux';
import rootReducer from '../Redux/Reducers';
import {AvailableModals} from '../Modal/AvailableModals';
import {RenderResult} from '@testing-library/react';
import {RecoilRoot} from 'recoil';
import {IsReadOnlyState} from '../State/IsReadOnlyState';

describe('Filter Dropdown', () => {
    let store: import('redux').Store<import('redux').AnyAction>;

    beforeEach(() => {
        store = createStore(rootReducer, {});
        store.dispatch = jest.fn();
    });

    describe('Add new filter button', () => {
        it('opens the location modal when handling location tags and the add/edit tags button is clicked', async () => {
            const app = renderFilter(FilterTypeListings.Location, store);
            const dropdownButton = await app.findByTestId(`dropdown_button_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            dropdownButton.click();
            const addLocationButton = await app.findByText('Add/Edit your Product Location');
            addLocationButton.click();
            expect(store.dispatch).toHaveBeenCalledWith({
                type: AvailableActions.SET_CURRENT_MODAL,
                modal: AvailableModals.MY_LOCATION_TAGS,
            });
        });
    });

    describe('Read-only', () => {
        it('should not display the add new filter button', async () => {
            const app = renderFilter(FilterTypeListings.Location, store, true);
            const locationFilterTestId = FilterTypeListings.Location.label.replace(' ', '_');
            const dropdownButton = await app.findByTestId(`dropdown_button_${locationFilterTestId}`);
            dropdownButton.click();
            expect(app.queryByTestId(`open_${locationFilterTestId}_modal_button`)).toBeNull();
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
                    { label: 'Person Tags:', options: []},
                ],
            });

            const app = renderFilter(FilterTypeListings.Location, store);
            const dropdownButton = await app.findByTestId(`dropdown_button_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            dropdownButton.click();
            const secondCheckbox = await app.findByLabelText('bar');
            expect(secondCheckbox).not.toBeChecked();
            const firstCheckbox = await app.findByLabelText('foo');
            expect(firstCheckbox).toBeChecked();
        });
    });

    describe('Filter Count', () => {
        let appLocation: RenderResult;
        let appRole: RenderResult;

        beforeEach(() => {
            store = createStore(rootReducer, {
                allGroupedTagFilterOptions: [
                    {
                        label: 'Location Tags:', options: [
                            {label: 'foo', value: 'foo', selected: true},
                            {label: 'bar', value: 'bar', selected: true},
                            {label: 'goo', value: 'goo', selected: false},
                        ],
                    },
                    {
                        label: 'Product Tags:', options: [
                            {label: 'pt1', value: 'pt1', selected: true},
                        ],
                    },
                    {label: 'Role Tags:', options: []},
                    {label: 'Person Tags:', options: []},
                ],
            });
            appLocation = renderFilter(FilterTypeListings.Location, store);
            appRole = renderFilter(FilterTypeListings.Role, store);
        });

        it('should show the right number of filters that are selected', async () => {
            const locationCounter = await appLocation.findByTestId(`filter_count_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            expect(locationCounter).toContainHTML('2');
            const dropdownButton = await appLocation.findByTestId(`dropdown_button_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            dropdownButton.click();
            const thirdCheckbox = await appLocation.findByLabelText('goo');
            thirdCheckbox.click();
            dropdownButton.click();
            expect(locationCounter).toContainHTML('3');
        });

        it('should show \'All\' when no filters are selected', async () => {
            const locationCounter = await appRole.findByTestId(`filter_count_${FilterTypeListings.Role.label.replace(' ', '_')}`);
            expect(locationCounter).toContainHTML('All');
        });

        it('should show the clear filter button when there are filters selected', async () => {
            const locationCounter = await appLocation.findByTestId(`filter_count_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            await appLocation.findByTestId(`clear_selected_filter_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            expect(locationCounter).toContainHTML('2');
        });

        it('should clear the selected filters when clicking the clear filter button', async () => {
            const locationCounter = await appLocation.findByTestId(`filter_count_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            const clearSelectedFiltersIcon = await appLocation.findByTestId(`clear_selected_filter_${FilterTypeListings.Location.label.replace(' ', '_')}`);
            expect(locationCounter).toContainHTML('2');
            clearSelectedFiltersIcon.click();
            expect(store.getState().allGroupedTagFilterOptions[0].options.filter((item: { selected: boolean }) => item.selected).length).toEqual(0);
            expect(store.getState().allGroupedTagFilterOptions[1].options.filter((item: { selected: boolean }) => item.selected).length).toEqual(1);
        });

        it('should not show the x to clear the selected filters when there are no filters selected', async () => {
            const locationCounter = await appRole.findByTestId(`filter_count_${FilterTypeListings.Role.label.replace(' ', '_')}`);
            const clearSelectedFiltersIcon = appRole.queryByTestId(`clear_selected_filter_${FilterTypeListings.Role.label.replace(' ', '_')}`);
            expect(locationCounter).toContainHTML('All');
            expect(clearSelectedFiltersIcon).toBeNull();
        });
    });
});

function renderFilter(filterType: FilterType, store: Store, isReadOnly = false) {
    return renderWithRedux(
        <RecoilRoot initializeState={({set}) => {
            set(IsReadOnlyState, isReadOnly)
        }}>
            <Filter filterType={filterType}/>
        </RecoilRoot>,
        store
    )
}
