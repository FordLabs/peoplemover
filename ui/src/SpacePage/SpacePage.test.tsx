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

import TestUtils from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import {screen, waitFor} from '@testing-library/react';
import SpaceClient from '../Services/Api/SpaceClient';
import {ViewingDateState} from '../State/ViewingDateState';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import {ProductsState} from '../State/ProductsState';
import {LocationsState} from '../State/LocationsState';
import {CurrentSpaceState} from '../State/CurrentSpaceState';

jest.mock('Services/Api/SpaceClient');
jest.mock('Services/Api/ProductClient');
jest.mock('Services/Api/PeopleClient');
jest.mock('Services/Api/RoleClient');
jest.mock('Services/Api/AssignmentClient');
jest.mock('Services/Api/LocationClient');
jest.mock('Services/Api/ProductTagClient');
jest.mock('Services/Api/PersonTagClient');

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

describe('PeopleMover', () => {
    const addProductButtonText = 'Add Product';

    describe('Read Only Mode', function() {
        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent(({set}) => {
                set(IsReadOnlyState, true);
                set(ProductsState, TestData.products);
                set(CurrentSpaceState, TestData.space);
            });
        });

        it('should not show unassigned drawer', function() {
            expect(screen.queryByTestId('unassignedDrawer')).toBeNull();
            expect(screen.queryByTestId('archivedProductsDrawer')).toBeNull();
            expect(screen.queryByTestId('reassignmentDrawer')).toBeNull();
            expect(screen.queryByTestId('archivedPersonDrawer')).toBeNull();
        });

        it('should display Add Person button on startup', async () => {
            expect(await screen.queryByText('Add Person')).not.toBeInTheDocument();
            expect(await screen.queryByTestId('addPersonIcon')).not.toBeInTheDocument();
        });
    });

    describe('Header and Footer Content', () => {
        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent((({set}) => {
                set(ViewingDateState, new Date(2020, 10, 14))
            }));
        });

        it('Should contain calendar button', async () => {
            await screen.findByText(/viewing:/i);
            await screen.findByText(/calendar_today/);
            await screen.findByText(/Nov 14, 2020/);
        });

        it('should display Sort By dropdown on startup', async () => {
            await screen.findByText('Sort By:');
            await screen.findByText('Alphabetical');
        });

        it('should display Filter option on startup', async () => {
            await screen.findByText('Filter by:');
        });

        it('should show the Flabs branding on load', async () => {
            await screen.findByText('Powered by');
            await screen.findByText('FordLabs');
        });
    });

    describe('Read only view Header and Footer Content', () => {
        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent(({set}) => {
                set(IsReadOnlyState, true);
            });
        });

        it('Should contains My Tags on initial load of People Mover', async () => {
            expect(await screen.queryByText('My Tags')).not.toBeInTheDocument();
            expect(await screen.queryByTestId('myTagsIcon')).not.toBeInTheDocument();
        });

        it('should display My Roles button on startup', async () => {
            expect(await screen.queryByText('My Roles')).not.toBeInTheDocument();
            expect(await screen.queryByTestId('myRolesIcon')).not.toBeInTheDocument();
        });

        it('should display Sort By dropdown on startup', async () => {
            await screen.findByText('Sort By:');
            await screen.findByText('Alphabetical');
        });

        it('should display Filter option on startup', async () => {
            await screen.findByText('Filter by:');
        });

        it('should show the Flabs branding on load', async () => {
            await screen.findByText('Powered by');
            await screen.findByText('FordLabs');
        });
    });

    describe('Page Title', () => {
        let unmount: () => void;

        beforeEach(async () => {
            ({unmount} = await TestUtils.renderPeopleMoverComponent());
        });

        it('should update the page title with the space name', () => {
            expect(document.title).toEqual('testSpace | PeopleMover');
        });

        it('should set the page title back to the default when the component is unmounted', () => {
            unmount();
            expect(document.title).toEqual('PeopleMover');
        });
    });

    describe('Products', () => {
        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent();
        });

        it('should display products', async () => {
            await screen.findAllByText(TestData.productWithAssignments.name);
            await screen.findAllByText(TestData.productWithoutAssignments.name);
            await screen.findAllByText(TestData.productForHank.name);
        });

        it('should sort products by name by default',  async () => {
            const productNameElements = await screen.findAllByTestId('productName');
            const actualProductNames = productNameElements.map((element) => element.innerHTML);
            expect(actualProductNames).toEqual(
                [
                    TestData.productWithoutLocation.name,
                    TestData.productForHank.name,
                    TestData.productWithAssignments.name,
                    TestData.productWithoutAssignments.name,
                ]
            );
        });

        it('should include a properly formatted ID on the product cards', async () => {
            const expectedId = 'product-card-0'
            expect(screen.getByTestId(expectedId)).toHaveAttribute('id', expectedId);
        });

        it('should group products by location',  async () => {
            const sortByDropdownButton = await screen.findByTestId('sortByDropdownButton');
            sortByDropdownButton.click();

            const sortByDropdownLocation = await screen.findByTestId('sortDropdownOption_location');
            sortByDropdownLocation.click();

            const productGroups = await screen.findAllByTestId('productGroup');

            expect(productGroups).toHaveLength(4);
            const productGroup1 = productGroups[0];
            expect(productGroup1).toHaveTextContent('Ann Arbor');
            expect(productGroup1).toHaveTextContent('Hanky Product');
            expect(productGroup1).toHaveTextContent(addProductButtonText);

            const productGroup2 = productGroups[1];
            expect(productGroup2).toHaveTextContent('Dearborn');
            expect(productGroup2).toHaveTextContent('Product 3');
            expect(productGroup2).toHaveTextContent(addProductButtonText);

            const productGroup3 = productGroups[2];
            expect(productGroup3).toHaveTextContent('Southfield');
            expect(productGroup3).toHaveTextContent('Product 1');
            expect(productGroup3).toHaveTextContent(addProductButtonText);

            const productGroup4 = productGroups[3];
            expect(productGroup4).toHaveTextContent('No Location');
            expect(productGroup4).toHaveTextContent('Awesome Product');
            expect(productGroup4).toHaveTextContent(addProductButtonText);
        });

        it('should include a properly formatted ID on the product cards containing the value for the current groups sorted field', async () => {
            const expectedLocationId = 'ann-arbor';

            const sortByDropdownButton = await screen.findByTestId('sortByDropdownButton');
            sortByDropdownButton.click();

            const sortByDropdownLocation = await screen.findByTestId('sortDropdownOption_location');
            sortByDropdownLocation.click();

            const expectedId = `product-card-${expectedLocationId}-0`
            expect(screen.getByTestId(expectedId)).toHaveAttribute('id', expectedId);
        });

        it('should group products by product tag',  async () => {
            const sortByDropdownButton = await screen.findByTestId('sortByDropdownButton');
            sortByDropdownButton.click();

            const sortByDropdownLocation = await screen.findByTestId('sortDropdownOption_product-tag');
            sortByDropdownLocation.click();

            const productGroups = await screen.findAllByTestId('productGroup');

            expect(productGroups.length).toBe(3);
            const productGroup1 = productGroups[0];
            expect(productGroup1).toHaveTextContent('AV');
            expect(productGroup1).toHaveTextContent('Product 3');
            expect(productGroup1).toHaveTextContent(addProductButtonText);

            const productGroup2 = productGroups[1];
            expect(productGroup2).toHaveTextContent('FordX');
            expect(productGroup2).toHaveTextContent('Product 1');
            expect(productGroup2).toHaveTextContent(addProductButtonText);

            const productGroup3 = productGroups[2];
            expect(productGroup3).toHaveTextContent('No Product Tag');
            expect(productGroup3).toHaveTextContent('Hanky Product');
            expect(productGroup3).toHaveTextContent(addProductButtonText);
        });
    });

    describe('Products in read only view', () => {
        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent(({set}) => {
                set(IsReadOnlyState, true);
                set(LocationsState, TestData.locations);
            });
        });

        it('should group products by location without add product buttons',  async () => {
            const sortByDropdownButton = await screen.findByTestId('sortByDropdownButton');
            sortByDropdownButton.click();

            const sortByDropdownLocation = await screen.findByTestId('sortDropdownOption_location');
            sortByDropdownLocation.click();

            const productGroups = await screen.findAllByTestId('productGroup');

            expect(productGroups).toHaveLength(4);
            const productGroup1 = productGroups[0];
            expect(productGroup1).toHaveTextContent('Ann Arbor');
            expect(productGroup1).toHaveTextContent('Hanky Product');
            expect(productGroup1).not.toHaveTextContent(addProductButtonText);

            const productGroup2 = productGroups[1];
            expect(productGroup2).toHaveTextContent('Dearborn');
            expect(productGroup2).toHaveTextContent('Product 3');
            expect(productGroup2).not.toHaveTextContent(addProductButtonText);

            const productGroup3 = productGroups[2];
            expect(productGroup3).toHaveTextContent('Southfield');
            expect(productGroup3).toHaveTextContent('Product 1');
            expect(productGroup3).not.toHaveTextContent(addProductButtonText);

            const productGroup4 = productGroups[3];
            expect(productGroup4).toHaveTextContent('No Location');
            expect(productGroup4).toHaveTextContent('Awesome Product');
            expect(productGroup4).not.toHaveTextContent(addProductButtonText);
        });

        it('should group products by product tag without add product buttons',  async () => {
            const sortByDropdownButton = await screen.findByTestId('sortByDropdownButton');
            sortByDropdownButton.click();

            const sortByDropdownLocation = await screen.findByTestId('sortDropdownOption_product-tag');
            sortByDropdownLocation.click();

            const productGroups = await screen.findAllByTestId('productGroup');

            expect(productGroups.length).toBe(3);
            const productGroup1 = productGroups[0];
            expect(productGroup1).toHaveTextContent('AV');
            expect(productGroup1).toHaveTextContent('Product 3');
            expect(productGroup1).not.toHaveTextContent(addProductButtonText);

            const productGroup2 = productGroups[1];
            expect(productGroup2).toHaveTextContent('FordX');
            expect(productGroup2).toHaveTextContent('Product 1');
            expect(productGroup2).not.toHaveTextContent(addProductButtonText);

            const productGroup3 = productGroups[2];
            expect(productGroup3).toHaveTextContent('No Product Tag');
            expect(productGroup3).toHaveTextContent('Hanky Product');
            expect(productGroup3).not.toHaveTextContent(addProductButtonText);
        });
    });

    describe('Routing', () => {
        const BAD_REQUEST = 400;
        const FORBIDDEN = 403;
        const expectedSpaceUuid = 'bbbbbbbb-bbbb-bbbb-bbbb-SomeBadNames';
        const spaceUuidPath = '/' + expectedSpaceUuid

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should route to 404 page when bad space name is provided',  async () => {
            SpaceClient.getSpaceFromUuid = jest.fn().mockRejectedValue({response: {status: BAD_REQUEST}});
            await TestUtils.renderPeopleMoverComponent( undefined, spaceUuidPath);
            await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith('/error/404'));
        });

        it('should route to 403 page when user does not have access to a space', async () => {
            SpaceClient.getSpaceFromUuid = jest.fn().mockRejectedValue({response: {status: FORBIDDEN}});
            await TestUtils.renderPeopleMoverComponent(undefined, spaceUuidPath);
            await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith('/error/403'));
        });
    });
});