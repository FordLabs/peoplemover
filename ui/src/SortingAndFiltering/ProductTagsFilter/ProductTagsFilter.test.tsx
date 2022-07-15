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
import {renderWithRecoil} from '../../Utils/TestUtils';
import {screen, waitFor} from '@testing-library/react';
import TestData from '../../Utils/TestData';
import {LocalStorageFilters} from '../FilterLibraries';
import {ModalContents, ModalContentsState} from '../../State/ModalContentsState';
import {RecoilObserver} from '../../Utils/RecoilObserver';
import {localStorageEventListenerKey} from '../../Hooks/useOnStorageChange/useOnStorageChange';
import ProductTagsFilter from './ProductTagsFilter';
import {ProductTagsState} from '../../State/ProductTagsState';
import MyTagsForm from '../../Tags/MyTagsForm';

describe('Product Tags Filter', () => {
    let modalContent: ModalContents | null;
    const initialFilters: LocalStorageFilters = {
        locationTagFilters: [],
        productTagFilters: [TestData.productTag1.name],
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
                <ProductTagsFilter />
            </>,
            ({set}) => {
                set(ProductTagsState, TestData.productTags)
            })
    })

    it('should show "Product Tags:" label', () => {
        expect(getProductTagsDropdownButton()).toHaveTextContent('Product Tags:');
    });

    it('should show only product tags saved in local storage as selected', () => {
        getProductTagsDropdownButton().click();
        const productTag1Checkbox = screen.getByLabelText(TestData.productTag1.name);
        expect(productTag1Checkbox).toBeChecked();
        const productTag2Checkbox = screen.getByLabelText(TestData.productTag2.name);
        expect(productTag2Checkbox).not.toBeChecked();
        const productTag3Checkbox = screen.getByLabelText(TestData.productTag3.name);
        expect(productTag3Checkbox).not.toBeChecked();
        const productTag4Checkbox = screen.getByLabelText(TestData.productTag4.name);
        expect(productTag4Checkbox).not.toBeChecked();
    });

    it('should update local storage and trigger storage event when product tag option is checked or unchecked', () => {
        const getProductTag2Checkbox = () => screen.getByLabelText(TestData.productTag2.name);
        const dispatchEvent = jest.spyOn(window, 'dispatchEvent');

        getProductTagsDropdownButton().click();
        getProductTag2Checkbox().click();

        expect(getProductTag2Checkbox()).toBeChecked();
        expect(dispatchEvent).toHaveBeenCalledTimes(1);
        expect(dispatchEvent).toHaveBeenCalledWith(new Event(localStorageEventListenerKey))
        expect(localStorage.getItem('filters')).toEqual(JSON.stringify({
            locationTagFilters: [],
            productTagFilters: [TestData.productTag1.name, TestData.productTag2.name],
            roleTagFilters: [],
            personTagFilters: [],
        }))

        getProductTag2Checkbox().click();

        expect(dispatchEvent).toHaveBeenCalledTimes(2);
        expect(dispatchEvent).toHaveBeenCalledWith(new Event(localStorageEventListenerKey))
        expect(getProductTag2Checkbox()).not.toBeChecked();
        expect(localStorage.getItem('filters')).toEqual(JSON.stringify(initialFilters))
    });

    it('should open product tags modal when user selects "Add/Edit your Product Tags" from the dropdown', async () => {
        getProductTagsDropdownButton().click();
        const openModalButton = screen.getByText('Add/Edit your Product Tags');
        openModalButton.click();
        await waitFor(() => expect(modalContent?.title).toBe('Product Tags'));
        await waitFor(() => expect(modalContent?.component.type).toBe(MyTagsForm));
    });
});

function getProductTagsDropdownButton() {
    return screen.getByTestId('dropdownButton__product_tags')
}