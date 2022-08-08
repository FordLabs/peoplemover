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

import {fireEvent, screen, waitFor} from '@testing-library/react';
import ProductClient from 'Services/Api/ProductClient';
import TestUtils from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import moment from 'moment';
import {ViewingDateState} from 'State/ViewingDateState';

jest.mock('Services/Api/ProductClient');
jest.mock('Services/Api/SpaceClient');
jest.mock('Services/Api/RoleClient');
jest.mock('Services/Api/AssignmentClient');
jest.mock('Services/Api/LocationClient');
jest.mock('Services/Api/ProductTagClient');
jest.mock('Services/Api/PersonTagClient');

describe('Products', () => {
    describe('Archiving a product via the delete modal', () => {
        it('should use the product client to archive products', async () => {
            ProductClient.editProduct = jest.fn().mockResolvedValue({});

            const viewingDate = new Date(2020, 6, 17);
            await TestUtils.renderPeopleMoverComponent((({set}) => {
                set(ViewingDateState, viewingDate)
            }));

            const editProduct3Button = await screen.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await screen.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);
            const deleteProductButton = await screen.findByText('Delete Product');
            fireEvent.click(deleteProductButton);
            const archiveButton = await screen.findByText('Archive');
            fireEvent.click(archiveButton);

            await waitFor(() => expect(ProductClient.editProduct).toBeCalledTimes(1));
            const cloneWithEndDateSet = JSON.parse(JSON.stringify(TestData.productWithoutAssignments));
            cloneWithEndDateSet.endDate = moment(viewingDate).subtract(1, 'day').format('YYYY-MM-DD');
            expect(ProductClient.editProduct).toBeCalledWith(TestData.space, cloneWithEndDateSet);
            await waitFor(() => expect(ProductClient.getProductsForDate).toHaveBeenCalledWith('uuid', viewingDate))
        });
    });

    describe('Edit Menu for Product', () => {
        it('should pop the edit menu options', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const myProductEllipsis = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductEllipsis);

            await screen.findByText('Edit Product');
            await screen.findByText('Archive Product');
        });

        it('should open edit modal when click on edit product', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const myProductEllipsis = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductEllipsis);

            const editProductMenuOption = await screen.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);
            await screen.findByText('Edit Product');
            await screen.findByText('Save');
        });

        it('should put product in archived products when clicking archive product', async () => {
            function updateGetAllProductsResponse(): void {
                const updatedProduct = {
                    ...TestData.productWithAssignments,
                    archived: true,
                };
                const updatedProducts = [
                    updatedProduct,
                    TestData.unassignedProduct,
                ];
                ProductClient.getProductsForDate = jest.fn().mockResolvedValue({ data: updatedProducts });
            }

            await TestUtils.renderPeopleMoverComponent();

            const myProductEllipsis = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductEllipsis);

            const archiveProductMenuOption = await screen.findByText('Archive Product');
            updateGetAllProductsResponse();
            fireEvent.click(archiveProductMenuOption);
            fireEvent.click(await screen.findByText('Archive'));
            await waitFor(() => {
                expect(screen.queryByText('Archive Product')).not.toBeInTheDocument();
                expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
            });
            const drawerCaret = await screen.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);
            await screen.findByText('Product 1');
        });
    });
});