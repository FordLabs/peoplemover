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
import {RenderResult, wait} from '@testing-library/react';
import {Router} from 'react-router-dom';
import {createBrowserHistory, History} from 'history';
import selectEvent from 'react-select-event';
import SpaceClient from '../Space/SpaceClient';
import {GlobalStateProps} from '../Redux/Reducers';
import {PreloadedState, Store} from 'redux';

jest.mock('axios');

describe('PeopleMover', () => {
    let app: RenderResult;
    let history: History;
    const addProductButtonText = 'Add Product';

    function applicationSetup(store?: Store, initialState?: PreloadedState<GlobalStateProps>): RenderResult {
        let history = createBrowserHistory();
        history.push('/uuid');

        return renderWithRedux(
            <Router history={history}>
                <PeopleMover/>
            </Router>,
            store,
            initialState
        );
    }

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('Read Only Mode', function() {
        beforeEach(async () => {
            await wait(() => {
                let initialState = {
                    isReadOnly: true,
                    products: TestUtils.products,
                    currentSpace: TestUtils.space,
                } as GlobalStateProps;
                app = applicationSetup(undefined, initialState);
            });
        });

        it('should not show unassigned drawer', function() {
            // expect(app.queryAllByTestId('unassignedDrawer')).toHaveLength(1);
            expect(app.queryByTestId('unassignedDrawer')).toBeNull();
            expect(app.queryByTestId('archivedProductsDrawer')).toBeNull();
            expect(app.queryByTestId('reassignmentDrawer')).toBeNull();
        });
    });

    describe('Header and Footer Content', () => {
        beforeEach(async () => {
            await wait(() => {
                app = applicationSetup();
            });
        });

        it('Should contains My Tags on initial load of People Mover', async () => {
            await app.findByText('My Tags');
            await app.findByTestId('myTagsIcon');
        });

        it('should display My Roles button on startup', async () => {
            await app.findByText('My Roles');
            await app.findByTestId('myRolesIcon');
        });

        it('should display Sort By dropdown on startup', async () => {
            await app.findByText('Sort By:');
            await app.findByText('Alphabetical');
        });

        it('should display Filter option on startup', async () => {
            await app.findByText('Filter:');
        });

        it('should show the Flabs branding on load', async () => {
            await app.findByText('Powered by');
            await app.findByText('FordLabs');
        });

        it('should update the page title with the space name', () => {
            expect(document.title).toEqual('testSpace | PeopleMover');
        });
    });

    describe('Products', () => {
        beforeEach(async () => {
            await wait(() => {
                app = applicationSetup();
            });
        });

        it('should display products', async () => {
            await app.findAllByText(TestUtils.productWithAssignments.name);
            await app.findAllByText(TestUtils.productWithoutAssignments.name);
            await app.findAllByText(TestUtils.productForHank.name);
        });

        it('should sort products by name by default',  async () => {
            const productNameElements = await app.findAllByTestId('productName');
            const actualProductNames = productNameElements.map((element) => element.innerHTML);
            expect(actualProductNames).toEqual(
                [
                    TestUtils.productWithoutLocation.name,
                    TestUtils.productForHank.name,
                    TestUtils.productWithAssignments.name,
                    TestUtils.productWithoutAssignments.name,
                ]
            );
        });

        it('should group products by location',  async () => {
            await wait(() => {
                selectEvent.select(app.getByLabelText('Sort By:'), ['Location']);
            });

            const productGroups = await app.findAllByTestId('productGroup');

            expect(productGroups.length).toBe(4);
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

        it('should group products by product tag',  async () => {
            await wait(() => {
                selectEvent.select(app.getByLabelText('Sort By:'), ['Product Tag']);
            });

            const productGroups = await app.findAllByTestId('productGroup');

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

    describe('Routing', () => {
        const BAD_REQUEST = 400;
        const expectedSpaceUuid = 'somebadName';

        beforeEach(() => {
            jest.clearAllMocks();
            history = createBrowserHistory();
            history.push('/' + expectedSpaceUuid);
        });

        it('should route to 404 page when bad space name is provided',  async () => {
            SpaceClient.getSpaceFromUuid = jest.fn().mockRejectedValue({response: {status: BAD_REQUEST}});

            renderWithRedux(
                <Router history={history}>
                    <PeopleMover/>
                </Router>
            );

            expect(SpaceClient.getSpaceFromUuid).toHaveBeenCalledWith(expectedSpaceUuid);
            await wait(() => {
                expect(history.location.pathname).toEqual('/error/404');
            });
        });
    });
});
