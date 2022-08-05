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
import RolesFilter from './RolesFilter';
import {screen, waitFor} from '@testing-library/react';
import {RolesState} from 'State/RolesState';
import TestData from 'Utils/TestData';
import {LocalStorageFilters} from '../FilterLibraries';
import {ModalContents, ModalContentsState} from 'State/ModalContentsState';
import {RecoilObserver} from 'Utils/RecoilObserver';
import MyRolesForm from './MyRolesForm/MyRolesForm';
import {localStorageEventListenerKey} from 'Hooks/useOnStorageChange/useOnStorageChange';

describe('Role Filter', () => {
    let modalContent: ModalContents | null;
    const initialFilters: LocalStorageFilters = {
        locationTagFilters: [],
        productTagFilters: [],
        roleTagFilters: [TestData.softwareEngineer.name],
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
                <RolesFilter />
            </>,
            ({set}) => {
                set(RolesState, TestData.roles)
            })
    })

    it('should show "Role:" label', () => {
        expect(getRoleDropdownButton()).toHaveTextContent('Role:');
    });

    it('should show only roles saved in local storage as selected', () => {
        getRoleDropdownButton().click();
        const SECheckbox = screen.getByLabelText(TestData.softwareEngineer.name);
        expect(SECheckbox).toBeChecked();
        const PMCheckbox = screen.getByLabelText(TestData.productManager.name);
        expect(PMCheckbox).not.toBeChecked();
        const PDCheckbox = screen.getByLabelText(TestData.productDesigner.name);
        expect(PDCheckbox).not.toBeChecked();
    });

    it('should update local storage and trigger storage event when role option is checked or unchecked', () => {
        const getPMCheckbox = () => screen.getByLabelText(TestData.productManager.name);
        const dispatchEvent = jest.spyOn(window, 'dispatchEvent');

        getRoleDropdownButton().click();
        getPMCheckbox().click();

        expect(getPMCheckbox()).toBeChecked();
        expect(dispatchEvent).toHaveBeenCalledTimes(1);
        expect(dispatchEvent).toHaveBeenCalledWith(new Event(localStorageEventListenerKey))
        expect(localStorage.getItem('filters')).toEqual(JSON.stringify({
            locationTagFilters: [],
            productTagFilters: [],
            roleTagFilters: [TestData.productManager.name, TestData.softwareEngineer.name],
            personTagFilters: [],
        }))

        getPMCheckbox().click();

        expect(dispatchEvent).toHaveBeenCalledTimes(2);
        expect(dispatchEvent).toHaveBeenCalledWith(new Event(localStorageEventListenerKey))
        expect(getPMCheckbox()).not.toBeChecked();
        expect(localStorage.getItem('filters')).toEqual(JSON.stringify(initialFilters))
    });

    it('should open roles modal when user selects "Add/Edit your Role" from the dropdown', async () => {
        getRoleDropdownButton().click();
        const openModalButton = screen.getByText('Add/Edit your Role');
        openModalButton.click();
        await waitFor(() => expect(modalContent?.title).toBe('My Roles'));
        await waitFor(() => expect(modalContent?.component.type).toBe(MyRolesForm));
    });
});

function getRoleDropdownButton() {
    return screen.getByTestId('dropdownButton__role')
}