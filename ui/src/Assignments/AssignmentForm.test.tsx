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

import {fireEvent, getByText, screen, within} from '@testing-library/react';
import React from 'react';
import AssignmentForm from '../Assignments/AssignmentForm';
import AssignmentClient from '../Assignments/AssignmentClient';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import {createStore, Store} from 'redux';
import selectEvent from 'react-select-event';
import moment from 'moment';
import {setCurrentModalAction} from '../Redux/Actions';
import {AvailableModals} from '../Modal/AvailableModals';
import {RecoilRoot} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';

describe('AssignmentForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('in create mode', () => {
        it('should not show the unassigned or archived products in the product list', async () => {
            const products = [TestUtils.productWithAssignments, TestUtils.archivedProduct, TestUtils.unassignedProduct];
            renderWithRedux(
                <RecoilRoot>
                    <AssignmentForm
                        products={products}
                        initiallySelectedProduct={products[0]}
                    />
                </RecoilRoot>
            );

            const productsMultiSelectField = await screen.findByLabelText('Assign to');
            const product1Option = screen.getByText('Product 1');
            expect(product1Option).toBeDefined();
            expect(product1Option).toHaveClass('product__multi-value__label');

            expect(within(productsMultiSelectField).queryByText('I am archived')).toBeNull();
            expect(within(productsMultiSelectField).queryByText('unassigned')).toBeNull();
        });

        it('submits an assignment with the given person and product', async () => {
            const { viewingDate } = renderComponent();
            const labelElement = await screen.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await screen.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Person 1/, containerToFindOptionsIn);

            fireEvent.click(screen.getByText('Assign'));
            expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                moment(viewingDate).format('YYYY-MM-DD'),
                [{
                    productId: TestUtils.assignmentForPerson1.productId,
                    placeholder: TestUtils.assignmentForPerson1.placeholder,
                }],
                TestUtils.space,
                TestUtils.person1
            );
        });

        it('submits an assignment when submit event fires', async () => {
            const { viewingDate } = renderComponent();
            const labelElement = await screen.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await screen.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Person 1/, containerToFindOptionsIn);
            fireEvent.submit(screen.getByTestId('assignmentForm'));
            expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                moment(viewingDate).format('YYYY-MM-DD'),
                [{
                    productId: TestUtils.assignmentForPerson1.productId,
                    placeholder: TestUtils.assignmentForPerson1.placeholder,
                }],
                TestUtils.space,
                TestUtils.person1
            );
        });

        it('submits an assignment with the given placeholder status', async () => {
            const { viewingDate } = renderComponent();
            const labelElement = await screen.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await screen.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Person 1/, containerToFindOptionsIn);

            fireEvent.click(screen.getByLabelText('Mark as Placeholder'));
            fireEvent.click(screen.getByText('Assign'));

            expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                moment(viewingDate).format('YYYY-MM-DD'),
                [{
                    productId: TestUtils.assignmentForPerson1.productId,
                    placeholder: true,
                }],
                TestUtils.space,
                TestUtils.person1
            );
        });

        it('does not assign if person does not exist', async () => {
            renderComponent();
            await prefillReactSelectField( 'Name', 'John');
            fireEvent.click(screen.getByText('Assign'));

            expect(AssignmentClient.createAssignmentForDate).not.toBeCalled();
        });

        it('does not assign if person field is empty', async () => {
            renderComponent();
            const labelElement = await screen.findByLabelText('Name');
            fireEvent.change(labelElement, {target: {value: ''}});
            const assignButton = screen.getByText('Assign');
            expect(assignButton.hasAttribute('disabled')).toBeTruthy();

            expect(AssignmentClient.createAssignmentForDate).not.toBeCalled();
        });

        it('is not dismissed if Assign is clicked with invalid person name', async () => {
            renderComponent();
            await prefillReactSelectField('Name', 'Bobberta');
            fireEvent.click(screen.getByText('Assign'));
            await screen.findByText('Assign to');
        });

        it('should populate dropdown to create new person with whatever is typed in input field', async () => {
            renderComponent();
            const labelElement = await screen.findByLabelText('Name');
            fireEvent.change(labelElement, {target: {value: 'Barbara Jordan'}});
            await screen.findByText( TestUtils.expectedCreateOptionText('Barbara Jordan'));
        });

        it('populates the person name field of the Create Person modal on open', async () => {
            const state = { people: TestUtils.people };
            const store = createStore(rootReducer, state);
            store.dispatch = jest.fn();

            renderComponent(store);
            const labelElement = await screen.findByLabelText('Name');
            await selectEvent.openMenu(labelElement);
            await prefillReactSelectField('Name', 'XYZ ABC 123');
            const createOptionText = TestUtils.expectedCreateOptionText('XYZ ABC 123');
            fireEvent.click(getByText(await screen.findByTestId('assignmentForm'),  createOptionText));

            expect(store.dispatch).toBeCalledWith(setCurrentModalAction({
                modal: AvailableModals.CREATE_PERSON,
                item: {
                    initiallySelectedProduct: TestUtils.productWithAssignments,
                    initialPersonName: 'XYZ ABC 123',
                },
            }));
        });
    });
});

const renderComponent = (store: Store|undefined = undefined): { viewingDate: Date; initialState: Partial<GlobalStateProps>; } => {
    const products = [
        TestUtils.productWithAssignments,
        TestUtils.archivedProduct,
        TestUtils.unassignedProduct,
    ];
    const viewingDate = new Date(2020, 5, 5);
    const initialState = {
        currentSpace: TestUtils.space,
        people: TestUtils.people,
    };
    renderWithRedux(
        <RecoilRoot initializeState={({set}) => {
            set(ViewingDateState, viewingDate)
        }}>
            <AssignmentForm
                products={products}
                initiallySelectedProduct={products[0]}
            />
        </RecoilRoot>,
        store,
        initialState
    );

    return {viewingDate, initialState};
};

const prefillReactSelectField = async (label: string, prefillText: string): Promise<void> => {
    const labelElement = await screen.findByLabelText(label);
    fireEvent.change(labelElement, {target: {value: prefillText}});
};
