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

import React, {PropsWithChildren, useCallback} from 'react';
import {DragDropContext, OnDragEndResponder} from 'react-beautiful-dnd';
import {useRecoilState, useRecoilValue} from 'recoil';
import {ProductsState} from '../../State/ProductsState';
import {CurrentSpaceState} from '../../State/CurrentSpaceState';
import AssignmentClient from '../../Services/Api/AssignmentClient';
import {ViewingDateState} from '../../State/ViewingDateState';
import moment from 'moment';
import {ProductPlaceholderPair} from '../../Assignments/CreateAssignmentRequest';
import useFetchProducts from '../../Hooks/useFetchProducts/useFetchProducts';
import {Product} from '../../Types/Product';
import {Assignment} from '../../Types/Assignment';

type Props = {};

function DragAndDrop({ children }: PropsWithChildren<Props>): JSX.Element {
    const [products, setProducts] = useRecoilState(ProductsState);
    const currentSpace = useRecoilValue(CurrentSpaceState);
    const viewingDate = useRecoilValue(ViewingDateState);

    const { fetchProducts } = useFetchProducts(currentSpace.uuid!)

    const getNumberFromId = (id: string) => parseInt(id.replace(/[^0-9.]/g, ''), 10);

    const onDragEnd: OnDragEndResponder = useCallback(
        async (result) => {
            if (!result.destination) return;

            const assignmentId: number = getNumberFromId(result.draggableId);
            const oldProductId: number = getNumberFromId(result.source.droppableId);
            const newProductId: number =  getNumberFromId(result.destination?.droppableId);
            const isSameProduct = oldProductId === newProductId;

            if (isSameProduct) return;

            const assignmentToMove: Assignment | undefined = products.find((p) => p.id === oldProductId)
                ?.assignments
                .find((a) => a.id === assignmentId);
            const newProduct: Product | undefined = products.find((p) => p.id === newProductId);
            const oldProduct: Product | undefined = products.find((p) => p.id === oldProductId);

            if (!assignmentToMove || !newProduct || !oldProduct) return;

            const originalProductState = [...products];

            setProducts((currentState: Product[]) => {
                return currentState.map((product) => {
                    let assignments = [...product.assignments];
                    if (product.id === oldProductId) {
                        assignments = oldProduct.assignments.filter((a) => a.id !== assignmentToMove.id)
                    }
                    if (product.id === newProductId) assignments = [...assignments, assignmentToMove];
                    return {...product, assignments};
                });
            });

            const existingAssignments: Array<Assignment> = (await AssignmentClient.getAssignmentsUsingPersonIdAndDate(currentSpace.uuid!, assignmentToMove.person.id, viewingDate)).data;
            const productPlaceholderPairs: Array<ProductPlaceholderPair> = existingAssignments
                .map(existingAssignment => ({
                    productId: existingAssignment.productId,
                    placeholder: existingAssignment.placeholder,
                }))
                .filter(existingAssignment => existingAssignment.productId !== assignmentToMove.productId)
                .concat({ productId: newProductId, placeholder: assignmentToMove.placeholder });

            await AssignmentClient.createAssignmentForDate(
                moment(viewingDate).format('YYYY-MM-DD'),
                productPlaceholderPairs,
                currentSpace,
                assignmentToMove.person
            ).catch(() => setProducts(originalProductState));
            fetchProducts();
        },
        [currentSpace, fetchProducts, products, setProducts, viewingDate]
    );

    return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>;
}

export default DragAndDrop;