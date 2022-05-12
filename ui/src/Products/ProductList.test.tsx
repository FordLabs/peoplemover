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
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import {AxiosResponse} from 'axios';
import ProductClient from './ProductClient';
import ProductList from './ProductList';
import rootReducer from '../Redux/Reducers';
import moment from 'moment';
import {Product} from './Product';
import {applyMiddleware, createStore, Store} from 'redux';
import thunk from 'redux-thunk';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';

describe('Product List tests', () => {
    let store: Store;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        ProductClient.getProductsForDate = jest.fn(() =>
            Promise.resolve({ data: TestUtils.products } as AxiosResponse)
        );
    });

    describe('Product list test filtering', () => {
        it('should return all products with the selected location filter', async () => {
            const productWithAnnArborLocation: Product = {
                id: 99,
                name: 'AA',
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                startDate: '2011-01-01',
                endDate: undefined,
                spaceLocation: TestUtils.annarbor,
                assignments: [],
                archived: false,
                tags: [TestUtils.productTag2],
                notes: '',
            };
            const products: Array<Product> = Object.assign([], TestUtils.products);
            products.push(productWithAnnArborLocation);

            const initialState = {
                products: products,
                productTags: TestUtils.productTags,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                productSortBy: 'name',
                currentSpace: TestUtils.space,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            const component = await renderWithRedux(<ProductList/>, store);
            await component.findByText(TestUtils.productForHank.name);
            await component.findByText(productWithAnnArborLocation.name);
            expect(component.getByTestId('productListSortedContainer').children.length).toEqual(3);
        });

        it('should return two aa products with location filter but not a product add button with readonly', async () => {
            const productWithAnnArborLocation: Product = {
                id: 99,
                name: 'AA',
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                startDate: '2011-01-01',
                endDate: undefined,
                spaceLocation: TestUtils.annarbor,
                assignments: [],
                archived: false,
                tags: [TestUtils.productTag2],
                notes: '',
            };
            const products: Array<Product> = Object.assign([], TestUtils.products);
            products.push(productWithAnnArborLocation);

            const initialState = {
                products: products,
                productTags: TestUtils.productTags,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                productSortBy: 'name',
                currentSpace: TestUtils.space,
                isReadOnly: true,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            const component = await renderWithRedux(<ProductList/>, store);
            await component.findByText(TestUtils.productForHank.name);
            await component.findByText(productWithAnnArborLocation.name);
            expect(component.getByTestId('productListSortedContainer').children.length).toEqual(2);
            expect(component.queryByTestId('newProductButton')).not.toBeInTheDocument();
        });

        it('should return all products with the selected product tag filter', async () => {
            const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [],
                },
                {
                    label:'Product Tags:',
                    options: [{
                        label: 'FordX',
                        value: '1_FordX',
                        selected: true,
                    }],
                },
                {
                    label:'Role Tags:',
                    options: [],
                },
                {
                    label: 'Person Tags:',
                    options: [],
                },
            ];

            const initialState = {
                products: TestUtils.products,
                productTags: TestUtils.productTags,
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                productSortBy: 'name',
                currentSpace: TestUtils.space,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            const component = await renderWithRedux(<ProductList/>, store);
            await component.findByText(TestUtils.productWithAssignments.name);
            expect(component.getByTestId('productListSortedContainer').children.length).toEqual(2);
        });

        it('should return one FordX products with product tag filter but not a product add button with readonly', async () => {
            const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [],
                },
                {
                    label:'Product Tags:',
                    options: [{
                        label: 'FordX',
                        value: '1_FordX',
                        selected: true,
                    }],
                },
                {
                    label:'Role Tags:',
                    options: [],
                },
                {
                    label: 'Person Tags:',
                    options: [],
                },
            ];

            const initialState = {
                products: TestUtils.products,
                productTags: TestUtils.productTags,
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                productSortBy: 'name',
                currentSpace: TestUtils.space,
                isReadOnly: true,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            const component = await renderWithRedux(<ProductList/>, store);
            await component.findByText(TestUtils.productWithAssignments.name);
            expect(component.getByTestId('productListSortedContainer').children.length).toEqual(1);
            expect(component.queryByTestId('newProductButton')).not.toBeInTheDocument();
        });

        it('should return all products with the selected product tag filter', async () => {
            const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [{
                        label: 'Dearborn',
                        value: '1_Dearborn',
                        selected: true,
                    }],
                },
                {
                    label:'Product Tags:',
                    options: [{
                        label: 'AV',
                        value: '1_AV',
                        selected: true,
                    }],
                },
                {
                    label:'Role Tags:',
                    options: [],
                },
            ];

            const initialState = {
                products: TestUtils.products,
                productTags: TestUtils.productTags,
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                productSortBy: 'name',
                currentSpace: TestUtils.space,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            const component = await renderWithRedux(<ProductList/>, store);
            await component.findByText(TestUtils.productWithoutAssignments.name);
            expect(component.getByTestId('productListSortedContainer').children.length).toEqual(2);
        });
    });
});
