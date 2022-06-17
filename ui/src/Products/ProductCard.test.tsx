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
import TestUtils, {createDataTestId, renderWithRedux} from '../Utils/TestUtils';
import {emptyProduct, Product} from './Product';
import ProductCard, {PRODUCT_URL_CLICKED} from './ProductCard';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import ProductClient from './ProductClient';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import moment from 'moment';
import rootReducer from '../Redux/Reducers';
import {applyMiddleware, createStore, Store} from 'redux';
import thunk from 'redux-thunk';
import AssignmentClient from '../Assignments/AssignmentClient';
import {RecoilRoot} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {ProductsState} from '../State/ProductsState';

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
    const products = [TestUtils.unassignedProduct,
        TestUtils.productWithoutAssignments,
        TestUtils.archivedProduct,
        TestUtils.productWithoutLocation,
        TestUtils.productWithAssignments,
        {...TestUtils.productForHank, assignments: [
            TestUtils.assignmentForHank,
            {...TestUtils.assignmentForPerson1, productId: TestUtils.productForHank.id},
        ]},
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        store = createStore(rootReducer, 
            {
                currentSpace: TestUtils.space,
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
            },
            applyMiddleware(thunk));
    });

    afterEach(() => {
        window._paq = [];
        (window as Window) = originalWindow;
    });

    it('should not show the product link icon when there is no url', () => {
        renderProductCard({...emptyProduct(), name: 'testProduct'});
        expect(screen.queryAllByTestId('productUrl').length).toEqual(0);
    });

    it('should show the product link icon when there is a url', () => {
        renderProductCard({...emptyProduct(), name: 'testProduct', url: 'any old url'});
        expect(screen.queryAllByTestId('productUrl').length).toEqual(1);
    });

    it('when a url is followed, generate a matomo event', async () => {
        window.open = jest.fn();
        renderProductCard({...emptyProduct(), name: 'testProduct', url: 'any old url'});

        fireEvent.click(await screen.findByTestId('productName'));

        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open).toHaveBeenCalledWith('any old url');
        expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, PRODUCT_URL_CLICKED, 'testProduct']);
    });

    it('archiving a product sets the appropriate fields in the product and moves all people to unassigned', async () => {
        const may13String = moment(mayFourteenth2020).subtract(1, 'day').format('YYYY-MM-DD');
        const may14String = moment(mayFourteenth2020).format('YYYY-MM-DD');
        const testProduct = {...TestUtils.productWithAssignments, assignments: [TestUtils.assignmentForPerson1, TestUtils.assignmentForPerson2, TestUtils.assignmentForPerson3]};

        ProductClient.editProduct = jest.fn().mockResolvedValue({data: {...testProduct, endDate: may13String}});

        store.dispatch = jest.fn();

        renderProductCard(testProduct);

        fireEvent.click(await screen.findByTestId(createDataTestId('editProductIcon', TestUtils.productWithAssignments.name)));
        fireEvent.click(await screen.findByText('Archive Product'));
        fireEvent.click(screen.getByText('Archive'));

        await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(3));
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [{productId: TestUtils.productForHank.id, placeholder: false}], TestUtils.space, TestUtils.person1);
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [], TestUtils.space, TestUtils.person2);
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [], TestUtils.space, TestUtils.person3);
        expect(ProductClient.editProduct).toHaveBeenCalledTimes(1);
        expect(ProductClient.editProduct).toHaveBeenCalledWith(TestUtils.space, {...testProduct, endDate: may13String}, true);
        expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('should show a confirmation modal when Archive Person is clicked, and be able to close it', async () => {
        renderProductCard(TestUtils.productWithAssignments);
        expectEditMenuContents(false);

        const editProductSelector = createDataTestId('editProductIcon', TestUtils.productWithAssignments.name)
        fireEvent.click(screen.getByTestId(editProductSelector));
        expectEditMenuContents(true);

        fireEvent.click(screen.getByText('Archive Product'));
        expect(await screen.findByText('Are you sure?')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel'));
        expect(await screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });

    function renderProductCard(product: Product) {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, mayFourteenth2020);
                set(ProductsState, products);
            }}>
                <ProductCard product={product}/>
            </RecoilRoot>,
            store
        );
    }
});

const expectEditMenuContents = (shown: boolean): void => {
    if (shown) {
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
        expect(screen.getByText('Archive Product')).toBeInTheDocument();
    } else {
        expect(screen.queryByText('Edit Product')).not.toBeInTheDocument();
        expect(screen.queryByText('Archive Product')).not.toBeInTheDocument();
    }
};