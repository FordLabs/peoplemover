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
import {act, fireEvent} from '@testing-library/react';
import AssignmentClient from './AssignmentClient';
import TestUtils, {renderWithRedux, renderWithReduxEnzyme} from '../tests/TestUtils';
import selectEvent from 'react-select-event';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import moment from 'moment';

describe('the assignment form', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    it('renders the assignment form labels', () => {
        const wrapper = renderWithReduxEnzyme(
            <AssignmentForm products={[TestUtils.unassignedProduct]}
                initiallySelectedProduct={TestUtils.unassignedProduct}/>,
        );
        expect(wrapper.find('label').at(0).text()).toEqual('Name');
        expect(wrapper.find('label').at(1).text()).toEqual('Mark as Placeholder');
        expect(wrapper.find('label').at(2).text()).toEqual('Assign to');
    });

    it('accepts changes to the assignment forms product list and can submit multiple assignments', async () => {
        const products = [TestUtils.unassignedProduct, TestUtils.productWithAssignments, TestUtils.productWithoutAssignments, TestUtils.productForHank];
        const viewingDate = new Date(2020, 5, 5);

        await act(async () => {
            const component = <AssignmentForm products={products}
                initiallySelectedProduct={products[2]}/>;
            const initialState: PreloadedState<GlobalStateProps> = {people: TestUtils.people, currentSpace: TestUtils.space, viewingDate: viewingDate} as GlobalStateProps;
            const wrapper = await renderWithRedux(component, undefined, initialState);

            const labelElement = await wrapper.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await wrapper.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Hank/, containerToFindOptionsIn);

            const productSelect = await wrapper.findByLabelText('Assign to');
            await selectEvent.select(productSelect, 'Product 1');
            const assignButton = await wrapper.findByText('Assign');
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
