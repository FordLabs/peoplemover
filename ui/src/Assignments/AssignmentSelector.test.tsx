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
import AssignmentForm from './AssignmentForm';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import AssignmentClient from './AssignmentClient';
import TestUtils, {renderWithRecoil} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import selectEvent from 'react-select-event';
import moment from 'moment';
import {ViewingDateState} from '../State/ViewingDateState';
import {ProductsState} from '../State/ProductsState';
import {PeopleState} from '../State/PeopleState';
import {CurrentSpaceState} from '../State/CurrentSpaceState';

describe('The Assignment Form', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    it('renders the assignment form labels', () => {
        renderWithRecoil(
            <AssignmentForm initiallySelectedProduct={TestData.unassignedProduct} />,
            (({set}) => {
                set(ProductsState, [TestData.unassignedProduct])
                set(CurrentSpaceState, TestData.space)
            })
        );
        expect(screen.getByLabelText('Name')).toBeDefined();
        expect(screen.getByLabelText('Mark as Placeholder')).toBeDefined();
        expect(screen.getByLabelText('Assign to')).toBeDefined();
    });

    it('accepts changes to the assignment forms product list and can submit multiple assignments', async () => {
        const products = [TestData.unassignedProduct, TestData.productWithAssignments, TestData.productWithoutAssignments, TestData.productForHank];
        const viewingDate = new Date(2020, 5, 5);
        renderWithRecoil(
            <AssignmentForm initiallySelectedProduct={products[2]} />,
            (({set}) => {
                set(ViewingDateState, viewingDate)
                set(ProductsState, products)
                set(PeopleState, TestData.people)
                set(CurrentSpaceState, TestData.space)
            })
        );

        const labelElement = await screen.findByLabelText('Name');
        const containerToFindOptionsIn = { container: await screen.findByTestId('assignmentForm') };
        await selectEvent.select(labelElement, /Hank/, containerToFindOptionsIn);

        const productSelect = await screen.findByLabelText('Assign to');
        await selectEvent.select(productSelect, 'Product 1');
        const assignButton = await screen.findByText('Assign');
        fireEvent.click(assignButton);

        await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1));
            
        expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
            moment(viewingDate).format('YYYY-MM-DD'),
            [
                {
                    productId: TestData.productWithoutAssignments.id,
                    placeholder: false,
                },
                {
                    productId: TestData.productWithAssignments.id,
                    placeholder: false,
                },
                {
                    productId: TestData.productForHank.id,
                    placeholder: TestData.assignmentForHank.placeholder,
                },
            ],
            TestData.space,
            TestData.hank
        );
    });
});
