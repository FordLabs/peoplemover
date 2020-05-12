/*
 * Copyright (c) 2019 Ford Motor Company
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
import AssignmentForm from '../Assignments/AssignmentForm';
import {act, fireEvent} from '@testing-library/react';
import AssignmentClient from '../Assignments/AssignmentClient';
import TestUtils, {renderWithRedux, renderWithReduxEnzyme} from './TestUtils';
import selectEvent from 'react-select-event';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';

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
        const products = [TestUtils.unassignedProduct, TestUtils.productWithAssignments, TestUtils.productWithoutAssignments];

        await act(async () => {
            const component = <AssignmentForm products={products}
                initiallySelectedProduct={products[2]}/>;
            const initialState = {people: TestUtils.people};
            const wrapper = await renderWithRedux(component, undefined, initialState as PreloadedState<GlobalStateProps>);

            const labelElement = await wrapper.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await wrapper.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Person 2/, containerToFindOptionsIn);

            const productSelect = await wrapper.findByLabelText('Assign to');
            await selectEvent.select(productSelect, 'Product 1');
            const assignButton = await wrapper.findByText('Assign');
            fireEvent.click(assignButton);

            const spy = jest.spyOn(AssignmentClient, 'createAssignmentsUsingIds');
            expect(spy).toBeCalledTimes(1);
            expect(spy.mock.calls[0]).toEqual([200, [3, 1], [false, false]]);
        });
    });
});
