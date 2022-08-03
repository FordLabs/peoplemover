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

import {fireEvent, getByText, screen, waitFor, within} from '@testing-library/react';
import React from 'react';
import AssignmentForm from './AssignmentForm';
import AssignmentClient from 'Services/Api/AssignmentClient';
import TestUtils, {renderWithRecoil} from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import selectEvent from 'react-select-event';
import moment from 'moment';
import {ViewingDateState} from 'State/ViewingDateState';
import {ProductsState} from 'State/ProductsState';
import {PeopleState} from 'State/PeopleState';
import {ModalContents, ModalContentsState} from 'State/ModalContentsState';
import {RecoilObserver} from 'Utils/RecoilObserver';
import PersonForm from 'People/PersonForm';
import {CurrentSpaceState} from 'State/CurrentSpaceState';

let modalContent: ModalContents | null;

jest.mock('Services/Api/AssignmentClient');

describe('Assignment Form', () => {
    beforeEach(() => {
        modalContent = null;
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

    describe('In create mode', () => {
        it('should not show the unassigned or archived products in the product list', async () => {
            const products = [TestData.productWithAssignments, TestData.archivedProduct, TestData.unassignedProduct];
            renderWithRecoil(
                <>
                    <RecoilObserver
                        recoilState={ModalContentsState}
                        onChange={(value: ModalContents) => {
                            modalContent = value;
                        }}
                    />
                    <AssignmentForm initiallySelectedProduct={products[0]} />
                </>,
                ({set}) => {
                    set(ProductsState, products);
                }
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

            await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1));
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                moment(viewingDate).format('YYYY-MM-DD'),
                [{
                    productId: TestData.assignmentForPerson1.productId,
                    placeholder: TestData.assignmentForPerson1.placeholder,
                }],
                TestData.space,
                TestData.person1
            );
        });

        it('submits an assignment when submit event fires', async () => {
            const { viewingDate } = renderComponent();
            const labelElement = await screen.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await screen.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Person 1/, containerToFindOptionsIn);
            fireEvent.submit(screen.getByTestId('assignmentForm'));

            await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1));
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                moment(viewingDate).format('YYYY-MM-DD'),
                [{
                    productId: TestData.assignmentForPerson1.productId,
                    placeholder: TestData.assignmentForPerson1.placeholder,
                }],
                TestData.space,
                TestData.person1
            );
        });

        it('submits an assignment with the given placeholder status', async () => {
            const { viewingDate } = renderComponent();
            const labelElement = await screen.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await screen.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Person 1/, containerToFindOptionsIn);

            fireEvent.click(screen.getByLabelText('Mark as Placeholder'));
            fireEvent.click(screen.getByText('Assign'));

            await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1));
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                moment(viewingDate).format('YYYY-MM-DD'),
                [{
                    productId: TestData.assignmentForPerson1.productId,
                    placeholder: true,
                }],
                TestData.space,
                TestData.person1
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
            renderComponent();
            const labelElement = await screen.findByLabelText('Name');
            await selectEvent.openMenu(labelElement);
            await prefillReactSelectField('Name', 'XYZ ABC 123');
            const createOptionText = TestUtils.expectedCreateOptionText('XYZ ABC 123');
            fireEvent.click(getByText(await screen.findByTestId('assignmentForm'),  createOptionText));

            await waitFor(() => expect(modalContent).toEqual({
                title: 'Add New Person',
                component: <PersonForm
                    isEditPersonForm={false}
                    initiallySelectedProduct={ TestData.productWithAssignments}
                    initialPersonName="XYZ ABC 123"
                />,
            }));
        });
    });
});

const renderComponent = (): { viewingDate: Date; } => {
    const products = [
        TestData.productWithAssignments,
        TestData.archivedProduct,
        TestData.unassignedProduct,
    ];
    const viewingDate = new Date(2020, 5, 5);
    renderWithRecoil(
        <>
            <RecoilObserver
                recoilState={ModalContentsState}
                onChange={(value: ModalContents) => {
                    modalContent = value;
                }}
            />
            <AssignmentForm initiallySelectedProduct={products[0]} />
        </>,
        ({set}) => {
            set(ViewingDateState, viewingDate);
            set(ProductsState, products);
            set(PeopleState,  TestData.people);
            set(CurrentSpaceState, TestData.space)
        }
    );

    return { viewingDate };
};

const prefillReactSelectField = async (label: string, prefillText: string): Promise<void> => {
    const labelElement = await screen.findByLabelText(label);
    fireEvent.change(labelElement, {target: {value: prefillText}});
};
