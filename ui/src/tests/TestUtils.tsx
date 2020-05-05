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

import RoleClient from '../Roles/RoleClient';
import LocationClient from '../Locations/LocationClient';
import BoardClient from '../Boards/BoardClient';
import PeopleClient from '../People/PeopleClient';
import AssignmentClient from '../Assignments/AssignmentClient';
import ProductClient from '../Products/ProductClient';
import {render, RenderResult} from '@testing-library/react';
import {applyMiddleware, createStore, PreloadedState, Store} from 'redux';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import {Provider} from 'react-redux';
import React from 'react';
import thunk from 'redux-thunk';
import {Person} from '../People/Person';
import {mount, ReactWrapper} from 'enzyme';
import {Assignment} from '../Assignments/Assignment';
import {Product} from '../Products/Product';
import {Board} from '../Boards/Board';
import ProductTagClient from '../ProductTag/ProductTagClient';
import {ProductTag} from '../ProductTag/ProductTag';
import ColorClient from '../Roles/ColorClient';
import {Color} from '../Roles/Role';
import {SpaceLocation} from '../Locations/SpaceLocation';
import {AxiosResponse} from 'axios';

export function renderWithRedux(
    component: JSX.Element,
    store?: Store,
    initialState?: PreloadedState<GlobalStateProps>,
): RenderResult {
    const testingStore: Store = store ? store : createStore(rootReducer, initialState, applyMiddleware(thunk));
    return render(<Provider store={testingStore}>{component}</Provider>);
}

export function renderWithReduxEnzyme(
    component: JSX.Element,
    store?: Store,
    initialState?: PreloadedState<GlobalStateProps>,
): ReactWrapper {
    const testingStore: Store = store ? store : createStore(rootReducer, initialState);
    return mount(<Provider store={testingStore}>{component}</Provider>);
}

export const mockDate = (expected: Date): () => void => {
    const _Date = Date;

    // If any Date or number is passed to the constructor
    // use that instead of our mocked date
    function MockDate(mockOverride?: Date | number): Date {
        return new _Date(mockOverride || expected);
    }

    MockDate.UTC = _Date.UTC;
    MockDate.parse = _Date.parse;
    MockDate.now = (): number => expected.getTime();
    // Give our mock Date has the same prototype as Date
    // Some libraries rely on this to identify Date objects
    MockDate.prototype = _Date.prototype;

    // Our mock is not a full implementation of Date
    // Types will not match but it's good enough for our tests
    global.Date = MockDate as any;

    // Callback function to remove the Date mock
    return (): void => {
        global.Date = _Date;
    };
};

export function mockCreateRange(): () => void {
    const _createRange = window.document.createRange;

    window.document.createRange = function createRange(): Range {
        return {
            setEnd: () => null,
            setStart: () => null,
            getBoundingClientRect: (): DOMRect => {
                return {right: 0} as DOMRect;
            },
            commonAncestorContainer: document.createElement('div'),
        } as unknown as Range;
    };

    return (): void => {
        window.document.createRange = _createRange;
    };
}

const hank: Person = {
    spaceId: 1,
    id: 200,
    name: 'Hank',
    spaceRole: {name: 'Product Manager', id: 2, spaceId: 1, color: {id: 2, color: '#45'}},
    notes: "Don't forget the WD-40!",
    newPerson: false,
};

const unassignedperson: Person = {
    spaceId: 1,
    id: 101,
    name: 'Unassigned Pearson 7',
    spaceRole: {name: 'Software Engineer', id: 1, spaceId: 1, color: {id: 1, color: '#44'}},
    newPerson: false,
};

class TestUtils {
    static mockClientCalls(): void {
        const emptyAxiosResponse = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));
        const emptyAsyncFunction = jest.fn(() => Promise.resolve());

        PeopleClient.createPersonForSpace = jest.fn(x => Promise.resolve({
            data: {
                id: x.id,
                name: x.name,
                spaceRole: x.spaceRole,
                notes: x.notes,
                newPerson: x.newPerson,
            },
        } as AxiosResponse));
        PeopleClient.getAllPeopleInSpace = jest.fn(() => Promise.resolve({
            data: TestUtils.people,
        } as AxiosResponse));
        PeopleClient.updatePerson = emptyAxiosResponse;
        PeopleClient.removePerson = emptyAxiosResponse;

        AssignmentClient.createAssignmentsUsingIds = jest.fn(() => Promise.resolve([]));
        AssignmentClient.createAssignmentUsingIds = emptyAxiosResponse;
        AssignmentClient.deleteAssignment = emptyAxiosResponse;
        AssignmentClient.updateAssignmentsUsingIds = emptyAsyncFunction;
        AssignmentClient.updateAssignment = emptyAxiosResponse;
        AssignmentClient.getAssignmentsUsingPersonId = jest.fn(() => Promise.resolve({
            data: [{
                productId: TestUtils.productWithAssignments.id,
            }, {
                productId: TestUtils.unassignedProduct.id,
            }],
        } as AxiosResponse));

        RoleClient.get = jest.fn(() => Promise.resolve({
            data: [
                {id: 1, name: 'Software Engineer', spaceId: 1, color: TestUtils.color1},
                {id: 2, name: 'Product Manager', spaceId: 1, color: TestUtils.color2},
                {id: 3, name: 'Product Designer', spaceId: 1, color: TestUtils.color3},
            ],
        } as AxiosResponse));
        RoleClient.add = jest.fn(() => Promise.resolve({
            data: {name: 'Product Owner', id: 1, spaceId: -1, color: {color: '1', id: 2}},
        } as AxiosResponse));
        RoleClient.edit = jest.fn(() => Promise.resolve({
            data: {name: 'Architecture', id: 1, spaceId: -1, color: TestUtils.color3},
        } as AxiosResponse));
        RoleClient.delete = emptyAxiosResponse;

        ColorClient.getAllColors = jest.fn(() => Promise.resolve({
            data: TestUtils.colors,
        } as AxiosResponse));

        LocationClient.get = jest.fn(() => Promise.resolve({
            data: TestUtils.locations,
        } as AxiosResponse));
        LocationClient.add = jest.fn(() => Promise.resolve({
            data: {
                id: 11,
                name: 'Ahmedabad',
            },
        } as AxiosResponse));
        LocationClient.edit = jest.fn(() => Promise.resolve({
            data: {
                id: 1,
                name: 'Saline',
            },
        } as AxiosResponse));
        LocationClient.delete = emptyAxiosResponse;

        BoardClient.createBoard = emptyAxiosResponse;
        BoardClient.createEmptyBoard = emptyAxiosResponse;
        BoardClient.updateBoard = emptyAxiosResponse;
        BoardClient.deleteBoard = emptyAxiosResponse;
        BoardClient.getAllBoards = jest.fn(() => Promise.resolve({
            data: TestUtils.boards,
        } as AxiosResponse));

        ProductClient.createProduct = emptyAxiosResponse;
        ProductClient.deleteProduct = emptyAxiosResponse;
        ProductClient.editProduct = emptyAxiosResponse;

        ProductTagClient.get = jest.fn(() => Promise.resolve({
            data: TestUtils.productTags,
        } as AxiosResponse));
        ProductTagClient.add = jest.fn(() => Promise.resolve({
            data: {id: 9, name: 'Fin Tech'},
        } as AxiosResponse));
        ProductTagClient.edit = jest.fn(() => Promise.resolve({
            data: {id:6, name: 'Finance', spaceId:2},
        } as AxiosResponse));
        ProductTagClient.delete = emptyAxiosResponse;
    }

    static async waitForHomePageToLoad(app: RenderResult): Promise<void> {
        await app.findByText(/PeopleMover/i);
    }

    static dummyCallback: () => void = () => null;

    static person1: Person = {
        spaceId: 1,
        id: 100,
        name: 'Person 1',
        spaceRole: {name: 'Software Engineer', id: 1, spaceId: 1, color: {id: 1, color: '#44'}},
        notes: 'I love the theater',
        newPerson: false,
    };

    static people: Array<Person> = [
        TestUtils.person1,
        hank,
        unassignedperson,
    ];

    static annarbor = {id: 1, name: 'Ann Arbor', spaceId: 1};
    static detroit = {id: 2, name: 'Detroit', spaceId: 1};
    static dearborn = {id: 3, name: 'Dearborn', spaceId: 1};
    static southfield = {id: 4, name: 'Southfield', spaceId: 1};

    static locations: SpaceLocation[] = [
        TestUtils.annarbor,
        TestUtils.detroit,
        TestUtils.dearborn,
        TestUtils.southfield,
    ];

    static color1: Color = {color: '1', id: 1};
    static color2: Color = {color: '2', id: 2};
    static color3: Color = {color: '3', id: 3};
    static whiteColor: Color = {color: 'white', id: 4};

    static colors: Array<Color> = [
        TestUtils.color1,
        TestUtils.color2,
        TestUtils.color3,
        TestUtils.whiteColor,
    ];

    static productTag1: ProductTag = {
        id: 5,
        name: 'AV',
        spaceId: 1,
    };

    static productTag2: ProductTag = {
        id: 6,
        name: 'FordX',
        spaceId: 1,
    };

    static productTag3: ProductTag = {
        id: 7,
        name: 'EV',
        spaceId: 1,
    };

    static productTag4: ProductTag = {
        id: 8,
        name: 'Mache',
        spaceId: 1,
    };

    static assignmentForPerson1: Assignment = {
        id: 1,
        productId: 1,
        placeholder: false,
        person: TestUtils.person1,
        joinedProductDate: new Date(2018),
    };

    static productTags: Array<ProductTag> = [
        TestUtils.productTag1,
        TestUtils.productTag2,
        TestUtils.productTag3,
        TestUtils.productTag4,
    ];

    static assignmentForHank: Assignment = {
        id: 3,
        productId: 102,
        placeholder: true,
        person: hank,
        joinedProductDate: new Date(2019),
    };

    static assignmentForUnassigned: Assignment = {
        id: 11,
        productId: 999,
        person: TestUtils.person1,
        placeholder: false,
        joinedProductDate: new Date(2017),
    };

    static unassignedProduct: Product = {
        id: 999,
        name: 'unassigned',
        assignments: [TestUtils.assignmentForUnassigned],
        startDate: '',
        endDate: '',
        archived: false,
        boardId: 1,
        productTags: [],
    };

    static productWithAssignments: Product = {
        id: 1,
        name: 'Product 1',
        startDate: '1/1/11',
        endDate: '2/2/22',
        spaceLocation: TestUtils.southfield,
        assignments: [TestUtils.assignmentForPerson1],
        archived: false,
        boardId: 1,
        productTags: [TestUtils.productTag2],
        notes: 'note',
    };

    static productWithoutAssignments: Product = {
        id: 3,
        name: 'Product 3',
        startDate: '1/1/11',
        endDate: '2/2/22',
        spaceLocation: TestUtils.dearborn,
        assignments: [],
        archived: false,
        boardId: 1,
        productTags: [TestUtils.productTag1],
    };

    static archivedProduct: Product = {
        id: 4,
        name: 'I am archived',
        startDate: '',
        endDate: '',
        spaceLocation: TestUtils.detroit,
        assignments: [],
        archived: true,
        boardId: 1,
        productTags: [],
    };

    static products: Array<Product> = [
        TestUtils.unassignedProduct,
        TestUtils.productWithAssignments,
        TestUtils.productWithoutAssignments,
        TestUtils.archivedProduct,
    ];

    static productsForBoard2: Array<Product> = [
        {
            id: 2,
            name: 'Product 2',
            startDate: '',
            endDate: '',
            spaceLocation: TestUtils.detroit,
            assignments: [],
            archived: false,
            boardId: 2,
            productTags: [],
        },
    ];

    static boards: Array<Board> = [
        {
            id: 1,
            name: 'board one',
            products: TestUtils.products,
            spaceId: 1,
        },
        {
            id: 2,
            name: 'board two',
            products: TestUtils.productsForBoard2,
            spaceId: 1,
        },
    ];
}

export default TestUtils;