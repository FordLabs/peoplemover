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
import TestUtils, {renderWithRedux} from './TestUtils';
import PeopleMover from '../Application/PeopleMover';
import {RenderResult, wait} from '@testing-library/react';
import {Router} from 'react-router-dom';
import {createBrowserHistory, History} from 'history';
import selectEvent from 'react-select-event';
import SpaceClient from '../Space/SpaceClient';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import {applyMiddleware, createStore, PreloadedState, Store} from 'redux';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import {createEmptySpace} from '../Space/Space';
import {AvailableActions} from '../Redux/Actions';
import thunk from 'redux-thunk';
declare let window: MatomoWindow;

jest.mock('axios');

describe('PeopleMover', () => {
    let app: RenderResult;
    let history: History;
    const addProductButtonText = 'Add Product';
    let store: Store;

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
        window._paq = [];
    });

    function getEventCount(eventString: string): number {
        let returnValue = 0;
        window._paq.forEach((event) => {
            if (event.includes(eventString)) {
                returnValue++;
            }
        });
        return returnValue;
    }

    describe('Read Only Mode', function() {
        beforeEach(async () => {
            await wait(() => {
                let initialState = {
                    isReadOnly: true,
                    products: TestUtils.products,
                    currentSpace: TestUtils.space,
                } as GlobalStateProps;
                store = createStore(rootReducer, initialState, applyMiddleware(thunk));
                app = applicationSetup(store, initialState);
            });
        });

        it('should not show unassigned drawer', function() {
            // expect(app.queryAllByTestId('unassignedDrawer')).toHaveLength(1);
            expect(app.queryByTestId('unassignedDrawer')).toBeNull();
            expect(app.queryByTestId('archivedProductsDrawer')).toBeNull();
            expect(app.queryByTestId('reassignmentDrawer')).toBeNull();
        });

        it('should trigger a matomo read-only visit event each time the current space changes', () => {
            const nextSpace = {...createEmptySpace(), name: 'newSpace'};

            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'viewOnlyVisit', '']);
            expect(window._paq).not.toContainEqual(['trackEvent', nextSpace.name, 'viewOnlyVisit', '']);
            expect(getEventCount('viewOnlyVisit')).toEqual(1);

            store.dispatch({ type: AvailableActions.SET_CURRENT_SPACE, space: nextSpace });

            expect(window._paq).toContainEqual(['trackEvent', nextSpace.name, 'viewOnlyVisit', '']);
            expect(getEventCount('viewOnlyVisit')).toEqual(2);
        });

        it('should not trigger a matomo read-only visit event if no space has been defined', () => {
            expect(getEventCount('viewOnlyVisit')).toEqual(1);

            store.dispatch({ type: AvailableActions.SET_CURRENT_SPACE, space: null });

            expect(getEventCount('viewOnlyVisit')).toEqual(1);
        });
    });

    describe('Header and Footer Content', () => {
        beforeEach(async () => {
            await wait(() => {
                app = applicationSetup(undefined, {viewingDate: new Date(2020, 10, 14),
                } as GlobalStateProps);
            });
        });

        it('Should contain calendar button', async () => {
            await app.findByText(/viewing:/i);
            await app.findByText(/November 14, 2020/);
        });

        it('Should contains My Tags on initial load of People Mover', async () => {
            await app.findByText('My Tags');
            await app.findByTestId('myTagsIcon');
        });

        it('should display My Roles button on startup', async () => {
            await app.findByText('Add Person');
            await app.findByTestId('addPersonIcon');
        });

        it('should display Add Person button on startup', async () => {
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
    });

    describe('New Header and Footer Content', () => {
        beforeEach(async () => {
            document.location.hash = '#newui';
            await wait(() => {
                app = applicationSetup(undefined, {viewingDate: new Date(2020, 10, 14),
                } as GlobalStateProps);
            });
        });

        afterEach(() => {
            document.location.hash = '';
        });

        it('Should contain calendar button', async () => {
            await app.findByText(/viewing:/i);
            await app.findByText(/calendar_today/);
            await app.findByText(/November 14, 2020/);
        });

        it('Should contains My Tags on initial load of People Mover', async () => {
            await app.findByText('My Tags');
            await app.findByTestId('myTagsIcon');
        });

        it('should display My Roles button on startup', async () => {
            await app.findByText('Add Person');
            await app.findByTestId('addPersonIcon');
        });

        it('should display Add Person button on startup', async () => {
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
    });

    describe('Read only view Header and Footer Content', () => {
        beforeEach(async () => {
            await wait(() => {
                app = applicationSetup(undefined, {isReadOnly: true} as GlobalStateProps);
            });
        });

        it('Should contains My Tags on initial load of People Mover', async () => {
            expect(await app.queryByText('My Tags')).not.toBeInTheDocument();
            expect(await app.queryByTestId('myTagsIcon')).not.toBeInTheDocument();
        });

        it('should display My Roles button on startup', async () => {
            expect(await app.queryByText('Add Person')).not.toBeInTheDocument();
            expect(await app.queryByTestId('addPersonIcon')).not.toBeInTheDocument();
        });

        it('should display Add Person button on startup', async () => {
            expect(await app.queryByText('My Roles')).not.toBeInTheDocument();
            expect(await app.queryByTestId('myRolesIcon')).not.toBeInTheDocument();
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
    });

    describe('Page Title', () => {
        beforeEach(async () => {
            await wait(() => {
                app = applicationSetup();
            });
        });

        it('should update the page title with the space name', () => {
            expect(document.title).toEqual('testSpace | PeopleMover');
        });

        it('should set the page title back to the default when the component is unmounted', () => {
            app.unmount();
            expect(document.title).toEqual('PeopleMover');
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
                selectEvent.select(app.getAllByLabelText('Sort By:')[0], ['Location']);
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
                selectEvent.select(app.getAllByLabelText('Sort By:')[0], ['Product Tag']);
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

    describe('Products in read only view', () => {
        beforeEach(async () => {
            await wait(() => {
                app = applicationSetup(undefined, {isReadOnly: true} as GlobalStateProps);
            });
        });

        it('should group products by location without add product buttons',  async () => {
            await wait(() => {
                selectEvent.select(app.getAllByLabelText('Sort By:')[0], ['Location']);
            });

            const productGroups = await app.findAllByTestId('productGroup');

            expect(productGroups.length).toBe(4);
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
            await wait(() => {
                selectEvent.select(app.getAllByLabelText('Sort By:')[0], ['Product Tag']);
            });

            const productGroups = await app.findAllByTestId('productGroup');

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

        it('should route to 403 page when user does not have access to a space', async () => {
            SpaceClient.getSpaceFromUuid = jest.fn().mockRejectedValue({response: {status: FORBIDDEN}});

            renderWithRedux(
                <Router history={history}>
                    <PeopleMover/>
                </Router>
            );

            expect(SpaceClient.getSpaceFromUuid).toHaveBeenCalledWith(expectedSpaceUuid);
            await wait(() => {
                expect(history.location.pathname).toEqual('/error/403');
            });
        });
    });
});
