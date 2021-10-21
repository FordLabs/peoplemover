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
import TestUtils, {createDataTestId, renderWithRedux} from '../tests/TestUtils';
import {emptyProduct} from './Product';
import ProductCard, {PRODUCT_URL_CLICKED} from './ProductCard';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import {act} from 'react-dom/test-utils';
import {fireEvent, RenderResult} from '@testing-library/react';
import ProductClient from './ProductClient';
import {AxiosResponse} from 'axios';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import moment from 'moment';
import rootReducer from '../Redux/Reducers';
import {applyMiddleware, createStore, Store} from 'redux';
import thunk from 'redux-thunk';
import AssignmentClient from '../Assignments/AssignmentClient';

declare let window: MatomoWindow;

describe('ProductCard', () => {
    let originalWindow: Window;

    const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
        { label:'Location Tags:', options: [] },
        { label:'Product Tags:', options: [] },
        { label:'Role Tags:', options: [] },
        { label:'Person Tags:', options: [] },
    ];
    const mayFourteenth2020 = new Date(2020, 4, 14);
    let store: Store;

    beforeEach(() => {
        store = createStore(rootReducer, 
            {
                currentSpace: TestUtils.space,
                viewingDate: mayFourteenth2020,
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                products: TestUtils.products,
            },
            applyMiddleware(thunk));
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

    it('archiving a product sets the appropriate fields in the product and moves all people to unassigned', async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        const may13String = moment(mayFourteenth2020).subtract(1, 'day').format('YYYY-MM-DD');
        const may14String = moment(mayFourteenth2020).format('YYYY-MM-DD');
        const testProduct = {...TestUtils.productWithAssignments, assignments: [TestUtils.assignmentForPerson1, TestUtils.assignmentForPerson2, TestUtils.assignmentForPerson3]};
        const expectedProduct = {...testProduct, endDate: may13String};
        ProductClient.editProduct = jest.fn(() => Promise.resolve({data: expectedProduct} as AxiosResponse));
        store.dispatch = jest.fn();
        const productCard = renderWithRedux(<ProductCard product={testProduct}/>, store);
        fireEvent.click(await productCard.findByTestId(createDataTestId('editProductIcon', TestUtils.productWithAssignments.name)));
        fireEvent.click(await productCard.findByText('Archive Product'));
        fireEvent.click(productCard.getByText('Archive'));

        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(3);
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [], TestUtils.space, TestUtils.person1);
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [], TestUtils.space, TestUtils.person2);
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [], TestUtils.space, TestUtils.person3);
        expect(ProductClient.editProduct).toHaveBeenCalledTimes(1);
        expect(ProductClient.editProduct).toHaveBeenCalledWith(TestUtils.space, {...testProduct, endDate: may13String}, true);
        expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('should show a confirmation modal when Archive Person is clicked, and be able to close it', async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        const productCard = renderWithRedux(<ProductCard product={TestUtils.productWithAssignments}/>, store);
        expectEditMenuContents(false, productCard);
        fireEvent.click(productCard.getByTestId(createDataTestId('editProductIcon', TestUtils.productWithAssignments.name)));
        expectEditMenuContents(true, productCard);
        fireEvent.click(productCard.getByText('Archive Product'));
        expect(await productCard.findByText('Are you sure?')).toBeInTheDocument();
        fireEvent.click(productCard.getByText('Cancel'));
        expect(await productCard.queryByText('Are you sure?')).not.toBeInTheDocument();
    });

    const expectEditMenuContents = (shown: boolean, elementUnderTest: RenderResult): void => {
        if (shown) {
            expect(elementUnderTest.getByText('Edit Product')).toBeInTheDocument();
            expect(elementUnderTest.getByText('Archive Product')).toBeInTheDocument();
        } else {
            expect(elementUnderTest.queryByText('Edit Product')).not.toBeInTheDocument();
            expect(elementUnderTest.queryByText('Archive Product')).not.toBeInTheDocument();
        }
    };


});