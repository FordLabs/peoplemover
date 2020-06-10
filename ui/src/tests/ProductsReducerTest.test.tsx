/*
 * Copyright (c) 2019 Ford Motor Company
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

import {AvailableActions} from '../Redux/Actions';
import productsReducer, {sortByProductName} from '../Redux/Reducers/productsReducer';
import {Product} from '../Products/Product';

describe('sort by product name', () => {
    it('return -1', () => {
        expect(sortByProductName({name: 'hi'} as Product, {name: 'bye'} as Product)).toEqual(1);
    });

    it('return 1', () => {
        expect(sortByProductName({name: 'bye'} as Product, {name: 'hi'} as Product)).toEqual(-1);
    });

    it('return 0', () => {
        expect(sortByProductName({name: 'hi'} as Product, {name: 'Hi'} as Product)).toEqual(0);
    });
});

describe('productsReducer', () => {
    const productList =  [
        {name: 'Product A', spaceLocation: {name: 'Detroit'}},
        {name: 'Product B', spaceLocation: {name: 'Ann Arbor'}},
    ];

    it('should sort the products by location', () => {
        const actual = productsReducer([] as Product[],
            {
                type: AvailableActions.SET_PRODUCTS,
                sortOption: 'location',
                products: [...productList] as Product[],
            }
        );
        if (actual) {
            expect(actual[0]).toEqual(productList[1]);
            expect(actual[1]).toEqual(productList[0]);
        }
    });

    it('should sort the products by name', () => {
        const actual = productsReducer([] as Product[],
            {
                type: AvailableActions.SET_PRODUCTS,
                sortOption: 'name',
                products: [...productList] as Product[],
            }
        );
        if (actual) {
            expect(actual[0]).toEqual(productList[0]);
            expect(actual[1]).toEqual(productList[1]);
        }
    });

    it('should return the original product array', () => {
        const actual = productsReducer([] as Product[],
            {
                type: AvailableActions.SET_PRODUCTS,
                sortOption: '',
                products: [...productList] as Product[],
            }
        );
        if (actual) {
            expect(actual[0]).toEqual(productList[0]);
            expect(actual[1]).toEqual(productList[1]);
        }
    });
});
