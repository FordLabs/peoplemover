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
import {renderWithRecoil} from 'Utils/TestUtils';
import {screen, waitFor} from '@testing-library/react';
import TestData from 'Utils/TestData';
import {LocalStorageFilters} from '../FilterLibraries';
import {ModalContents, ModalContentsState} from 'State/ModalContentsState';
import {RecoilObserver} from 'Utils/RecoilObserver';
import {localStorageEventListenerKey} from 'Hooks/useOnStorageChange/useOnStorageChange';
import MyTagsForm from '../MyTagsForm/MyTagsForm';
import ProductLocationFilter from './ProductLocationFilter';
import {LocationsState} from 'State/LocationsState';

describe('Product Location Filter', () => {
    let modalContent: ModalContents | null;
    const initialFilters: LocalStorageFilters = {
        locationTagFilters: [TestData.detroit.name],
        productTagFilters: [],
        roleTagFilters: [],
        personTagFilters: [],
    };

    beforeEach(() => {
        modalContent = null;
        localStorage.setItem('filters', JSON.stringify(initialFilters));

        renderWithRecoil(
            <>
                <RecoilObserver
                    recoilState={ModalContentsState}
                    onChange={(value: ModalContents) => {
                        modalContent = value;
                    }}
                />
                <ProductLocationFilter />
            </>,
            ({set}) => {
                set(LocationsState, TestData.locations)
            })
    })

    it('should show "Product Location:" label', () => {
        expect(getProductLocationDropdownButton()).toHaveTextContent('Product Location:');
    });

    it('should show only product location saved in local storage as selected', () => {
        getProductLocationDropdownButton().click();
        const annArborCheckbox = screen.getByLabelText(TestData.annarbor.name);
        expect(annArborCheckbox).not.toBeChecked();
        const dearbornCheckbox = screen.getByLabelText(TestData.dearborn.name);
        expect(dearbornCheckbox).not.toBeChecked();
        const detroitCheckbox = screen.getByLabelText(TestData.detroit.name);
        expect(detroitCheckbox).toBeChecked();
        const southfieldCheckbox = screen.getByLabelText(TestData.southfield.name);
        expect(southfieldCheckbox).not.toBeChecked();
    });

    it('should update local storage and trigger storage event when product location option is checked or unchecked', () => {
        const getSouthfieldCheckbox = () => screen.getByLabelText(TestData.southfield.name);
        const dispatchEvent = jest.spyOn(window, 'dispatchEvent');

        getProductLocationDropdownButton().click();
        getSouthfieldCheckbox().click();

        expect(getSouthfieldCheckbox()).toBeChecked();
        expect(dispatchEvent).toHaveBeenCalledTimes(1);
        expect(dispatchEvent).toHaveBeenCalledWith(new Event(localStorageEventListenerKey))
        expect(localStorage.getItem('filters')).toEqual(JSON.stringify({
            locationTagFilters: [TestData.detroit.name, TestData.southfield.name],
            productTagFilters: [],
            roleTagFilters: [],
            personTagFilters: [],
        }))

        getSouthfieldCheckbox().click();

        expect(dispatchEvent).toHaveBeenCalledTimes(2);
        expect(dispatchEvent).toHaveBeenCalledWith(new Event(localStorageEventListenerKey))
        expect(getSouthfieldCheckbox()).not.toBeChecked();
        expect(localStorage.getItem('filters')).toEqual(JSON.stringify(initialFilters))
    });

    it('should open product location modal when user selects "Add/Edit your Product Location" from the dropdown', async () => {
        getProductLocationDropdownButton().click();
        const openModalButton = screen.getByText('Add/Edit your Product Location');
        openModalButton.click();
        await waitFor(() => expect(modalContent?.title).toBe('Product Location'));
        await waitFor(() => expect(modalContent?.component.type).toBe(MyTagsForm));
    });
});

function getProductLocationDropdownButton() {
    return screen.getByTestId('dropdownButton__product_location')
}