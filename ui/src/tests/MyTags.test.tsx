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
import {act, findByTestId, findByText, fireEvent, queryByText, RenderResult} from '@testing-library/react';
import LocationClient from '../Locations/LocationClient';
import ProductTagClient from '../ProductTag/ProductTagClient';
import MyTagsForm from '../Tags/MyTagsForm';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';

describe('My Tags Form', () => {
    let app: RenderResult;
    const initialState: PreloadedState<GlobalStateProps> = {
        locations: TestUtils.locations,
        productTags: TestUtils.productTags,
        currentSpace: TestUtils.space,
        allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
    } as GlobalStateProps;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        await act(async () => {
            app = await renderWithRedux(<MyTagsForm/>, undefined, initialState);
        });
    });

    it('Should open My Tags modal on click of text', async () => {
        await app.findByTestId('myTagsModal');
    });

    it('should contain all location tags available in the space in the order they are provided', async () => {
        const locationTags: Array<HTMLSpanElement> = await app.findAllByTestId('tagName__location');
        expect(locationTags.length).toEqual(4);

        expect(locationTags[0].innerHTML).toEqual(TestUtils.annarbor.name);
        expect(locationTags[1].innerHTML).toEqual(TestUtils.detroit.name);
        expect(locationTags[2].innerHTML).toEqual(TestUtils.dearborn.name);
        expect(locationTags[3].innerHTML).toEqual(TestUtils.southfield.name);
    });

    it('Should contain all product tags available in the space', async () => {
        const myTagsModal = await app.findByTestId('myTagsModal');
        for (const productTag of TestUtils.productTags) {
            await findByText(myTagsModal, productTag.name);
        }
    });

    describe('Editing a tag', () => {

        describe('Editing a location tag', () => {
            let locationTagIcon: HTMLElement;

            beforeEach(async () => {
                const editIcons = await app.findAllByTestId('editIcon__location');
                locationTagIcon = editIcons[0];
            });

            it('should show edit section when clicking the pencil next to tag', async () => {
                fireEvent.click(locationTagIcon);
                await app.findByTestId('saveTagButton');
            });

            it('should auto-populate location name field when opening edit role section', async () => {
                fireEvent.click(locationTagIcon);
                await app.findByTestId('saveTagButton');

                const myTagsModal = await app.findByTestId('myTagsModal');
                const editLocationTagText: HTMLInputElement = await findByTestId(myTagsModal, 'tagNameInput') as HTMLInputElement;
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

                const myTagsModal = await app.findByTestId('myTagsModal');
                expect(queryByText(myTagsModal, 'Ann Arbor')).not.toBeInTheDocument();
            });

            it('should display error message when location with existing name is edited', async () => {
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

                await app.findByText('Oops! You already have this location. Please try using a different one.');
            });
        });

        describe('Editing a product tag', () => {
            let productTagIcon: HTMLElement;
            let editIcons: Array<HTMLElement>;

            beforeEach(async () => {
                editIcons = await app.findAllByTestId('editIcon__product_tag');
                productTagIcon = editIcons[0];
                fireEvent.click(productTagIcon);

                await app.findByTestId('saveTagButton');
            });

            it('should call Product Tag client to edit a tag and then display the updated product tag', async () => {
                const updatedProductTag = 'Finance';

                const editProductTagText = await app.findByTestId('tagNameInput');
                // @ts-ignore
                expect(editProductTagText.value).toBe('AV');
                fireEvent.change(editProductTagText, {target: {value: updatedProductTag}});

                const saveButton = await app.findByTestId('saveTagButton');
                fireEvent.click(saveButton);

                await app.findByText(updatedProductTag);

                const myTagsModal = await app.findByTestId('myTagsModal');
                expect(queryByText(myTagsModal, 'AV')).not.toBeInTheDocument();
            });

            it('should display error message only for corresponding edit product tag section', async () => {
                const editProductTagText = await app.findByTestId('tagNameInput');
                fireEvent.change(editProductTagText, {target: {value: TestUtils.productTag2.name}});
                const saveButton = await app.findByTestId('saveTagButton');
                expect(saveButton).toBeDisabled();

                const errorMessage = await app.findAllByText('Oops! You already have this product tag. Please try using a different one.');
                expect(errorMessage.length).toEqual(1);
            });
        });
    });

    describe('Delete a tag', () => {

        describe('delete a location tag', () => {
            let locationTagDeleteIcon: HTMLElement;
            const deleteLocationWarning = 'Deleting this location will remove it from any product that has been given this location.';

            beforeEach(async () => {
                const deleteIcons = await app.findAllByTestId('deleteIcon__location');
                locationTagDeleteIcon = deleteIcons[0];
                fireEvent.click(locationTagDeleteIcon);

                await app.findByText(deleteLocationWarning);
            });

            it('should not remove location tag when clicking cancel button in confirmation modal', async () => {
                const cancelButton = await app.findByText('Cancel');
                fireEvent.click(cancelButton);

                const myTagsModal = await app.findByTestId('myTagsModal');
                await findByText(myTagsModal, 'Ann Arbor');
            });

            it('should remove location tag when clicking delete button in confirmation modal', async () => {
                const deleteButton = await app.findByText('Delete');
                fireEvent.click(deleteButton);

                const myTagsModal = await app.findByTestId('myTagsModal');
                expect(queryByText(myTagsModal, 'Ann Arbor')).not.toBeInTheDocument();
            });
        });

        describe('Delete a product tag', () => {
            let productTagDeleteIcon: HTMLElement;
            const deleteProductTagWarning = 'Deleting this product tag will remove it from any product that has been given this product tag.';

            beforeEach(async () => {
                const deleteIcons = await app.findAllByTestId('deleteIcon__product_tag');
                productTagDeleteIcon = deleteIcons[0];

                fireEvent.click(productTagDeleteIcon);
                await app.findByText(deleteProductTagWarning);
            });

            it('should remove product tag when clicking delete button in confirmation modal', async () => {
                const deleteButton = await app.findByText('Delete');
                fireEvent.click(deleteButton);

                const myTagsModal = await app.findByTestId('myTagsModal');
                expect(queryByText(myTagsModal, 'AV')).not.toBeInTheDocument();
            });

            it('should not remove product tag when clicking cancel button in confirmation modal', async () => {
                const cancelButton = await app.findByText('Cancel');
                fireEvent.click(cancelButton);

                const myTagsModal = await app.findByTestId('myTagsModal');
                await findByText(myTagsModal, 'AV');
            });

        });
    });

    describe('Adding a new tag', () => {
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

                await app.findByText('Oops! You already have this location. Please try using a different one.');
            });
        });

        describe('Interaction between editing and creating location tag', () => {

            it('should not show pen and trash can when add new tag is clicked', async () => {
                expect(app.queryAllByTestId('editIcon__location').length).toEqual(4);
                expect(app.queryAllByTestId('deleteIcon__location').length).toEqual(4);

                const addNewLocationButton = await app.findByText('Add New Location');
                fireEvent.click(addNewLocationButton);

                expect(app.queryAllByTestId('editIcon__location').length).toEqual(0);
                expect(app.queryAllByTestId('deleteIcon__location').length).toEqual(0);
            });

            it('should not show pen and trash icons when editing location tag', async () => {
                expect(app.queryAllByTestId('editIcon__location').length).toEqual(4);
                expect(app.queryAllByTestId('deleteIcon__location').length).toEqual(4);
                fireEvent.click(app.queryAllByTestId('editIcon__location')[0]);

                expect(app.queryAllByTestId('editIcon__location').length).toEqual(0);
                expect(app.queryAllByTestId('deleteIcon__location').length).toEqual(0);
            });

            it('should have create location button disabled when editing location tag', async () => {
                fireEvent.click(app.queryAllByTestId('editIcon__location')[0]);

                const addNewLocationButton = await app.findByText('Add New Location');
                expect(addNewLocationButton).toBeDisabled();
            });
        });

        describe('Adding a product tag', () => {
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

                await app.findByText('Oops! You already have this product tag. Please try using a different one.');
            });
        });

        describe('Interaction between editing and creating product tag', () => {

            it('should not show pen and trash can when add new tag is clicked', async () => {
                expect(app.queryAllByTestId('editIcon__product_tag').length).toEqual(4);
                expect(app.queryAllByTestId('deleteIcon__product_tag').length).toEqual(4);

                const addNewLocationButton = await app.findByText('Add New Product Tag');
                fireEvent.click(addNewLocationButton);

                expect(app.queryAllByTestId('editIcon__product_tag').length).toEqual(0);
                expect(app.queryAllByTestId('deleteIcon__product_tag').length).toEqual(0);
            });

            it('should not show pen and trash icons when editing product tag', async () => {
                expect(app.queryAllByTestId('editIcon__product_tag').length).toEqual(4);
                expect(app.queryAllByTestId('deleteIcon__product_tag').length).toEqual(4);
                fireEvent.click(app.queryAllByTestId('editIcon__product_tag')[0]);

                expect(app.queryAllByTestId('editIcon__product_tag').length).toEqual(0);
                expect(app.queryAllByTestId('deleteIcon__product_tag').length).toEqual(0);
            });

            it('should have create product tag button disabled when editing product tag', async () => {
                fireEvent.click(app.queryAllByTestId('editIcon__product_tag')[0]);

                const addNewLocationButton = await app.findByText('Add New Product Tag');
                expect(addNewLocationButton).toBeDisabled();
            });
        });
    });
});
