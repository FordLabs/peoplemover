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
import {renderWithRedux} from './TestUtils';
import ReassignedDrawer from '../ReassignedDrawer/ReassignedDrawer';
import {Product} from '../Products/Product';
import {Assignment} from '../Assignments/Assignment';
import {Person} from '../People/Person';
import {createStore} from 'redux';
import rootReducer from '../Redux/Reducers';
import {RenderResult} from '@testing-library/react';
import {SpaceRole} from '../Roles/Role';

describe('reAssignedDrawer', () => {
    let component: RenderResult;
    let currentProductA: Product;
    let currentProductB: Product;
    let currentProductC: Product;
    let initialProductA: Product;
    let initialProductB: Product;
    let initialProductC: Product;

    beforeEach(() => {
        currentProductA = {
            archived: false,
            assignments: [bertAssignment2],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        currentProductB = {
            archived: false,
            assignments: [elmoAssignment2],
            boardId: 1,
            id: 2,
            name: 'Product B',
            productTags: [],
        };
        currentProductC = {
            archived: false,
            assignments: [],
            boardId: 1,
            id: 3,
            name: 'Product C',
            productTags: [],
        };
        const currentBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                currentProductA, currentProductB, currentProductC,
            ],
            spaceId: 0,
        };

        initialProductA = {
            archived: false,
            assignments: [elmoAssignment1],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        initialProductB = {
            archived: false,
            assignments: [],
            boardId: 1,
            id: 2,
            name: 'Product B',
            productTags: [],
        };
        initialProductC = {
            archived: false,
            assignments: [bertAssignment1],
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
        const initialState = {
            currentBoard,
            unmodifiedInitialBoards: [unmodifiedInitialBoard],
        };
        const store = createStore(rootReducer, initialState);
        component = renderWithRedux(<ReassignedDrawer/>, store);
    });
    it('should show two new reassignments', async () => {
        await component.findByText(elmo.name);
        await component.findByText((elmo.spaceRole as SpaceRole).name);
        await component.findByText(`${initialProductA.name} ${currentProductB.name}`);

        await component.findByText(bert.name);
        await component.findByText((bert.spaceRole as SpaceRole).name);
        await component.findByText(`${initialProductC.name} ${currentProductA.name}`);
    });

    it('should display the number of reassignments in count badge', async () => {
        const countBadge = await component.findByTestId('countBadge');
        expect(countBadge.innerHTML).toEqual('2');
    });
});

describe('deleted reassignment', () => {
    it('should show reassignment when is assignment is deleted', async () => {
        const currentProductA: Product = {
            archived: false,
            assignments: [],
            boardId: 1,
            id: 1,
            name: 'Product A',
            productTags: [],
        };
        const currentBoard: Board = {
            id: 1,
            name: 'myboard',
            products: [
                currentProductA,
            ],
            spaceId: 0,
        };

        const initialProductA: Product = {
            archived: false,
            assignments: [bertAssignment2],
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
        const initialState = {
            currentBoard,
            boards: [unmodifiedInitialBoard],
        };
        const store = createStore(rootReducer, initialState);
        const component = renderWithRedux(<ReassignedDrawer/>, store);

        await component.findByText(bert.name);
        await component.findByText((bert.spaceRole as SpaceRole).name);
        await component.findByText(`${initialProductA.name} assignment cancelled`);
    });
});


const bert: Person = {
    id: 1,
    newPerson: false,
    name: 'Bert',
    spaceId: 0,
    spaceRole: {name: 'role2', id: 1, spaceId: 1},
};
const elmo: Person = {
    id: 2,
    newPerson: false,
    name: 'Elmo',
    spaceId: 0,
    spaceRole: {name: 'role1', id: 1, spaceId: 1},
};
const bertAssignment1: Assignment = {id: 1, person: bert, placeholder: false, productId: 3};
const bertAssignment2: Assignment = {id: 2, person: bert, placeholder: false, productId: 1};
const elmoAssignment1: Assignment = {id: 3, person: elmo, placeholder: false, productId: 1};
const elmoAssignment2: Assignment = {id: 4, person: elmo, placeholder: false, productId: 2};