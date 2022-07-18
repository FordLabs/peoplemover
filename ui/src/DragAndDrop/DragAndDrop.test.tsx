/*
 * Copyright (c) 2022. Ford Motor Company
 *  All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import React, {ReactChildren} from 'react';
import {DropResult} from 'react-beautiful-dnd';
import {screen, waitFor} from '@testing-library/react';
import {ProductsState} from '../State/ProductsState';
import TestData from '../Utils/TestData';
import {CurrentSpaceState} from '../State/CurrentSpaceState';
import {RecoilObserver, renderWithRecoil} from '../Utils/TestUtils';
import {ViewingDateState} from '../State/ViewingDateState';
import AssignmentClient from '../Assignments/AssignmentClient';
import ProductClient from 'Products/ProductClient';
import {Product} from '../Types/Product';
import {Assignment} from '../Types/Assignment';

jest.mock('Assignments/AssignmentClient');
jest.mock('Products/ProductClient');
jest.mock('react-beautiful-dnd', () => ({
    DragDropContext: ({
        children,
        onDragEnd,
    }: {
        children: ReactChildren;
        onDragEnd: (result: DropResult) => void;
    }) => {
        const dropResult: DropResult = {
            mode: 'SNAP',
            reason: 'DROP',
            source: {
                droppableId: `product-999`, // unassignedProduct id
                index: 1,
            },
            type: '',
            draggableId: `assignment-11`, // assignmentForUnassigned id
            destination: {
                droppableId: `product-1`, // productWithAssignments id
                index: 2,
            },
        };

        return (
            <>
                <button onClick={() => onDragEnd(dropResult)}>trigger-onDragEnd</button>
                {children}
            </>
        );
    },
}));

const mockFetchProducts = jest.fn();
jest.mock('Hooks/useFetchProducts/useFetchProducts', () => {
    return jest.fn(() => ({
        fetchProducts: mockFetchProducts
    }))
})

describe('Drag and Drop', () => {
    const assignmentToMove: Assignment = TestData.assignmentForUnassigned;
    const productAssignmentWasOriginallyIn = TestData.unassignedProduct;
    const productToMoveAssignmentTo = TestData.productWithAssignments;
    const viewingDate = new Date(2020, 4, 14);

    describe('onDragEnd', () => {
        let productState: Product[] | null;
        const originalProducts = [
            productAssignmentWasOriginallyIn,
            productToMoveAssignmentTo
        ]

        beforeEach(() => {
            productState = null;
            renderWithRecoil(
                <>
                    <RecoilObserver
                        recoilState={ProductsState}
                        onChange={(value: Product[]) => {
                            productState = value;
                        }}
                    />
                    children
                </>,
                ({ set }) => {
                    set(ProductsState, [...originalProducts]);
                    set(ViewingDateState, viewingDate);
                    set(CurrentSpaceState, TestData.space);
                }
            );
        });

        it('should move assignment to new product in global state then update database', async () => {
            const updatedProducts = [
                {
                    ...productAssignmentWasOriginallyIn,
                    assignments: [TestData.assignmentForArchived]
                },
                {
                    ...productToMoveAssignmentTo,
                    assignments: [...productToMoveAssignmentTo.assignments, assignmentToMove]
                }
            ]
            ProductClient.getProductsForDate = jest.fn().mockResolvedValue(updatedProducts);

            expect(assignmentToMove.productId).toBe(productAssignmentWasOriginallyIn.id);

            screen.getByText('trigger-onDragEnd').click();

            await waitForAssignmentToBeMoved();
            await waitFor(() => expect(productState).toEqual(updatedProducts));
            expect(mockFetchProducts).toHaveBeenCalled();
        });

        it('should move assigment back to original spot in global state if database update failed', async () => {
            AssignmentClient.createAssignmentForDate = jest.fn().mockRejectedValue('');

            screen.getByText('trigger-onDragEnd').click();

            await waitForAssignmentToBeMoved();
            await waitFor(() => expect(productState).toEqual(originalProducts));
            expect(mockFetchProducts).toHaveBeenCalled();
        });
    });

    async function waitForAssignmentToBeMoved() {
        await waitFor(() =>
            expect(AssignmentClient.getAssignmentsUsingPersonIdAndDate)
                .toHaveBeenCalledWith(TestData.space.uuid, assignmentToMove.person.id, viewingDate)
        )

        await waitFor(() =>
            expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(
                "2020-05-14",
                [{"placeholder": false, "productId": 1}, {"placeholder": false, "productId": 1}],
                TestData.space,
                assignmentToMove.person
            )
        );
    }
});