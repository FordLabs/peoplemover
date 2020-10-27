/*
 * Copyright (c) 2020 Ford Motor Company
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
import TestUtils, {renderWithRedux} from './TestUtils';
import PeopleMover from '../Application/PeopleMover';
import {act, fireEvent, queryByText, RenderResult, wait} from '@testing-library/react';
import LocationClient from '../Locations/LocationClient';
import ProductTagClient from '../ProductTag/ProductTagClient';
import selectEvent from 'react-select-event';

describe('filter products', () => {
    let app: RenderResult;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        await act(async () => {
            app = renderWithRedux(<PeopleMover/>);
            const myTagsButton = await app.findByText('My Tags');
            fireEvent.click(myTagsButton);
        });
    });

    describe('add/edit/delete location tags should reflect in filter dropdown', () => {
        it('should show the newly added location tag from my tags modal', async () => {
            const addNewLocationButton = await app.findByText('Add New Location');
            fireEvent.click(addNewLocationButton);
            await app.findByTestId('saveTagButton');
            const newLocation = 'Ahmedabad';
            const saveButton = await app.findByTestId('saveTagButton');

            const addLocationTagText = await app.findByTestId('tagNameInput');
            fireEvent.change(addLocationTagText, {target: {value: newLocation}});

            fireEvent.click(saveButton);
            await app.findByText(newLocation);
            fireEvent.click(await app.findByTestId('modalCloseButton'));
            const location = await app.findByLabelText('Filter:');
            await selectEvent.openMenu(location);
            await app.findByText(newLocation);
        });

        it('should show the edited location tag from my tags modal', async () => {
            const editIcons = await app.findAllByTestId('editIcon__location');
            const locationTagIcon: HTMLElement = editIcons[0];
            fireEvent.click(locationTagIcon);

            await app.findByTestId('saveTagButton');

            const editLocationTagText = await app.findByTestId('tagNameInput');
            const updatedLocation = 'Saline';
            fireEvent.change(editLocationTagText, {target: {value: updatedLocation}});

            const saveButton = await app.findByTestId('saveTagButton');
            fireEvent.click(saveButton);

            await app.findByText(updatedLocation);

            const modalContainer = await app.findByTestId('modalContainer');
            expect(queryByText(modalContainer, 'Ann Arbor')).not.toBeInTheDocument();
            fireEvent.click(await app.findByTestId('modalCloseButton'));
            const location = await app.findByLabelText('Filter:');
            await selectEvent.openMenu(location);
            await app.findByText(updatedLocation);
        });

        it('should remove filter location when location is deleted from my tags modal', async () => {
            let locationTagDeleteIcon: HTMLElement;
            const deleteLocationWarning = 'Deleting this location will remove it from any product that has been given this location.';

            const deleteIcons = await app.findAllByTestId('deleteIcon__location');
            locationTagDeleteIcon = deleteIcons[0];
            fireEvent.click(locationTagDeleteIcon);

            await app.findByText(deleteLocationWarning);
            const deleteButton = await app.findByText('Delete');
            fireEvent.click(deleteButton);

            const modalContainer = await app.findByTestId('modalContainer');
            expect(queryByText(modalContainer, 'Ann Arbor')).not.toBeInTheDocument();
            fireEvent.click(await app.findByTestId('modalCloseButton'));
            const location = await app.findByLabelText('Filter:');
            await selectEvent.openMenu(location);
            expect(queryByText(location, 'Ann Arbor')).not.toBeInTheDocument();
        });

        it('should show filter option when new location tag is created from edit product modal', async () => {
            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            await act(async () => {
                await createTag('Location', /Create "Ahmedabad"/, 'Ahmedabad');
                const productForm = await app.findByTestId('productForm');

                await wait(() => {
                    expect(LocationClient.add).toBeCalledTimes(1);
                });
                expect(productForm).toHaveFormValues({location: '11'});
            });

            fireEvent.click(await app.findByTestId('modalCloseButton'));
            const location = await app.findByLabelText('Filter:');
            await selectEvent.openMenu(location);
            await app.findByText('Ahmedabad');
        });
    });

    describe('add/edit/delete product tags should reflect in filter dropdown', () => {
        it('should show filter option when new location tag is created from edit product modal', async () => {
            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            await act(async () => {
                await createTag('Product Tags', /Create "Fin Tech"/, 'Fin Tech');
                expect(ProductTagClient.add).toBeCalledTimes(1);

                const productForm = await app.findByTestId('productForm');
                expect(productForm).toHaveFormValues({productTags: '9_Fin Tech'});
            });
            fireEvent.click(await app.findByTestId('modalCloseButton'));
            const productTag = await app.findByLabelText('Filter:');
            await selectEvent.openMenu(productTag);
            await app.findByText('Fin Tech');
        });

        it('should show the newly added product tag from my tags modal', async () => {
            const addNewProductTagButton = await app.findByText('Add New Product Tag');
            fireEvent.click(addNewProductTagButton);
            const newProductTag = 'Fin Tech';
            const saveButton = await app.findByTestId('saveTagButton');

            const addProductTagText = await app.findByTestId('tagNameInput');
            fireEvent.change(addProductTagText, {target: {value: newProductTag}});

            fireEvent.click(saveButton);

            await app.findByText(newProductTag);
            fireEvent.click(await app.findByTestId('modalCloseButton'));
            const productTag = await app.findByLabelText('Filter:');
            await selectEvent.openMenu(productTag);
            await app.findByText(newProductTag);
        });

        it('should show the edited product tag from my tags modal', async () => {
            let editIcons: Array<HTMLElement> = await app.findAllByTestId('editIcon__product_tag');
            let productTagIcon: HTMLElement = editIcons[0];
            fireEvent.click(productTagIcon);
            await app.findByTestId('saveTagButton');
            const updatedProductTag = 'Finance';

            const editProductTagText = await app.findByTestId('tagNameInput');
            fireEvent.change(editProductTagText, {target: {value: updatedProductTag}});

            const saveButton = await app.findByTestId('saveTagButton');
            fireEvent.click(saveButton);

            await app.findByText(updatedProductTag);

            const modalContainer = await app.findByTestId('modalContainer');
            expect(queryByText(modalContainer, 'FordX')).not.toBeInTheDocument();

            fireEvent.click(await app.findByTestId('modalCloseButton'));
            const productTag = await app.findByLabelText('Filter:');
            await selectEvent.openMenu(productTag);
            await app.findByText(updatedProductTag);
        });

        it('should remove filter option when product tag is deleted from my tags modal', async () => {
            let productTagDeleteIcon: HTMLElement;
            const deleteProductTagWarning = 'Deleting this product tag will remove it from any product that has been given this product tag.';
            const deleteIcons = await app.findAllByTestId('deleteIcon__product_tag');
            productTagDeleteIcon = deleteIcons[0];

            fireEvent.click(productTagDeleteIcon);
            await app.findByText(deleteProductTagWarning);
            const deleteButton = await app.findByText('Delete');
            fireEvent.click(deleteButton);

            const modalContainer = await app.findByTestId('modalContainer');
            expect(queryByText(modalContainer, 'AV')).not.toBeInTheDocument();

            fireEvent.click(await app.findByTestId('modalCloseButton'));
            const productTag = await app.findByLabelText('Filter:');
            await selectEvent.openMenu(productTag);
            expect(queryByText(productTag, 'AV')).not.toBeInTheDocument();
        });

    });

    async function createTag(label: string, createOptionText: RegExp, option: string): Promise<void> {
        const productTagsLabelElement = await app.findByLabelText(label);
        const containerToFindOptionsIn = {
            container: await app.findByTestId('productForm'),
            createOptionText,
        };
        await selectEvent.create(productTagsLabelElement, option, containerToFindOptionsIn);
    }
});
