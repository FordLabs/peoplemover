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

import {Assignment} from '../Assignments/Assignment';
import {Product} from '../Products/Product';

export class BoardComparison {
    static compare(board1: Board, board2: Board): Array<Reassignment> {
        const initialAssignments: Assignment[] = board1.products.reduce(this.accumulateAssignments, []);
        const modifiedAssignments: Assignment[] = board2.products.reduce(this.accumulateAssignments, []);

        const assignmentsUniqueToBoard1: Array<Assignment> = initialAssignments.filter(assignment => !modifiedAssignments.some(assignment2 => (
            assignment2.person.id === assignment.person.id &&
            assignment2.productId === assignment.productId
        )));
        const assignmentsUniqueToBoard2: Array<Assignment> = modifiedAssignments.filter(assignment => !initialAssignments.some(assignment2 => (
            assignment2.person.id === assignment.person.id &&
            assignment2.productId === assignment.productId
        )));
        let listOfNewlyCreatedAssignments: Array<Assignment> = [...assignmentsUniqueToBoard2];

        const reassignmentList: Array<Reassignment> = [];
        assignmentsUniqueToBoard1.forEach(assignment => {
            const correspondingAssignment: Assignment | undefined = assignmentsUniqueToBoard2.find(assignment2 => assignment2.person.id === assignment.person.id);

            let reassignment: Reassignment;
            if (correspondingAssignment && correspondingAssignment.productId != assignment.productId) {
                reassignment = {
                    person: correspondingAssignment.person,
                    fromProduct: BoardComparison.getProductFromProductId(assignment.productId, board1),
                    toProduct: BoardComparison.getProductFromProductId(correspondingAssignment.productId, board2),
                };
                listOfNewlyCreatedAssignments = listOfNewlyCreatedAssignments.filter(assignment => assignment !== correspondingAssignment);
            } else {
                reassignment = {
                    person: assignment.person,
                    fromProduct: BoardComparison.getProductFromProductId(assignment.productId, board1),
                };
            }
            reassignmentList.push(reassignment);
        });
        if (listOfNewlyCreatedAssignments.length > 0) {
            listOfNewlyCreatedAssignments.forEach( assignment => {
                const reassignment: Reassignment = {
                    person: assignment.person,
                    toProduct: BoardComparison.getProductFromProductId(assignment.productId, board2),
                };
                reassignmentList.push(reassignment);
            });
        }

        return reassignmentList;
    }

    private static accumulateAssignments(accumulator: Array<Assignment>, product: Product): Array<Assignment> {
        product.assignments.forEach(assignment => accumulator.push(assignment));
        return accumulator;
    }

    private static getProductFromProductId(productId: number, board: Board): Product | undefined {
        return board.products.find(product => product.id === productId);
    }
}
