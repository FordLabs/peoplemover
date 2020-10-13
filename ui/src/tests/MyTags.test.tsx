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
import {act, findByTestId, findByText, fireEvent, queryByText, RenderResult} from '@testing-library/react';
import LocationClient from '../Locations/LocationClient';
import ProductTagClient from '../ProductTag/ProductTagClient';

describe('PeopleMover My Tags', () => {
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

    it('Should open My Tags modal on click of text', async () => {
        await app.findByTestId('myTagsModal');
    });

    it('Should contain all location tags available in the space in alphabetical order', async () => {
        const locationTags: Array<HTMLSpanElement> = await app.findAllByTestId('givenlocationName');
        expect(locationTags.length).toEqual(4);

        expect(locationTags[0].innerHTML).toEqual(TestUtils.annarbor.name);
        expect(locationTags[1].innerHTML).toEqual(TestUtils.dearborn.name);
        expect(locationTags[2].innerHTML).toEqual(TestUtils.detroit.name);
        expect(locationTags[3].innerHTML).toEqual(TestUtils.southfield.name);
    });

    it('Should contain all product tags available in the space', async () => {
        const modalContainer = await app.findByTestId('modalContainer');
        for (const productTag of TestUtils.productTags) {
            await findByText(modalContainer, productTag.name);
        }
    });

    describe('Editing a tag', () => {

        describe('Editing a location tag', () => {
            let locationTagIcon: HTMLElement;

            beforeEach(async () => {
                const editIcons = await app.findAllByTestId('locationEditIcon');
                locationTagIcon = editIcons[0];
            });

            it('should show edit section when clicking the pencil next to tag', async () => {
                fireEvent.click(locationTagIcon);
                await app.findByTestId('saveTagButton');
            });

            it('should auto-populate location name field when opening edit role section', async () => {
                fireEvent.click(locationTagIcon);
                await app.findByTestId('saveTagButton');

                const modalContainer = await app.findByTestId('modalContainer');
                const editLocationTagText: HTMLInputElement = await findByTestId(modalContainer, 'tagNameInput') as HTMLInputElement;
                expect(editLocationTagText.value).toEqual('Ann Arbor');
            });

            it('should call edit Location client and then display the updated location', async () => {
                const updatedLocation = 'Saline';
                fireEvent.click(locationTagIcon);

                await app.findByTestId('saveTagButton');

                const editLocationTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(editLocationTagText, {target: {value: updatedLocation}});

                const saveButton = await app.findByTestId('saveTagButton');
                fireEvent.click(saveButton);

                await app.findByText(updatedLocation);

                const modalContainer = await app.findByTestId('modalContainer');
                expect(queryByText(modalContainer, 'Ann Arbor')).not.toBeInTheDocument();
            });

            it('should display error message when location with existed name is edited', async () => {
                LocationClient.edit = jest.fn(() => Promise.reject({
                    response: { status: 409 },
                }));

                const updatedLocation = 'detroit';
                fireEvent.click(locationTagIcon);

                await app.findByTestId('saveTagButton');

                const editLocationTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(editLocationTagText, {target: {value: updatedLocation}});

                const saveButton = await app.findByTestId('saveTagButton');
                fireEvent.click(saveButton);

                await app.findByText('A location with this name already exists. Enter a different name.');
            });
        });

        describe('editing a product tag', () => {
            let productTagIcon: HTMLElement;
            let editIcons: Array<HTMLElement>;

            beforeEach(async () => {
                editIcons = await app.findAllByTestId('producttagEditIcon');
                productTagIcon = editIcons[0];
                fireEvent.click(productTagIcon);

                await app.findByTestId('saveTagButton');
            });

            it('should call ProductTag client to edit a tag and then display the updated product tag', async () => {
                const updatedProductTag = 'Finance';

                const editProductTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(editProductTagText, {target: {value: updatedProductTag}});

                const saveButton =  await app.findByTestId('saveTagButton');
                fireEvent.click(saveButton);

                await app.findByText(updatedProductTag);

                const modalContainer = await app.findByTestId('modalContainer');
                expect(queryByText(modalContainer, 'FordX')).not.toBeInTheDocument();
            });

            it('should display error message when you try to edit product tag to have some existed tag name', async () => {
                ProductTagClient.edit = jest.fn(() => Promise.reject({
                    response: { status: 409 },
                }));

                const updatedProductTag = 'av';

                const editProductTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(editProductTagText, {target: {value: updatedProductTag}});

                const saveButton = await app.findByTestId('saveTagButton');
                fireEvent.click(saveButton);

                await app.findByText('A product tag with this name already exists. Enter a different name.');
            });

            it('should display error message only for corresponding edit product tag section', async () => {
                ProductTagClient.edit = jest.fn(() => Promise.reject({
                    response: { status: 409 },
                }));

                const updatedProductTag = 'av';

                const editProductTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(editProductTagText, {target: {value: updatedProductTag}});

                const secondEditProductTagIcon = editIcons[1];
                fireEvent.click(secondEditProductTagIcon);

                const saveButton = await app.findByTestId('saveTagButton');
                fireEvent.click(saveButton);

                const errorMessage = await app.findAllByText('A product tag with this name already exists. Enter a different name.');
                expect(errorMessage.length).toEqual(1);
            });
        });
    });

    describe('delete a tag', () => {

        describe('delete a location tag', () => {
            let locationTagDeleteIcon: HTMLElement;
            const deleteLocationWarning = 'Deleting this location will remove it from any product that has been given this location.';

            beforeEach(async () => {
                const deleteIcons = await app.findAllByTestId('locationDeleteIcon');
                locationTagDeleteIcon = deleteIcons[0];
                fireEvent.click(locationTagDeleteIcon);

                await app.findByText(deleteLocationWarning);
            });

            it('should not remove location tag when clicking cancel button in confirmation modal', async () => {
                const cancelButton = await app.findByText('Cancel');
                fireEvent.click(cancelButton);

                const modalContainer = await app.findByTestId('modalContainer');
                await findByText(modalContainer, 'Ann Arbor');
            });

            it('should remove location tag when clicking delete button in confirmation modal', async () => {
                const deleteButton = await app.findByText('Delete');
                fireEvent.click(deleteButton);

                const modalContainer = await app.findByTestId('modalContainer');
                expect(queryByText(modalContainer, 'Ann Arbor')).not.toBeInTheDocument();
            });
        });

        describe('delete a product tag', () => {
            let productTagDeleteIcon: HTMLElement;
            const deleteProductTagWarning = 'Deleting this product tag will remove it from any product that has been given this product tag.';

            beforeEach(async () => {
                const deleteIcons = await app.findAllByTestId('producttagDeleteIcon');
                productTagDeleteIcon = deleteIcons[0];

                fireEvent.click(productTagDeleteIcon);
                await app.findByText(deleteProductTagWarning);
            });

            it('should remove product tag when clicking delete button in confirmation modal', async () => {
                const deleteButton = await app.findByText('Delete');
                fireEvent.click(deleteButton);

                const modalContainer = await app.findByTestId('modalContainer');
                expect(queryByText(modalContainer, 'AV')).not.toBeInTheDocument();
            });

            it('should not remove product tag when clicking cancel button in confirmation modal', async () => {
                const cancelButton = await app.findByText('Cancel');
                fireEvent.click(cancelButton);

                const modalContainer = await app.findByTestId('modalContainer');
                await findByText(modalContainer, 'AV');
            });

        });
    });

    describe('adding a new tag', () => {
        it('should contain add new tag options in My Tags modal', async () => {
            await app.findByText('Add New Product Tag');
            await app.findByText('Add New Location');
        });

        describe('adding a location tag', () => {
            beforeEach(async () => {
                const addNewLocationButton = await app.findByText('Add New Location');
                fireEvent.click(addNewLocationButton);
            });

            it('should open add tag section when add new tag option is clicked in Location Tags', async () => {
                await app.findByTestId('saveTagButton');
            });

            it('should create new location tag and show it in a modal', async () => {
                const newLocation = 'Ahmedabad';
                const saveButton = await app.findByTestId('saveTagButton');

                const addLocationTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(addLocationTagText, {target: {value: newLocation}});

                fireEvent.click(saveButton);

                await app.findByText(newLocation);
                expect(app.queryByText('Save')).not.toBeInTheDocument();
            });

            it('should show duplicate error message when trying to add any existing location tag', async () => {
                LocationClient.add = jest.fn( () => Promise.reject({
                    response: { status: 409 },
                }));
                const newLocation = 'Detroit';
                const saveButton = await app.findByTestId('saveTagButton');

                const addLocationTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(addLocationTagText, {target: {value: newLocation}});

                fireEvent.click(saveButton);

                await app.findByText('A location with this name already exists. Enter a different name.');
            });
        });

        describe('adding a product tag', () => {
            beforeEach(async () => {
                const addNewProductTagButton = await app.findByText('Add New Product Tag');
                fireEvent.click(addNewProductTagButton);
            });

            it('should open add tag section when add new tag option is clicked in Product Tags', async () => {
                await app.findByTestId('saveTagButton');
            });

            it('should create new product tag and show it in a modal', async () => {
                const newProductTag = 'Fin Tech';
                const saveButton = await app.findByTestId('saveTagButton');

                const addProductTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(addProductTagText, {target: {value: newProductTag}});

                fireEvent.click(saveButton);

                await app.findByText(newProductTag);
                expect(app.queryByText('Save')).not.toBeInTheDocument();
            });

            it('should show duplicate error message when trying to add any existing product tag', async () => {
                ProductTagClient.add = jest.fn( () => Promise.reject({
                    response: { status: 409 },
                }));
                const newProductTagName = 'FordX';
                const saveButton = await app.findByTestId('saveTagButton');

                const addProductTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(addProductTagText, {target: {value: newProductTagName}});

                fireEvent.click(saveButton);

                await app.findByText('A product tag with this name already exists. Enter a different name.');
            });
        });
    });
});
