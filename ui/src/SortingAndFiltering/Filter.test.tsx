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
import {renderWithRecoil} from '../Utils/TestUtils';
import {screen, waitFor} from '@testing-library/react';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import {ModalContents, ModalContentsState} from '../State/ModalContentsState';
import {RecoilObserver} from '../Utils/RecoilObserver';
import {FilterOption} from '../CommonTypes/Option';
import Filter from './Filter';

let actualModalContent: ModalContents | null;
const expectedModalContents: ModalContents = {
    title: 'Test',
    component: <div>hi</div>
};
let mockOnSelect = jest.fn();
const expectedLabel = 'My Test Label';

describe('Filter Dropdown', () => {
    beforeEach(() => {
        actualModalContent = null;
        mockOnSelect = jest.fn();
    });

    describe('When no filters are selected', () => {
        beforeEach(() => {
            renderFilter([
                {label: 'foo', value: 'foo', selected: false},
                {label: 'bar', value: 'bar', selected: false},
                {label: 'hi', value: 'hi', selected: false},
            ]);
        })

        it('should show "All" as the filter count', () => {
            expect(getFilterCount()).toContainHTML('All');
        });

        it('should NOT show the x that clears the selected filters', async () => {
            expect(screen.queryByTestId(`clearSelectedFilter_my_test_label`)).toBeNull();
        });

        it('should show all options, but none should be checked', () => {
            getDropdownButton().click();
            const barCheckbox = screen.getByLabelText('bar');
            expect(barCheckbox).not.toBeChecked();
            const fooCheckbox = screen.getByLabelText('foo');
            expect(fooCheckbox).not.toBeChecked();
            const hiCheckbox = screen.getByLabelText('hi');
            expect(hiCheckbox).not.toBeChecked();
        });
    });

    describe('When filters are selected', () => {
        beforeEach(() => {
            renderFilter([
                {label: 'foo', value: 'foo', selected: true},
                {label: 'bar', value: 'bar', selected: true},
                {label: 'hi', value: 'hi', selected: false},
            ]);
        })

        it('should show "2" as the filter count', () => {
            expect(getFilterCount()).toContainHTML('2');
        });

        it('should show the x that clears the selected filters', async () => {
            expect(getClearFilterButton()).toBeDefined();
        });

        it('should emit event to clear selected filters when x is clicked', async () => {
            getClearFilterButton().click();
            expect(mockOnSelect).toHaveBeenCalledWith([
                {label: 'foo', value: 'foo', selected: false},
                {label: 'bar', value: 'bar', selected: false},
                {label: 'hi', value: 'hi', selected: false},
            ])
        });

        it('should show all options, with selected options checked', () => {
            getDropdownButton().click();
            const barCheckbox = screen.getByLabelText('bar');
            expect(barCheckbox).toBeChecked();
            const fooCheckbox = screen.getByLabelText('foo');
            expect(fooCheckbox).toBeChecked();
            const hiCheckbox = screen.getByLabelText('hi');
            expect(hiCheckbox).not.toBeChecked();
        });
    });

    describe('Check/Uncheck filter options', () => {
        beforeEach(() => {
            renderFilter([
                {label: 'foo', value: 'foo', selected: true},
                {label: 'bar', value: 'bar', selected: false},
            ]);
        })

        it('should emit event when user unchecks a filter', () => {
            getDropdownButton().click();
            screen.getByText('foo').click();
            expect(mockOnSelect).toHaveBeenCalledWith([
                {label: 'foo', value: 'foo', selected: false},
                {label: 'bar', value: 'bar', selected: false},
            ])
        });

        it('should emit event when user checks a filter', () => {
            getDropdownButton().click();
            screen.getByText('bar').click();
            expect(mockOnSelect).toHaveBeenCalledWith([
                {label: 'foo', value: 'foo', selected: true},
                {label: 'bar', value: 'bar', selected: true},
            ])
        });
    });

    describe('Add/Edit new filters button', () => {
        const addEditButtonText = `Add/Edit your ${expectedLabel}`;

        it('should show "Add/Edit" button in dropdown and which should open modal on click', async () => {
            renderFilter()
            getDropdownButton().click();
            const openModalButton = screen.getByText(addEditButtonText);
            openModalButton.click();
            await waitFor(() => expect(actualModalContent).toEqual(expectedModalContents));
        });

        it('should not display the add/edit new filters button when in read only mode', () => {
            renderFilter(undefined,true);
            getDropdownButton().click();
            expect(screen.queryByText(addEditButtonText)).toBeNull();
        });
    });
});

const _defaultValues: FilterOption[] = [
    {label: 'foo', value: 'foo', selected: true},
    {label: 'bar', value: 'bar', selected: false},
]

function renderFilter(defaultValues: FilterOption[] = _defaultValues, isReadOnly = false) {
    renderWithRecoil(
        <>
            <RecoilObserver
                recoilState={ModalContentsState}
                onChange={(value: ModalContents) => {
                    actualModalContent = value;
                }}
            />
            <Filter
                label={expectedLabel}
                defaultValues={defaultValues}
                onSelect={mockOnSelect}
                modalContents={expectedModalContents}/>,
        </>,
        ({set}) => {
            set(IsReadOnlyState, isReadOnly)
        }
    )
}

function getDropdownButton() {
    return screen.getByTestId('dropdownButton_my_test_label');
}

function getFilterCount() {
    return screen.getByTestId(`filterCount_my_test_label`);
}

function getClearFilterButton() {
    return screen.getByTestId(`clearSelectedFilter_my_test_label`)
}