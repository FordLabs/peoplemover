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
import {createDataTestId, renderWithRecoil} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import {emptyProduct} from './ProductService';
import ProductCard from './ProductCard';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import ProductClient from '../Services/Api/ProductClient';
import moment from 'moment';
import AssignmentClient from '../Services/Api/AssignmentClient';
import {ViewingDateState} from '../State/ViewingDateState';
import {ProductsState} from '../State/ProductsState';
import {CurrentSpaceState} from '../State/CurrentSpaceState';
import {Product} from '../Types/Product';

jest.mock('Services/Api/AssignmentClient');

describe('ProductCard', () => {
    const mayFourteenth2020 = new Date(2020, 4, 14);
    const products = [TestData.unassignedProduct,
        TestData.productWithoutAssignments,
        TestData.archivedProduct,
        TestData.productWithoutLocation,
        TestData.productWithAssignments,
        {...TestData.productForHank, assignments: [
            TestData.assignmentForHank,
            {...TestData.assignmentForPerson1, productId: TestData.productForHank.id},
        ]},
    ];

    it('should not show the product link icon when there is no url', () => {
        renderProductCard({...emptyProduct(), name: 'testProduct'});
        expect(screen.queryAllByTestId('productUrl').length).toEqual(0);
    });

    it('should show the product link icon when there is a url', () => {
        renderProductCard({...emptyProduct(), name: 'testProduct', url: 'any old url'});
        expect(screen.queryAllByTestId('productUrl').length).toEqual(1);
    });

    it('should open url when product name is clicked', async () => {
        window.open = jest.fn();
        const expectedUrl = 'www.any-old-url.com'
        renderProductCard({...emptyProduct(), name: 'testProduct', url: expectedUrl });

        fireEvent.click(await screen.findByTestId('productName'));

        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open).toHaveBeenCalledWith(expectedUrl);
    });

    it('archiving a product sets the appropriate fields in the product and moves all people to unassigned', async () => {
        const may13String = moment(mayFourteenth2020).subtract(1, 'day').format('YYYY-MM-DD');
        const may14String = moment(mayFourteenth2020).format('YYYY-MM-DD');
        const testProduct = {...TestData.productWithAssignments, assignments: [TestData.assignmentForPerson1, TestData.assignmentForPerson2, TestData.assignmentForPerson3]};

        ProductClient.editProduct = jest.fn().mockResolvedValue({data: {...testProduct, endDate: may13String}});

        renderProductCard(testProduct);

        fireEvent.click(await screen.findByTestId(createDataTestId('editProductIcon', TestData.productWithAssignments.name)));
        fireEvent.click(await screen.findByText('Archive Product'));
        fireEvent.click(screen.getByText('Archive'));

        await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(3));
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [{productId: TestData.productForHank.id, placeholder: false}], TestData.space, TestData.person1);
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [], TestData.space, TestData.person2);
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [], TestData.space, TestData.person3);
        expect(ProductClient.editProduct).toHaveBeenCalledTimes(1);
        expect(ProductClient.editProduct).toHaveBeenCalledWith(TestData.space, {...testProduct, endDate: may13String});
    });

    it('should show a confirmation modal when Archive Person is clicked, and be able to close it', async () => {
        renderProductCard(TestData.productWithAssignments);
        expectEditMenuContents(false);

        const editProductSelector = createDataTestId('editProductIcon', TestData.productWithAssignments.name)
        fireEvent.click(screen.getByTestId(editProductSelector));
        expectEditMenuContents(true);

        fireEvent.click(screen.getByText('Archive Product'));
        expect(await screen.findByText('Are you sure?')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel'));
        expect(await screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });

    function renderProductCard(product: Product) {
        renderWithRecoil(
            <ProductCard product={product}/>,
            ({set}) => {
                set(ViewingDateState, mayFourteenth2020);
                set(ProductsState, products);
                set(CurrentSpaceState, TestData.space)
            }
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