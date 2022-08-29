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
import {renderWithRecoil} from '../../../Utils/TestUtils';
import {screen, waitFor} from '@testing-library/react';
import TestData from '../../../Utils/TestData';
import {LocalStorageFilters} from '../FilterLibraries';
import {ModalContents, ModalContentsState} from '../../../State/ModalContentsState';
import {RecoilObserver} from '../../../Utils/RecoilObserver';
import {localStorageEventListenerKey} from '../../../Hooks/useOnStorageChange/useOnStorageChange';
import MyTagsForm from '../MyTagsForm/MyTagsForm';
import PersonTagsFilter from './PersonTagsFilter';
import {PersonTagsState} from '../../../State/PersonTagsState';

describe('Person Tags Filter', () => {
    let modalContent: ModalContents | null;
    const initialFilters: LocalStorageFilters = {
        locationTagFilters: [],
        productTagFilters: [],
        roleTagFilters: [],
        personTagFilters: [TestData.personTag1.name],
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
                <PersonTagsFilter />
            </>,
            ({set}) => {
                set(PersonTagsState, TestData.personTags)
            })
    })

    it('should show "Person Tags:" label', () => {
        expect(getPersonTagsDropdownButton()).toHaveTextContent('Person Tags:');
    });

    it('should show only person tags saved in local storage as selected', () => {
        getPersonTagsDropdownButton().click();
        const personTag1Checkbox = screen.getByLabelText(TestData.personTag1.name);
        expect(personTag1Checkbox).toBeChecked();
        const personTag2Checkbox = screen.getByLabelText(TestData.personTag2.name);
        expect(personTag2Checkbox).not.toBeChecked();
    });

    it('should update local storage and trigger storage event when product location option is checked or unchecked', () => {
        const getPersonTag2Checkbox = () => screen.getByLabelText(TestData.personTag2.name);
        const dispatchEvent = jest.spyOn(window, 'dispatchEvent');

        getPersonTagsDropdownButton().click();
        getPersonTag2Checkbox().click();

        expect(getPersonTag2Checkbox()).toBeChecked();
        expect(dispatchEvent).toHaveBeenCalledTimes(1);
        expect(dispatchEvent).toHaveBeenCalledWith(new Event(localStorageEventListenerKey))
        expect(localStorage.getItem('filters')).toEqual(JSON.stringify({
            locationTagFilters: [],
            productTagFilters: [],
            roleTagFilters: [],
            personTagFilters: [TestData.personTag1.name, TestData.personTag2.name],
        }))

        getPersonTag2Checkbox().click();

        expect(dispatchEvent).toHaveBeenCalledTimes(2);
        expect(dispatchEvent).toHaveBeenCalledWith(new Event(localStorageEventListenerKey))
        expect(getPersonTag2Checkbox()).not.toBeChecked();
        expect(localStorage.getItem('filters')).toEqual(JSON.stringify(initialFilters))
    });

    it('should open person tag modal when user selects "Add/Edit your Person Tags" from the dropdown', async () => {
        getPersonTagsDropdownButton().click();
        const openModalButton = screen.getByText('Add/Edit your Person Tags');
        openModalButton.click();
        await waitFor(() => expect(modalContent?.title).toBe('Person Tags'));
        await waitFor(() => expect(modalContent?.component.type).toBe(MyTagsForm));
    });
});

function getPersonTagsDropdownButton() {
    return screen.getByTestId('dropdownButton__person_tags')
}