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

import React from 'react';
import configureStore, {MockStoreCreator, MockStoreEnhanced} from 'redux-mock-store';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import {emptyProduct} from './Product';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
    let mockStore: MockStoreCreator<unknown, {}>;
    let store: MockStoreEnhanced<unknown, {}>;

    beforeEach(() => {
        mockStore = configureStore([]);
        store = mockStore({
            currentSpace: TestUtils.space,
            viewingDate: new Date(2020, 4, 14),
        });
    });

    it('should not show the product link icon when there is no url', () => {
        const testProduct = {...emptyProduct(), name: 'testProduct'};
        const app = renderWithRedux(<ProductCard product={testProduct}/>, store, undefined);
        expect(app.queryAllByTestId('productUrl').length).toEqual(0);
    });

    it('should show the product link icon when there is a/an url', () => {
        const testProduct = {...emptyProduct(), name: 'testProduct', url: 'any old url'};
        const app = renderWithRedux(<ProductCard product={testProduct}/>, store, undefined);
        expect(app.queryAllByTestId('productUrl').length).toEqual(1);
    });
});