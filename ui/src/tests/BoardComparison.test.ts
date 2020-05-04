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

import {Board} from '../Boards/Board';
import {Reassignment} from '../ReassignedDrawer/Reassignment';
import {BoardComparison} from '../ReusableComponents/BoardComparison';
import TestUtils from './TestUtils';
import {Assignment} from '../Assignments/Assignment';
import {Product} from '../Products/Product';
import {Person} from '../People/Person';

describe('Comparing Boards', () => {
    it('should return empty list for identical boards', () => {
        const result: Array<Reassignment> = BoardComparison.compare(
            TestUtils.boards[0],
            TestUtils.boards[0],
        );
        expect(result).toEqual([]);
    });

    it('should return a list of reassignments for two non-identical boards', () => {
        const initialProductA: Product = {
            archived: false,
            assignments: [bertAssignment1],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        const initialProductB: Product = {
            archived: false,
            assignments: [],
            boardId: 1,
            id: 2,
            name: 'Product B',
            productTags: [],
        };
        const unmodifiedInitialBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                initialProductA, initialProductB,
            ],
            spaceId: 0,
        };

        const finalProductA: Product = {
            archived: false,
            assignments: [],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        const finalProductB: Product = {
            archived: false,
            assignments: [bertAssignment2],
            boardId: 1,
            id: 2,
            name: 'Product B',
            productTags: [],
        };
        const finalBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                finalProductA, finalProductB,
            ],
            spaceId: 0,
        };

        const actualResult: Array<Reassignment> = BoardComparison.compare(
            unmodifiedInitialBoard,
            finalBoard,
        );

        const expectedResult: Array<Reassignment> = [{
            person: bert,
            fromProduct: initialProductA,
            toProduct: finalProductB,
        }];
        expect(actualResult).toEqual(expectedResult);
    });
    it('should return an reassignment when a new assignment is created and show productFrom as unassigned', () => {
        const initialProductA: Product = {
            archived: false,
            assignments: [bertAssignment1],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        const unmodifiedInitialBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                initialProductA,
            ],
            spaceId: 0,
        };

        const finalProductA: Product = {
            archived: false,
            assignments: [],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        const finalBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                finalProductA,
            ],
            spaceId: 0,
        };

        const actual: Array<Reassignment> = BoardComparison.compare(unmodifiedInitialBoard, finalBoard);

        const expected: Array<Reassignment> = [{
            person: bert,
            fromProduct: initialProductA,
            toProduct: undefined,
        }];
        expect(actual).toEqual(expected);
    });
    it('should return an reassignment when a assignment is removed and productTo should be unassigned', () => {
        const initialProductA: Product = {
            archived: false,
            assignments: [],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        const unmodifiedInitialBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                initialProductA,
            ],
            spaceId: 0,
        };

        const finalProductA: Product = {
            archived: false,
            assignments: [bertAssignment1],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        const finalBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                finalProductA,
            ],
            spaceId: 0,
        };

        const actual: Array<Reassignment> = BoardComparison.compare(unmodifiedInitialBoard, finalBoard);

        const expected: Array<Reassignment> = [{
            person: bert,
            fromProduct: undefined,
            toProduct: finalProductA,
        }];
        expect(actual).toEqual(expected);
    });
    it('should handle reassignments when person has multiple cards on different products and moved off then back' +
        ' on the initial product', () => {
        const initialProductA: Product = {
            archived: false,
            assignments: [bertAssignment1],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        const initialProductB: Product = {
            archived: false,
            assignments: [bertAssignment2],
            boardId: 1,
            id: 2,
            name: 'Product B',
            productTags: [],
        };
        const initialProductC: Product = {
            archived: false,
            assignments: [],
            boardId: 1,
            id: 3,
            name: 'Product C',
            productTags: [],
        };
        const unmodifiedInitialBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                initialProductA, initialProductB, initialProductC,
            ],
            spaceId: 0,
        };

        const finalProductA: Product = {
            archived: false,
            assignments: [bertAssignment4],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        const finalProductB: Product = {
            archived: false,
            assignments: [],
            boardId: 1,
            id: 2,
            name: 'Product B',
            productTags: [],
        };
        const finalProductC: Product = {
            archived: false,
            assignments: [bertAssignment3],
            boardId: 1,
            id: 3,
            name: 'Product C',
            productTags: [],
        };
        const finalBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                finalProductA, finalProductB, finalProductC,
            ],
            spaceId: 0,
        };

        const actual: Array<Reassignment> = BoardComparison.compare(unmodifiedInitialBoard, finalBoard);

        const expected: Array<Reassignment> = [{
            person: bert,
            fromProduct: initialProductB,
            toProduct: finalProductC,
        }];
        expect(actual).toEqual(expected);

    });
});

const bert: Person = {
    id: 1,
    newPerson: false,
    name: 'Bert',
    spaceId: 0,
    spaceRole: {name: 'role2', id: 1, spaceId: 1},
};
const bertAssignment1: Assignment = {id: 1, person: bert, placeholder: false, productId: 1};
const bertAssignment2: Assignment = {id: 2, person: bert, placeholder: false, productId: 2};
const bertAssignment3: Assignment = {id: 3, person: bert, placeholder: false, productId: 3};
const bertAssignment4: Assignment = {id: 4, person: bert, placeholder: false, productId: 1};