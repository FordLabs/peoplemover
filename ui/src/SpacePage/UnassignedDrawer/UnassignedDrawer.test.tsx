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

import { Product } from '../../Types/Product';
import { renderWithRecoil } from '../../Utils/TestUtils';
import UnassignedDrawer from './UnassignedDrawer';
import { IsUnassignedDrawerOpenState } from '../../State/IsUnassignedDrawerOpenState';
import { ProductsState } from '../../State/ProductsState';
import { CurrentSpaceState } from '../../State/CurrentSpaceState';
import TestData from '../../Utils/TestData';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';

describe('Unassigned Drawer', () => {
    it('should hide the number of unassigned people when there are less than 1', async () => {
        const emptyUnassignedProduct: Product = {
            ...TestData.unassignedProduct,
            assignments: [],
            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        };
        renderWithUnassignedProduct([emptyUnassignedProduct]);

        await waitFor(() =>
            expect(screen.queryByTestId('countBadge')).toBeNull()
        );
    });

    it('should not show archived people as unassigned', async () => {
        renderWithUnassignedProduct([TestData.unassignedProduct]);

        await waitFor(() =>
            expect(screen.queryByText(TestData.archivedPerson.name)).toBeNull()
        );
    });

    it('should show an archived person as unassigned if their archive date has not passed', async () => {
        const product = {
            ...TestData.unassignedProduct,
            assignments: [TestData.assignmentForHank],
        };
        renderWithUnassignedProduct([product]);
        expect(screen.getByText(TestData.hank.name)).toBeDefined();
    });

    it('should render unassigned drawer as open when IsUnassignedDrawerOpenState flag is set to true', () => {
        renderWithUnassignedProduct([TestData.unassignedProduct], true);
        expect(screen.getByText(TestData.unassignedPerson.name)).toBeDefined();
    });

    it('should render unassigned drawer as closed when IsUnassignedDrawerOpenState flag is set to false', () => {
        renderWithUnassignedProduct([TestData.unassignedProduct], false);
        expect(screen.queryByText(TestData.unassignedPerson.name)).toBeNull();
    });
});

const renderWithUnassignedProduct = (
    products: Product[],
    isDrawerOpen = true
) => {
    renderWithRecoil(<UnassignedDrawer />, ({ set }) => {
        set(IsUnassignedDrawerOpenState, isDrawerOpen);
        set(ProductsState, products);
        set(CurrentSpaceState, TestData.space);
    });
};
