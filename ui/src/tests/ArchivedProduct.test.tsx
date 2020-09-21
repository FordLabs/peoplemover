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
import ArchivedProduct from '../Products/ArchivedProduct';
import TestUtils, {renderWithRedux} from './TestUtils';
import PeopleMover from '../Application/PeopleMover';
import {fireEvent} from '@testing-library/react';

describe('Archive Products', () => {
    describe('integration tests', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
        });

        it('has the archived products drawer closed by default', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);
    
            expect(app.queryByText('I am archived')).not.toBeInTheDocument();
        });
    
        it('shows the archived product drawer when the handle is clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const drawerCarets = await app.findAllByTestId('drawerCaret');
            // TODO: change to drawerCarets[2] after reinstating ReassignedDrawer
            const archivedDrawerCaret = drawerCarets[1];
            fireEvent.click(archivedDrawerCaret);
            await app.findByText('I am archived');
        });
    
        it('hides the archived product drawer when the handle is clicked again', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const drawerCarets = await app.findAllByTestId('drawerCaret');
            // TODO: change to drawerCarets[2] after reinstating ReassignedDrawer
            const archivedDrawerCaret = drawerCarets[1];
            fireEvent.click(archivedDrawerCaret);
            await app.findByText('I am archived');
    
            fireEvent.click(archivedDrawerCaret);
            expect(app.queryByText('I am archived')).toBeNull();
        });
    
        it('should open the edit product modal if you click an archived product', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const drawerCarets = await app.findAllByTestId('drawerCaret');
            // TODO: change to drawerCarets[2] after reinstating ReassignedDrawer
            const archivedDrawerCaret = drawerCarets[1];
            fireEvent.click(archivedDrawerCaret);
            fireEvent.click(app.getByTestId('archivedProduct_4'));

            await app.findByText('Edit Product');
            expect(app.getByLabelText('Name').value).toEqual('I am archived');
        });
    });
    
    describe('component that summarizes a product in the graveyard', () => {
        it('should render the number of peopleReducer on the product', () => {
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