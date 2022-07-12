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
import TestData from '../Utils/TestData';
import Counter from './Counter';
import {screen} from '@testing-library/react';
import {Product} from '../Products/Product';
import {ViewingDateState} from '../State/ViewingDateState';
import {ProductsState} from '../State/ProductsState';
import {LocalStorageFilters} from '../SortingAndFiltering/FilterLibraries';

describe('Counter', () => {
    it('should display the number of products and people when no filter are applied and ignore archived products', async () => {
        renderCounter();
        expect(getCounter()).toHaveTextContent( 'Results - Products: 4, People: 3 (Unassigned: 1)');
    });

    it('should not count product that are ended before today', () => {
        const finishedProduct = {
            id: 5,
            name: 'Awesome Product',
            spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            startDate: '2011-01-01',
            endDate: '2020-02-02',
            assignments: [],
            archived: false,
            tags: [],
        };
        const products = [finishedProduct, TestData.unassignedProduct];
        renderCounter(products);
        expect(getCounter()).toHaveTextContent('Results - Products: 0, People: 1 (Unassigned: 1)');
    });

    it('should display the number of products and people when role filters are applied', () => {
        const filters: LocalStorageFilters = {
            locationTagFilters: [],
            productTagFilters: [],
            roleTagFilters: ['Software Engineer'],
            personTagFilters: [],
        }
        localStorage.setItem('filters', JSON.stringify(filters));
        renderCounter();
        expect(getCounter()).toHaveTextContent('Results - Products: 4, People: 2 (Unassigned: 1)');
    });

    it('should display the number of products and people when location filters are applied', () => {
        const filters: LocalStorageFilters = {
            locationTagFilters: ['Ann Arbor'],
            productTagFilters: [],
            roleTagFilters: [],
            personTagFilters: [],
        }
        localStorage.setItem('filters', JSON.stringify(filters));
        renderCounter();
        expect(getCounter()).toHaveTextContent('Results - Products: 1, People: 2 (Unassigned: 1)');
    });

    it('should display the number of products and people when all filters are applied', () => {
        const filters: LocalStorageFilters = {
            locationTagFilters:['Southfield'],
            productTagFilters: ['FordX'],
            roleTagFilters: ['Software Engineer'],
            personTagFilters: ['The lil boss'],
        }
        localStorage.setItem('filters', JSON.stringify(filters));
        renderCounter();
        expect(getCounter()).toHaveTextContent( 'Results - Products: 1, People: 1 (Unassigned: 0)');
    });

    it('should display the number of products and people when one person tag filter is applied', () => {
        const filters: LocalStorageFilters = {
            locationTagFilters: [],
            productTagFilters: [],
            roleTagFilters: [],
            personTagFilters: ['The big boss'],
        }
        localStorage.setItem('filters', JSON.stringify(filters));
        const products = [TestData.unassignedProductForBigBossSE, TestData.productWithTags];
        renderCounter(products);
        expect(getCounter()).toHaveTextContent('Results - Products: 1, People: 1 (Unassigned: 0)');
    });

    it('should display the number of products and people when people are in multiple products', () => {
        const filters: LocalStorageFilters = {
            locationTagFilters: [],
            productTagFilters: [],
            roleTagFilters: [],
            personTagFilters: ['The lil boss', 'The big boss'],
        }
        localStorage.setItem('filters', JSON.stringify(filters));
        const productWithPersonAlreadyAssignedInProduct1: Product = {
            id: 2,
            name: 'Product 2',
            spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            startDate: '2011-01-01',
            endDate: '2022-02-02',
            spaceLocation: TestData.southfield,
            assignments: TestData.assignmentsFilterTest,
            archived: false,
            tags: [TestData.productTag2],
            notes: 'note',
        };
        const products = [TestData.unassignedProductForBigBossSE, TestData.productWithTags, productWithPersonAlreadyAssignedInProduct1]
        renderCounter(products)
        expect(getCounter()).toContainHTML('Results - Products: 2, People: 3 (Unassigned: 0)');
    });
});

function renderCounter(products = TestData.products) {
    renderWithRecoil(
        <Counter />,
        ({set}) => {
            set(ProductsState, products)
            set(ViewingDateState, new Date(2021, 4, 13))
        }
    );
}

function getCounter() {
    return screen.getByTestId('counter')
}
