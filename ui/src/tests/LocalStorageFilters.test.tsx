/*
 * Copyright (c) 2020 Ford Motor Company
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

import TestUtils, {renderWithRedux} from './TestUtils';
import PeopleMover from '../Application/PeopleMover';
import {findByText, fireEvent} from '@testing-library/dom';
import React from 'react';
import {LocalStorageFilters} from '../ReusableComponents/ProductFilter';
import selectEvent from 'react-select-event';
import {wait} from '@testing-library/react';

describe('Filter products', () => {
    class MockLocalStorage {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        store: any = {};

        getItem(key: string): string | null {
            return this.store[key];
        }

        setItem(key: string, value: string): void {
            this.store[key] = value;
        }
    }

    const filters: LocalStorageFilters = {
        locationTagsFilters: [TestUtils.annarbor.name],
        productTagsFilters: [TestUtils.productTag1.name],
        roleTagsFilters: [TestUtils.roles[0].name],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        (localStorage as unknown) = new MockLocalStorage();
    });

    it('should show the local storage filter options when app starts', async () => {
        localStorage.setItem('filters', JSON.stringify(filters));
        const app = renderWithRedux(<PeopleMover/>);
        const filterContainer = await app.findByTestId('filters');
        await findByText(filterContainer, TestUtils.annarbor.name);
        await findByText(filterContainer, TestUtils.productTag1.name);
        await findByText(filterContainer, TestUtils.roles[0].name);
    });

    it('should show unedited location tags in the filter as checked from local storage', async () => {
        filters.locationTagsFilters.push(TestUtils.detroit.name);
        localStorage.setItem('filters', JSON.stringify(filters));

        const app = renderWithRedux(<PeopleMover/>);

        const myTagsButton = await app.findByText('My Tags');
        fireEvent.click(myTagsButton);
        const editIcons = await app.findAllByTestId('editIcon__location');
        const locationTagIcon: HTMLElement = editIcons[0];
        fireEvent.click(locationTagIcon);

        await app.findByTestId('saveTagButton');

        const editLocationTagText = await app.findByTestId('tagNameInput');
        const updatedLocation = 'Saline';
        fireEvent.change(editLocationTagText, {target: {value: updatedLocation}});

        const saveButton = await app.findByTestId('saveTagButton');
        fireEvent.click(saveButton);

        const instancesOfSaline = await app.findAllByText(updatedLocation);
        expect(instancesOfSaline.length).toEqual(2);

        const tagFiltersAfterUpdate: LocalStorageFilters = JSON.parse(localStorage.getItem('filters') || '');
        expect(tagFiltersAfterUpdate.locationTagsFilters).toContain(TestUtils.detroit.name);
        expect(tagFiltersAfterUpdate.locationTagsFilters).toContain(updatedLocation);
        expect(tagFiltersAfterUpdate.locationTagsFilters).not.toContain(TestUtils.annarbor.name);
    });


    it('should put and x more... option pill when more than 3 options selected', async () => {
        const longFilters: LocalStorageFilters = {
            locationTagsFilters: [TestUtils.annarbor.name, TestUtils.detroit.name],
            productTagsFilters: [TestUtils.productTag1.name, TestUtils.productTag2.name],
            roleTagsFilters: [],
        };
        localStorage.setItem('filters', JSON.stringify(longFilters));
        const app = renderWithRedux(<PeopleMover/>);

        await app.findByText('and 1 more...');

        const filterDropDown = await app.findByLabelText('Filter:');
        await selectEvent.select(filterDropDown, TestUtils.productTag3.name);
        await app.findByText('and 2 more...');

        await selectEvent.clearAll(filterDropDown);
        await wait(() => {
            expect(app.queryByText('more...')).not.toBeInTheDocument();
        });
    });
});
