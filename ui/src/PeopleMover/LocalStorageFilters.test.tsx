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

import TestData from '../Utils/TestData';
import {findByText, fireEvent} from '@testing-library/dom';
import {act, screen} from '@testing-library/react';
import {LocalStorageFilters} from '../SortingAndFiltering/FilterLibraries';
import LocationClient from '../Locations/LocationClient';
import TestUtils from '../Utils/TestUtils';

jest.mock('../Products/ProductClient');
jest.mock('../Locations/LocationClient');
jest.mock('../Space/SpaceClient');
jest.mock('../Roles/RoleClient');

describe('Filter products', () => {
    class MockLocalStorage {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        store: any = {};

        setItem(key: string, value: string): void {
            this.store[key] = value;
        }
    }

    const filters: LocalStorageFilters = {
        locationTagsFilters: [TestData.annarbor.name],
        productTagsFilters: [TestData.productTag1.name],
        roleTagsFilters: [TestData.roles[0].name],
        personTagsFilters: [TestData.personTag1.name],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        (global.localStorage as unknown) = new MockLocalStorage();
    });

    it('should show the local storage filter options when app starts', async () => {
        localStorage.setItem('filters', JSON.stringify(filters));
        await TestUtils.renderPeopleMoverComponent();

        const locationCount = await screen.findByTestId('filter_count_Product_Location');
        await findByText(locationCount, '1');
        const productTagCount = await screen.findByTestId('filter_count_Product_Tags');
        await findByText(productTagCount, '1');
        const roleCount = await screen.findByTestId('filter_count_Role');
        await findByText(roleCount, '1');
    });

    it('should show unedited location tags in the filter as checked from local storage', async () => {
        filters.locationTagsFilters.push(TestData.detroit.name);
        localStorage.setItem('filters', JSON.stringify(filters));

        await TestUtils.renderPeopleMoverComponent();

        const locationFilterButton = await screen.findByTestId('dropdown_button_Product_Location');
        fireEvent.click(locationFilterButton);
        const editButton = await screen.findByTestId('open_Product_Location_modal_button');
        fireEvent.click(editButton);

        const editIcons = await screen.findAllByTestId('editIcon__location');
        const locationTagIcon: HTMLElement = editIcons[0];
        fireEvent.click(locationTagIcon);

        LocationClient.get = jest.fn().mockResolvedValue({
            data: [
                {id: 1, name: 'Saline', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'},
                TestData.detroit, TestData.dearborn, TestData.southfield,
            ],
        })

        const editLocationTagText = await screen.findByTestId('tagNameInput');
        const updatedLocation = 'Saline';
        fireEvent.change(editLocationTagText, {target: {value: updatedLocation}});

        const saveButton = await screen.findByTestId('saveTagButton');
        await act(async () => {
            fireEvent.click(saveButton);
        })

        const instancesOfSaline = await screen.findAllByText(updatedLocation);
        expect(instancesOfSaline.length).toEqual(2);

        const tagFiltersAfterUpdate = JSON.parse(localStorage.getItem('filters') || '');
        expect(tagFiltersAfterUpdate.locationTagsFilters).toContain(TestData.detroit.name);
        expect(tagFiltersAfterUpdate.locationTagsFilters).toContain(updatedLocation);
        expect(tagFiltersAfterUpdate.locationTagsFilters).not.toContain(TestData.annarbor.name);
    });
});
