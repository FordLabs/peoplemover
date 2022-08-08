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
    const addProductButtonText = 'Add Product';
    const addProductModalTitle = 'Add New Product';

    describe('Home page', () => {
        it('opens ProductForm with correct placeholder text in input fields', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByLabelText('Name');

            await screen.findByPlaceholderText('e.g. Product 1');
            await screen.findByText('Add product tags');
            await screen.findByText('Add a location tag');
        });

        it('opens ProductForm component when button clicked', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByText(addProductModalTitle);
        });

        it('opens ProductForm with product tag field', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByText(addProductModalTitle);
            await screen.findByLabelText('Product Tags');
        });

        it('should show duplicate product name warning when user tries to create product with same name', async () => {
            ProductClient.createProduct = jest.fn(() => Promise.reject({
                response: {
                    status: 409,
                },
            }));
            await TestUtils.renderPeopleMoverComponent();

            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByText(addProductModalTitle);
            fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Product 1'}});

            fireEvent.click(screen.getByText('Add'));
            await screen.findByText('A product with this name already exists. Please enter a different name.');
        });

        it('should show duplicate product name warning when user tries to edit product with same name', async () => {
            ProductClient.editProduct = jest.fn().mockRejectedValue({ response: { status: 409 } });
            await TestUtils.renderPeopleMoverComponent();

            const editProductMenuButton = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(editProductMenuButton);

            const editProductOption = await screen.findByTestId('editMenuOption__edit_product');
            fireEvent.click(editProductOption);

            await screen.findByText('Edit Product');

            const nameInputField = await screen.findByLabelText('Name');
            fireEvent.change(nameInputField, {target: {value: 'Product 3'}});

            fireEvent.click(screen.getByText('Save'));
            await screen.findByText('A product with this name already exists. Please enter a different name.');
        });

        it('should show length of notes on initial render', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const editProductMenuButton = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(editProductMenuButton);

            const editProductOption = await screen.findByTestId('editMenuOption__edit_product');
            fireEvent.click(editProductOption);

            const notesFieldText = await screen.findByTestId('notesFieldText');
            const expectedNotes = TestData.productWithAssignments.notes || '';
            expect(notesFieldText.innerHTML).toContain(expectedNotes.length.toString());
        });

        it('displays people on each product', async () => {
            await TestUtils.renderPeopleMoverComponent();
            await screen.findByText('Person 1');
        });

        it('displays persons role on each assignment', async () => {
            await TestUtils.renderPeopleMoverComponent();
            await screen.findByText('Person 1');
            await screen.findByText('Software Engineer');
            expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
        });
    });

    describe('Deleting a product', () => {
        it('should show a delete button in the product modal', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const editProduct3Button = await screen.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await screen.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);

            await screen.findByText('Delete Product');
        });

        it('should show the confirmation modal when a deletion is requested', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const editProduct3Button = await screen.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await screen.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);
            fireEvent.click(screen.getByText('Delete Product'));

            await screen.findByText('Delete');
        });

        it('should call the product client with the product when a deletion is requested', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const editProduct3Button = await screen.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await screen.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);
            const deleteProductButton = await screen.findByText('Delete Product');
            fireEvent.click(deleteProductButton);
            const deleteButton = await screen.findByText('Delete');
            fireEvent.click(deleteButton);
            await waitFor(() => expect(ProductClient.deleteProduct).toBeCalledTimes(1));
            expect(ProductClient.deleteProduct).toBeCalledWith(TestData.space, TestData.productWithoutAssignments);
        });

        it('should not show archive button option in delete modal if product is already archived', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const drawerCaret = await screen.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);

            const archivedProductButton = await screen.findByTestId('archivedProduct_4');
            fireEvent.click(archivedProductButton);
            await screen.findByText('Edit Product');
            const deleteProductButton = await screen.findByText('Delete Product');
            fireEvent.click(deleteProductButton);
            expect(screen.queryByText('Archive')).not.toBeInTheDocument();
        });

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