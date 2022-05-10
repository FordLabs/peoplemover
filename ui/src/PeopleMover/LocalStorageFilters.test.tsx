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

import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import PeopleMover from './PeopleMover';
import {findByText, fireEvent} from '@testing-library/dom';
import React from 'react';
import {act, RenderResult} from '@testing-library/react';
import {createBrowserHistory} from 'history';
import {MemoryRouter} from 'react-router-dom';
import {LocalStorageFilters} from '../SortingAndFiltering/FilterLibraries';
import LocationClient from '../Locations/LocationClient';
import {AxiosResponse} from 'axios';

describe('Filter products', () => {
    class MockLocalStorage {
        store: any = {};

        setItem(key: string, value: string): void {
            this.store[key] = value;
        }
    }

    const filters: LocalStorageFilters = {
        locationTagsFilters: [TestUtils.annarbor.name],
        productTagsFilters: [TestUtils.productTag1.name],
        roleTagsFilters: [TestUtils.roles[0].name],
        personTagsFilters: [TestUtils.personTag1.name],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        (global.localStorage as unknown) = new MockLocalStorage();
    });

    function applicationSetup(): RenderResult {
        let history = createBrowserHistory();
        history.push('/uuid');

        return renderWithRedux(
            <MemoryRouter initialEntries={['/uuid']}>
                <PeopleMover/>
            </MemoryRouter>,
        );
    }

    it('should show the local storage filter options when app starts', async () => {
        localStorage.setItem('filters', JSON.stringify(filters));
        const app = applicationSetup();

        const locationCount = await app.findByTestId('filter_count_Product_Location');
        await findByText(locationCount, '1');
        const productTagCount = await app.findByTestId('filter_count_Product_Tags');
        await findByText(productTagCount, '1');
        const roleCount = await app.findByTestId('filter_count_Role');
        await findByText(roleCount, '1');
    });

    it('should show unedited location tags in the filter as checked from local storage', async () => {
        filters.locationTagsFilters.push(TestUtils.detroit.name);
        localStorage.setItem('filters', JSON.stringify(filters));

        const app = applicationSetup();

        const locationFilterButton = await app.findByTestId('dropdown_button_Product_Location');
        fireEvent.click(locationFilterButton);
        const editButton = await app.findByTestId('open_Product_Location_modal_button');
        fireEvent.click(editButton);

        const editIcons = await app.findAllByTestId('editIcon__location');
        const locationTagIcon: HTMLElement = editIcons[0];
        fireEvent.click(locationTagIcon);

        LocationClient.get = jest.fn(
            () => Promise.resolve({
                data: [
                    {id: 1, name: 'Saline', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'},
                    TestUtils.detroit, TestUtils.dearborn, TestUtils.southfield,
                ],
            } as AxiosResponse));

        const editLocationTagText = await app.findByTestId('tagNameInput');
        const updatedLocation = 'Saline';
        fireEvent.change(editLocationTagText, {target: {value: updatedLocation}});

        const saveButton = await app.findByTestId('saveTagButton');
        await act(async () => {
            fireEvent.click(saveButton);
        })

        const instancesOfSaline = await app.findAllByText(updatedLocation);
        expect(instancesOfSaline.length).toEqual(2);

        const tagFiltersAfterUpdate = JSON.parse(localStorage.getItem('filters') || '');
        expect(tagFiltersAfterUpdate.locationTagsFilters).toContain(TestUtils.detroit.name);
        expect(tagFiltersAfterUpdate.locationTagsFilters).toContain(updatedLocation);
        expect(tagFiltersAfterUpdate.locationTagsFilters).not.toContain(TestUtils.annarbor.name);
    });
});
