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
import ProductCard, {PRODUCT_URL_CLICKED} from './ProductCard';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import {act} from 'react-dom/test-utils';
import {fireEvent, RenderResult} from '@testing-library/react';

declare let window: MatomoWindow;

describe('ProductCard', () => {
    let originalWindow: Window;

    let mockStore: MockStoreCreator<unknown, {}>;
    let store: MockStoreEnhanced<unknown, {}>;

    beforeEach(() => {
        mockStore = configureStore([]);
        store = mockStore({
            currentSpace: TestUtils.space,
            viewingDate: new Date(2020, 4, 14),
        });
    });

    afterEach(() => {
        window._paq = [];
        (window as Window) = originalWindow;
    });

    it('should not show the product link icon when there is no url', () => {
        const testProduct = {...emptyProduct(), name: 'testProduct'};
        const app = renderWithRedux(<ProductCard product={testProduct}/>, store, undefined);
        expect(app.queryAllByTestId('productUrl').length).toEqual(0);
    });

    it('should show the product link icon when there is a url', () => {
        const testProduct = {...emptyProduct(), name: 'testProduct', url: 'any old url'};
        const app = renderWithRedux(<ProductCard product={testProduct}/>, store, undefined);
        expect(app.queryAllByTestId('productUrl').length).toEqual(1);
    });

    it('when a url is followed, generate a matomo event', async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        window.open = jest.fn();
        const testProduct = {...emptyProduct(), name: 'testProduct', url: 'any old url'};
        let productCard: RenderResult;
        await act(async () => {
            productCard = renderWithRedux(<ProductCard product={testProduct}/>, store, undefined);
        });

        await act(async () => {
            fireEvent.click(await productCard.findByTestId('productName'));
        });

        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open).toHaveBeenCalledWith('any old url');
        expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, PRODUCT_URL_CLICKED, 'testProduct']);
    });
});