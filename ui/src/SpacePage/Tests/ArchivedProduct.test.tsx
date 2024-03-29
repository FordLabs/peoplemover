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
import ArchivedProduct from '../ArchiveProductsDrawer/ArchivedProduct/ArchivedProduct';
import TestUtils, {renderWithRecoil} from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import {fireEvent, screen} from '@testing-library/react';

jest.mock('Services/Api/SpaceClient');
jest.mock('Services/Api/ProductClient');
jest.mock('Services/Api/AssignmentClient');
jest.mock('Services/Api/RoleClient');
jest.mock('Services/Api/LocationClient');
jest.mock('Services/Api/PersonTagClient');
jest.mock('Services/Api/ProductTagClient');

describe('Archive Products', () => {
    describe('integration tests', () => {
        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent();
        });

        it('has the archived products drawer closed by default', async () => {
            expect(screen.queryByText('I am archived')).not.toBeInTheDocument();
        });
    
        it('shows the archived product drawer when the handle is clicked', async () => {
            const productArchivedDrawerCaret = await screen.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(productArchivedDrawerCaret);
            await screen.findByText('I am archived');
        });
    
        it('hides the archived product drawer when the handle is clicked again', async () => {
            const drawerCaret = await screen.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);
            await screen.findByText('I am archived');

            fireEvent.click(drawerCaret);
            expect(screen.queryByText('I am archived')).toBeNull();
        });
    
        it('should open the edit product modal if you click an archived product', async () => {
            const drawerCaret = await screen.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);
            fireEvent.click(screen.getByTestId('archivedProduct_4'));

            await screen.findByText('Edit Product');
            expect(screen.getByLabelText('Name')).toHaveValue('I am archived');
        });

        it('displays a badge with the number of archived products', async () => {
            expect((await screen.findByTestId('archivedProductsDrawerCountBadge')).innerHTML).toEqual('1');
        });
    });
    
    describe('component that summarizes a product in the graveyard', () => {
        it('should render the number of people on the product', () => {
            renderWithRecoil(<ArchivedProduct product={TestData.productWithAssignments}/>);
            expect(screen.getByText('1')).toBeInTheDocument();
        });
    
        it('should render the product name', () => {
            renderWithRecoil(<ArchivedProduct product={TestData.productWithAssignments}/>);
            expect(screen.getByText('Product 1')).toBeInTheDocument();
        });
    
        it('should render the product type', () => {
            renderWithRecoil(<ArchivedProduct product={TestData.productWithAssignments}/>);
            expect(screen.getByText('Southfield')).toBeInTheDocument();
        });
    });
});
