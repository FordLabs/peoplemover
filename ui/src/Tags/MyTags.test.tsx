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
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import {findByTestId, findByText, fireEvent, queryByText, screen} from '@testing-library/react';
import LocationClient from '../Locations/LocationClient';
import ProductTagClient from './ProductTag/ProductTagClient';
import MyTagsForm from './MyTagsForm';
import {FilterType, FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';
import {RecoilRoot} from 'recoil';
import {LocationsState} from '../State/LocationsState';
import {ProductTagsState} from '../State/ProductTagsState';

jest.mock('Locations/LocationClient');

describe('My Tags Form', () => {
    const initialState = {
        currentSpace: TestData.space,
        allGroupedTagFilterOptions: TestData.allGroupedTagFilterOptions,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    const renderMyTagsForm = (filterType: FilterType): void => {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(LocationsState, TestData.locations)
                set(ProductTagsState, TestData.productTags)
            }}>
                <MyTagsForm filterType={filterType} />
            </RecoilRoot>,
            undefined,
            initialState
        );
    };

    describe('should contain expected contents', () => {
        it('should contain all location tags available in the space in the order they are provided', async () => {
            renderMyTagsForm(FilterTypeListings.Location);
            await screen.findByTestId('myTagsModal');
            const locationTags: Array<HTMLSpanElement> = await screen.findAllByTestId('tagName__location');
            expect(locationTags).toHaveLength(4);

            expect(locationTags[0].innerHTML).toEqual(TestData.annarbor.name);
            expect(locationTags[1].innerHTML).toEqual(TestData.dearborn.name);
            expect(locationTags[2].innerHTML).toEqual(TestData.detroit.name);
            expect(locationTags[3].innerHTML).toEqual(TestData.southfield.name);
        });

        it('Should contain all product tags available in the space', async () => {
            renderMyTagsForm(FilterTypeListings.ProductTag);
            const myTagsModal = await screen.findByTestId('myTagsModal');
            const productTags: Array<HTMLSpanElement> = await screen.findAllByTestId('tagName__product_tag');
            expect(productTags).toHaveLength(4);
            for (const productTag of TestData.productTags) {
                await findByText(myTagsModal, productTag.name);
            }
        });
    });

    describe('Editing a tag', () => {
        describe('Editing a location tag', () => {
            let locationTagIcon: HTMLElement;

            beforeEach(async () => {
                LocationClient.get = jest.fn().mockResolvedValue({
                    data: [
                        {id: 1, name: 'Saline', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'},
                        TestData.detroit, TestData.dearborn, TestData.southfield
                    ],
                });
                renderMyTagsForm(FilterTypeListings.Location);
                const editIcons = await screen.findAllByTestId('editIcon__location');
                locationTagIcon = editIcons[0];
            });

            it('should show edit section when clicking the pencil next to tag', async () => {
                fireEvent.click(locationTagIcon);
                await screen.findByTestId('saveTagButton');
            });

            it('should auto-populate location name field when opening edit role section', async () => {
                fireEvent.click(locationTagIcon);
                await screen.findByTestId('saveTagButton');

                const myTagsModal = await screen.findByTestId('myTagsModal');
                const editLocationTagText: HTMLInputElement = await findByTestId(myTagsModal, 'tagNameInput') as HTMLInputElement;
                expect(editLocationTagText.value).toEqual('Ann Arbor');
            });

            it('should call edit Location client and then display the updated location', async () => {
                const updatedLocation = 'Saline';
                fireEvent.click(locationTagIcon);

                await screen.findByTestId('saveTagButton');

                const editLocationTagText = await screen.findByTestId('tagNameInput');
                fireEvent.change(editLocationTagText, {target: {value: updatedLocation}});

                const saveButton = await screen.findByTestId('saveTagButton');
                fireEvent.click(saveButton);

                await screen.findByText(updatedLocation);

                const myTagsModal = await screen.findByTestId('myTagsModal');
                expect(queryByText(myTagsModal, 'Ann Arbor')).not.toBeInTheDocument();
            });

            it('should display error message when location with existing name is edited', async () => {
                LocationClient.edit = jest.fn().mockRejectedValue({ response: { status: 409 } });

                const updatedLocation = 'detroit';
                fireEvent.click(locationTagIcon);

                await screen.findByTestId('saveTagButton');

                const editLocationTagText = await screen.findByTestId('tagNameInput');
                fireEvent.change(editLocationTagText, {target: {value: updatedLocation}});

                const saveButton = await screen.findByTestId('saveTagButton');
                fireEvent.click(saveButton);

                await screen.findByText('Oops! You already have this location. Please try using a different one.');
            });
        });

        describe('Editing a product tag', () => {
            let productTagIcon: HTMLElement;
            let editIcons: Array<HTMLElement>;

            beforeEach(async () => {
                ProductTagClient.get = jest.fn().mockResolvedValue({
                    data: [
                        {id: 5, name: 'Finance', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'},
                        TestData.productTag2, TestData.productTag3, TestData.productTag4
                    ],
                });
                renderMyTagsForm(FilterTypeListings.ProductTag);
                editIcons = await screen.findAllByTestId('editIcon__product_tag');
                productTagIcon = editIcons[0];
                fireEvent.click(productTagIcon);

                await screen.findByTestId('saveTagButton');
            });

            it('should call Product Tag client to edit a tag and then display the updated product tag', async () => {
                const updatedProductTag = 'Finance';

                const editProductTagText = await screen.findByTestId('tagNameInput');
                expect(editProductTagText).toHaveValue('AV');
                fireEvent.change(editProductTagText, {target: {value: updatedProductTag}});

                const saveButton = await screen.findByTestId('saveTagButton');
                fireEvent.click(saveButton);

                await screen.findByText(updatedProductTag);

                const myTagsModal = await screen.findByTestId('myTagsModal');
                expect(queryByText(myTagsModal, 'AV')).not.toBeInTheDocument();
            });

            it('should display error message only for corresponding edit product tag section', async () => {
                const editProductTagText = await screen.findByTestId('tagNameInput');
                fireEvent.change(editProductTagText, {target: {value: TestData.productTag2.name}});
                const saveButton = await screen.findByTestId('saveTagButton');
                expect(saveButton).toBeDisabled();

                const errorMessage = await screen.findAllByText('Oops! You already have this product tag. Please try using a different one.');
                expect(errorMessage.length).toEqual(1);
            });
        });
    });

    describe('Delete a tag', () => {
        describe('delete a location tag', () => {
            let locationTagDeleteIcon: HTMLElement;
            const expectedDeleteLocationWarning = 'Deleting this location will remove it from anything that has been given this location.';

            beforeEach(async () => {
                LocationClient.get = jest.fn().mockResolvedValue({
                    data: [TestData.detroit, TestData.dearborn, TestData.southfield],
                });
                renderMyTagsForm(FilterTypeListings.Location);
                const deleteIcons = await screen.findAllByTestId('deleteIcon__location');
                locationTagDeleteIcon = deleteIcons[0];
                fireEvent.click(locationTagDeleteIcon);

                await screen.findByText(expectedDeleteLocationWarning);
            });

            it('should not remove location tag when clicking cancel button in confirmation modal', async () => {
                const cancelButton = await screen.findByText('Cancel');
                fireEvent.click(cancelButton);

                const myTagsModal = await screen.findByTestId('myTagsModal');
                await findByText(myTagsModal, 'Ann Arbor');
            });

            it('should remove location tag when clicking delete button in confirmation modal', async () => {
                const deleteButton = await screen.findByText('Delete');
                fireEvent.click(deleteButton);

                const myTagsModal = await screen.findByTestId('myTagsModal');
                expect(queryByText(myTagsModal, 'Ann Arbor')).not.toBeInTheDocument();
            });
        });

        describe('Delete a product tag', () => {
            let productTagDeleteIcon: HTMLElement;
            const deleteProductTagWarning = 'Deleting this product tag will remove it from anything that has been given this product tag.';

            beforeEach(async () => {
                ProductTagClient.get = jest.fn().mockResolvedValue({
                    data: [TestData.productTag2, TestData.productTag3, TestData.productTag4],
                });
                renderMyTagsForm(FilterTypeListings.ProductTag);
                const deleteIcons = await screen.findAllByTestId('deleteIcon__product_tag');
                productTagDeleteIcon = deleteIcons[0];

                fireEvent.click(productTagDeleteIcon);
                await screen.findByText(deleteProductTagWarning);
            });

            it('should remove product tag when clicking delete button in confirmation modal', async () => {
                const deleteButton = await screen.findByText('Delete');
                fireEvent.click(deleteButton);

                const myTagsModal = await screen.findByTestId('myTagsModal');
                expect(queryByText(myTagsModal, 'AV')).not.toBeInTheDocument();
            });

            it('should not remove product tag when clicking cancel button in confirmation modal', async () => {
                const cancelButton = await screen.findByText('Cancel');
                fireEvent.click(cancelButton);

                const myTagsModal = await screen.findByTestId('myTagsModal');
                await findByText(myTagsModal, 'AV');
            });

        });
    });

    describe('Adding a new tag', () => {

        describe('adding a location tag', () => {
            beforeEach(async () => {
                LocationClient.get = jest.fn().mockResolvedValue({
                    data: [
                        ...TestData.locations,
                        {id: 5, name: 'Ahmedabad', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'}
                    ],
                });
                renderMyTagsForm(FilterTypeListings.Location);
                const addNewLocationButton = await screen.findByText('Add New Location');
                fireEvent.click(addNewLocationButton);
            });

            it('should create new location tag and show it in a modal', async () => {
                const newLocation = 'Ahmedabad';
                await addTag(newLocation);
                await clickSaveButton();

                await screen.findByText(newLocation);
                expect(screen.queryByText('Save')).not.toBeInTheDocument();
            });

            it('should show duplicate error message when trying to add any existing location tag', async () => {
                LocationClient.add = jest.fn().mockRejectedValue({ response: { status: 409 } });
                const newLocation = 'Detroit';
                await addTag(newLocation);
                await clickSaveButton();

                await screen.findByText('Oops! You already have this location. Please try using a different one.');
            });
        });

        describe('Interaction between editing and creating location tag', () => {
            beforeEach(async () => {
                renderMyTagsForm(FilterTypeListings.Location);
                checkEditAndDeleteLocationIconCount(4);
            });

            it('should not show pen and trash can when add new tag is clicked', async () => {
                const addNewLocationButton = await screen.findByText('Add New Location');
                fireEvent.click(addNewLocationButton);
                checkEditAndDeleteLocationIconCount(0);
            });

            it('should not show pen and trash icons when editing location tag', async () => {
                clickFirstEditLocationIcon();
                checkEditAndDeleteLocationIconCount(0);
            });

            it('should have create location button disabled when editing location tag', async () => {
                clickFirstEditLocationIcon();
                const addNewLocationButton = await screen.findByTestId('addNewButton__location');
                expect(addNewLocationButton).toBeDisabled();
            });
        });

        describe('Adding a product tag', () => {
            beforeEach(async () => {
                ProductTagClient.get = jest.fn().mockResolvedValue({
                    data: [
                        ...TestData.productTags,
                        {id: 5, name: 'Fin Tech', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}
                    ],
                });
                renderMyTagsForm(FilterTypeListings.ProductTag);

                const addNewProductTagButton = await screen.findByText('Add New Product Tag');
                fireEvent.click(addNewProductTagButton);
            });

            it('should create new product tag and show it in a modal', async () => {
                const newProductTag = 'Fin Tech';
                await addTag(newProductTag);
                await clickSaveButton();

                await screen.findByText(newProductTag);
                expect(screen.queryByText('Save')).not.toBeInTheDocument();
            });

            it('should show duplicate error message when trying to add any existing product tag', async () => {
                ProductTagClient.add = jest.fn( ).mockResolvedValue({ response: { status: 409 } });
                const newProductTag = 'FordX';
                await addTag(newProductTag);
                await clickSaveButton();

                await screen.findByText('Oops! You already have this product tag. Please try using a different one.');
            });
        });

        describe('Interaction between editing and creating product tag', () => {
            beforeEach(async () => {
                renderMyTagsForm(FilterTypeListings.ProductTag);
                checkEditAndDeleteProductTagIconCount(4);
            });

            it('should not show pen and trash can when add new tag is clicked', async () => {
                const addNewLocationButton = await screen.findByText('Add New Product Tag');
                fireEvent.click(addNewLocationButton);
                checkEditAndDeleteProductTagIconCount(0);
            });

            it('should not show pen and trash icons when editing product tag', async () => {
                clickFirstEditProductTagIcon();
                checkEditAndDeleteProductTagIconCount(0);
            });

            it('should have create product tag button disabled when editing product tag', async () => {
                clickFirstEditProductTagIcon();
                const addNewProductTagButton = await screen.findByTestId('addNewButton__product_tag');
                expect(addNewProductTagButton).toBeDisabled();
            });
        });
    });
});

const checkEditAndDeleteLocationIconCount = (expectedCount: number) => {
    expect(screen.queryAllByTestId('editIcon__location')).toHaveLength(expectedCount);
    expect(screen.queryAllByTestId('deleteIcon__location')).toHaveLength(expectedCount);
}

const clickFirstEditLocationIcon = () => {
    fireEvent.click(screen.getAllByTestId('editIcon__location')[0]);
}

const checkEditAndDeleteProductTagIconCount = (expectedCount: number) => {
    expect(screen.queryAllByTestId('editIcon__product_tag')).toHaveLength(expectedCount);
    expect(screen.queryAllByTestId('deleteIcon__product_tag')).toHaveLength(expectedCount);
}

const clickFirstEditProductTagIcon = () => {
    fireEvent.click(screen.getAllByTestId('editIcon__product_tag')[0]);
}

const clickSaveButton = async () => {
    const saveButton = await screen.findByTestId('saveTagButton');
    fireEvent.click(saveButton);
}

const addTag = async (newTag: string) => {
    const tagTextInput = await screen.findByTestId('tagNameInput');
    fireEvent.change(tagTextInput, {target: {value: newTag}});
}
