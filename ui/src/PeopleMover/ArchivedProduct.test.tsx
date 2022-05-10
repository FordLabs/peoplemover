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
import ArchivedProduct from '../Products/ArchivedProduct';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import PeopleMover from './PeopleMover';
import {fireEvent, RenderResult, waitFor} from '@testing-library/react';
import {createBrowserHistory, History} from 'history';
import {MemoryRouter} from 'react-router-dom';

describe('Archive Products', () => {
    describe('integration tests', () => {
        let app: RenderResult;
        let history: History;

        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            history = createBrowserHistory();
            history.push('/uuid');

            await waitFor(() => {
                app = renderWithRedux(
                    <MemoryRouter >
                        <PeopleMover/>
                    </MemoryRouter>
                );
            });
        });

        it('has the archived products drawer closed by default', async () => {
            expect(app.queryByText('I am archived')).not.toBeInTheDocument();
        });
    
        it('shows the archived product drawer when the handle is clicked', async () => {
            const productArchivedDrawerCaret = await app.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(productArchivedDrawerCaret);
            await app.findByText('I am archived');
        });
    
        it('hides the archived product drawer when the handle is clicked again', async () => {
            const drawerCaret = await app.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);
            await app.findByText('I am archived');

            fireEvent.click(drawerCaret);
            expect(app.queryByText('I am archived')).toBeNull();
        });
    
        it('should open the edit product modal if you click an archived product', async () => {
            const drawerCaret = await app.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);
            fireEvent.click(app.getByTestId('archivedProduct_4'));

            await app.findByText('Edit Product');
            // @ts-ignore
            expect(app.getByLabelText('Name').value).toEqual('I am archived');
        });

        it('displays a badge with the number of archived products', async () => {
            expect((await app.findByTestId('archivedProductsDrawerCountBadge')).innerHTML).toEqual('1');
        });
    });
    
    describe('component that summarizes a product in the graveyard', () => {
        it('should render the number of people on the product', () => {
            const component = renderWithRedux(<ArchivedProduct product={TestUtils.productWithAssignments}/>);
            expect(component.getByText('1')).toBeInTheDocument();
        });
    
        it('should render the product name', () => {
            const component = renderWithRedux(<ArchivedProduct product={TestUtils.productWithAssignments}/>);
            expect(component.getByText('Product 1')).toBeInTheDocument();
        });
    
        it('should render the product type', () => {
            const component = renderWithRedux(<ArchivedProduct product={TestUtils.productWithAssignments}/>);
            expect(component.getByText('Southfield')).toBeInTheDocument();
        });
    });
});
