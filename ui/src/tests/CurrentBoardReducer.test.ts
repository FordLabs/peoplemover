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

import {currentBoardReducer, sortByProductName} from '../Redux/Reducers/currentBoardReducer';
import {AvailableActions} from '../Redux/Actions';
import {Board} from '../Boards/Board';

describe('sort by product name', () => {
    it('return -1', () => {
        expect(sortByProductName('hi', 'bye')).toEqual(1);
    });

    it('return 1', () => {
        expect(sortByProductName('bye', 'hi')).toEqual(-1);
    });

    it('return 0', () => {
        expect(sortByProductName('Hi', 'Hi')).toEqual(0);
    });
});


describe('currentBoardReducer', () => {
    const productList =  [
        {name: 'Product A', spaceLocation: {name: 'Detroit'}},
        {name: 'Product B', spaceLocation: {name: 'Ann Arbor'}},
    ];

    it('should sort the products by location', () => {
        const actual = currentBoardReducer(null,
            {
                type: AvailableActions.SET_CURRENT_BOARD,
                sortOptionValue: 'location',
                board: {
                    products: [...productList],
                } as Board,
            }
        );
        if (actual) {
            expect(actual.products[0]).toEqual(productList[1]);
            expect(actual.products[1]).toEqual(productList[0]);
        }
    });

    it('should sort the products by name', () => {
        const actual = currentBoardReducer(null,
            {
                type: AvailableActions.SET_CURRENT_BOARD,
                sortOptionValue: 'name',
                board: {
                    products: [...productList],
                } as Board,
            }
        );
        if (actual) {
            expect(actual.products[0]).toEqual(productList[0]);
            expect(actual.products[1]).toEqual(productList[1]);
        }
    });

    it('should return the original product array', () => {
        const actual = currentBoardReducer(null,
            {
                type: AvailableActions.SET_CURRENT_BOARD,
                sortOptionValue: '',
                board: {
                    products: [...productList],
                } as Board,
            }
        );
        if (actual) {
            expect(actual.products[0]).toEqual(productList[0]);
            expect(actual.products[1]).toEqual(productList[1]);
        }
    });
});
