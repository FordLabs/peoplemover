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
import AssignmentForm from './AssignmentForm';
import {act, fireEvent, screen} from '@testing-library/react';
import AssignmentClient from './AssignmentClient';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import selectEvent from 'react-select-event';
import moment from 'moment';

describe('the assignment form', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    it('renders the assignment form labels', () => {
        renderWithRedux(
            <AssignmentForm products={[TestUtils.unassignedProduct]}
                initiallySelectedProduct={TestUtils.unassignedProduct}/>,
        );
        expect(screen.getByLabelText('Name')).toBeDefined();
        expect(screen.getByLabelText('Mark as Placeholder')).toBeDefined();
        expect(screen.getByLabelText('Assign to')).toBeDefined();
    });

    it('accepts changes to the assignment forms product list and can submit multiple assignments', async () => {
        const products = [TestUtils.unassignedProduct, TestUtils.productWithAssignments, TestUtils.productWithoutAssignments, TestUtils.productForHank];
        const viewingDate = new Date(2020, 5, 5);

        await act(async () => {
            const component = <AssignmentForm products={products}
                initiallySelectedProduct={products[2]}/>;
            const initialState = {people: TestUtils.people, currentSpace: TestUtils.space, viewingDate: viewingDate};
            await renderWithRedux(component, undefined, initialState);

            const labelElement = await screen.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await screen.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Hank/, containerToFindOptionsIn);

            const productSelect = await screen.findByLabelText('Assign to');
            await selectEvent.select(productSelect, 'Product 1');
            const assignButton = await screen.findByText('Assign');
            fireEvent.click(assignButton);

            const spy = jest.spyOn(AssignmentClient, 'createAssignmentForDate');
            expect(spy).toBeCalledTimes(1);
            
            expect(spy).toBeCalledWith(
                moment(viewingDate).format('YYYY-MM-DD'),
                [
                    {
                        productId: TestUtils.productWithoutAssignments.id,
                        placeholder: false,
                    },
                    {
                        productId: TestUtils.productWithAssignments.id,
                        placeholder: false,
                    },
                    {
                        productId: TestUtils.productForHank.id,
                        placeholder: TestUtils.assignmentForHank.placeholder,
                    },
                ],
                TestUtils.space,
                TestUtils.hank
            );
            
        });
    });
});
