/*
 * Copyright (c) 2020 Ford Motor Company
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
import ProductTagClient from '../ProductTag/ProductTagClient';
import {ProductTag} from '../ProductTag/ProductTag';
import ColorClient from '../Roles/ColorClient';
import {Color, RoleTag} from '../Roles/RoleTag.interface';
import {LocationTag} from '../Locations/LocationTag.interface';
import {AxiosResponse} from 'axios';
import SpaceClient from '../Space/SpaceClient';
import {Space} from '../Space/Space';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';

export function createDataTestId(prefix: string, name: string): string {
    return prefix + '__' + name.toLowerCase().replace(/ /g, '_');
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Date = MockDate as any;

    // Callback function to remove the Date mock
    return (): void => {
        global.Date = _Date;
    };
};

export function mockCreateRange(): () => void {
    if (window.document) {
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
    } else {
        return (): void => {
            return;
        };
    }
}

class TestUtils {
    static mockClientCalls(): void {
        const emptyAxiosResponse = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));

        PeopleClient.createPersonForSpace = jest.fn((space, person) => Promise.resolve({
            data: person,
        } as AxiosResponse));
        PeopleClient.getAllPeopleInSpace = jest.fn(() => Promise.resolve({
            data: TestUtils.people,
        } as AxiosResponse));
        PeopleClient.updatePerson = emptyAxiosResponse;
        PeopleClient.removePerson = emptyAxiosResponse;

        SpaceClient.getSpaceFromUuid = jest.fn(() => Promise.resolve({
            data: TestUtils.space,
        } as AxiosResponse));

        AssignmentClient.createAssignmentForDate = jest.fn(() => Promise.resolve({
            data: [TestUtils.assignmentForPerson1],
        } as AxiosResponse));
        AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn(() => Promise.resolve({
            data: [TestUtils.assignmentForPerson1],
        } as AxiosResponse));
        AssignmentClient.getAssignmentEffectiveDates = jest.fn(() => Promise.resolve({
            data: [
                new Date(2020, 4, 15),
                new Date(2020, 5, 1),
                new Date(2020, 6, 1),
            ],
        } as AxiosResponse));
        AssignmentClient.getReassignments = jest.fn(() => Promise.resolve({
            data: [],
        } as AxiosResponse));

        RoleClient.get = jest.fn(() => Promise.resolve({
            data: [
                {id: 1, name: 'Software Engineer', spaceId: 1, spaceUuid: 'a',  color: TestUtils.color1},
                {id: 2, name: 'Product Manager', spaceId: 1, spaceUuid: 'a',  color: TestUtils.color2},
                {id: 3, name: 'Product Designer', spaceId: 1, spaceUuid: 'a',  color: TestUtils.color3},
            ],
        } as AxiosResponse));
        RoleClient.add = jest.fn(() => Promise.resolve({
            data: {name: 'Product Owner', id: 1, spaceId: -1, spaceUuid: 'a',  color: {color: '1', id: 2}},
        } as AxiosResponse));
        RoleClient.edit = jest.fn(() => Promise.resolve({
            data: {name: 'Architecture', id: 1, spaceId: -1, spaceUuid: 'a',  color: TestUtils.color3},
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

        ProductClient.createProduct = emptyAxiosResponse;
        ProductClient.deleteProduct = emptyAxiosResponse;
        ProductClient.editProduct = emptyAxiosResponse;
        ProductClient.getProductsForDate = jest.fn(() => Promise.resolve({
            data: TestUtils.products,
        } as AxiosResponse));

        ProductTagClient.get = jest.fn(() => Promise.resolve({
            data: TestUtils.productTags,
        } as AxiosResponse));
        ProductTagClient.add = jest.fn(() => Promise.resolve({
            data: {id: 9, name: 'Fin Tech'},
        } as AxiosResponse));
        ProductTagClient.edit = jest.fn(() => Promise.resolve({
            data: {id: 6, name: 'Finance', spaceId: 2, spaceUuid: 'a'},
        } as AxiosResponse));
        ProductTagClient.delete = emptyAxiosResponse;
    }

    static async waitForHomePageToLoad(app: RenderResult): Promise<void> {
        await app.findByText(/PeopleMover/i);
    }

    static dummyCallback: () => void = () => null;

    static originDateString = '2019-01-01';

    static annarbor = {id: 1, name: 'Ann Arbor', spaceUuid: 'uuid',  spaceId: 1};
    static detroit = {id: 2, name: 'Detroit', spaceUuid: 'a',  spaceId: 1};
    static dearborn = {id: 3, name: 'Dearborn', spaceUuid: 'a',  spaceId: 1};
    static southfield = {id: 4, name: 'Southfield', spaceUuid: 'a',  spaceId: 1};

    static locations: LocationTag[] = [
        TestUtils.annarbor,
        TestUtils.detroit,
        TestUtils.dearborn,
        TestUtils.southfield,
    ];

    static productTag1: ProductTag = {id: 5, name: 'AV', spaceUuid: 'a',  spaceId: 1};
    static productTag2: ProductTag = {id: 6, name: 'FordX', spaceUuid: 'uuid',  spaceId: 1};
    static productTag3: ProductTag = {id: 7, name: 'EV', spaceUuid: 'a',  spaceId: 1};
    static productTag4: ProductTag = {id: 8, name: 'Mache', spaceUuid: 'a',  spaceId: 1};

    static productTags: Array<ProductTag> = [
        TestUtils.productTag1,
        TestUtils.productTag2,
        TestUtils.productTag3,
        TestUtils.productTag4,
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

    static softwareEngineer = {name: 'Software Engineer', id: 1, spaceUuid: 'a',  spaceId: 1, color: TestUtils.color1};
    static productManager = {name: 'Product Manager', id: 2, spaceUuid: 'a',  spaceId: 1, color: TestUtils.color2};
    static productDesigner = {name: 'Product Designer', id: 3, spaceUuid: 'a',  spaceId: 1, color: TestUtils.color3};

    static roles: RoleTag[] = [
        TestUtils.softwareEngineer,
        TestUtils.productManager,
        TestUtils.productDesigner,
    ];

    static person1: Person = {
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        id: 100,
        name: 'Person 1',
        spaceRole: TestUtils.softwareEngineer,
        notes: 'I love the theater',
        newPerson: false,
    };

    static hank: Person = {
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        id: 200,
        name: 'Hank',
        spaceRole: TestUtils.productManager,
        notes: "Don't forget the WD-40!",
        newPerson: false,
    };

    static unassignedPerson: Person = {
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        id: 101,
        name: 'Unassigned Person 7',
        spaceRole: TestUtils.softwareEngineer,
        newPerson: false,
    };

    static people: Array<Person> = [
        TestUtils.person1,
        TestUtils.hank,
        TestUtils.unassignedPerson,
    ];

    static assignmentForPerson1: Assignment = {
        id: 1,
        productId: 1,
        placeholder: false,
        person: TestUtils.person1,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        effectiveDate: new Date(2020, 5, 1),
    };

    static assignmentForHank: Assignment = {
        id: 3,
        productId: 102,
        placeholder: true,
        person: TestUtils.hank,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        effectiveDate: new Date(2020, 6, 1),
    };

    static assignmentForUnassigned: Assignment = {
        id: 11,
        productId: 999,
        person: TestUtils.unassignedPerson,
        placeholder: false,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        effectiveDate: new Date(2020, 4, 15),
    };

    static assignments: Array<Assignment> = [
        TestUtils.assignmentForPerson1,
        TestUtils.assignmentForHank,
        TestUtils.assignmentForUnassigned,
    ];

    static unassignedProduct: Product = {
        id: 999,
        name: 'unassigned',
        spaceId: 1,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        assignments: [TestUtils.assignmentForUnassigned],
        startDate: '',
        endDate: '',
        archived: false,
        productTags: [],
    };

    static productWithAssignments: Product = {
        id: 1,
        name: 'Product 1',
        spaceId: 1,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        spaceLocation: TestUtils.southfield,
        assignments: [TestUtils.assignmentForPerson1],
        archived: false,
        productTags: [TestUtils.productTag2],
        notes: 'note',
    };

    static productWithoutAssignments: Product = {
        id: 3,
        name: 'Product 3',
        spaceId: 1,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        spaceLocation: TestUtils.dearborn,
        assignments: [],
        archived: false,
        productTags: [TestUtils.productTag1],
    };

    static productForHank: Product = {
        id: 102,
        name: 'Hanky Product',
        spaceId: 1,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        spaceLocation: TestUtils.annarbor,
        assignments: [TestUtils.assignmentForHank],
        archived: false,
        productTags: [],
    };

    static productWithoutLocation: Product = {
        id: 5,
        name: 'Awesome Product',
        spaceId: 1,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        assignments: [],
        archived: false,
        productTags: [],
    };

    static archivedProduct: Product = {
        id: 4,
        name: 'I am archived',
        spaceId: 1,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '',
        endDate: '2020-11-02',
        spaceLocation: TestUtils.detroit,
        assignments: [],
        archived: true,
        productTags: [],
    };

    static products: Array<Product> = [
        TestUtils.unassignedProduct,
        TestUtils.productWithAssignments,
        TestUtils.productForHank,
        TestUtils.productWithoutAssignments,
        TestUtils.archivedProduct,
        TestUtils.productWithoutLocation,
    ];

    static notEmptyProducts: Array<Product> = [
        TestUtils.productWithAssignments,
    ];

    static productsForBoard2: Array<Product> = [
        {
            id: 2,
            name: 'Product 2',
            spaceId: 1,
            spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            startDate: '',
            endDate: '',
            spaceLocation: TestUtils.detroit,
            assignments: [],
            archived: false,
            productTags: [],
        },
    ];

    static space: Space = {
        id: 1,
        uuid: 'uuid',
        name: 'testSpace',
        roles: TestUtils.roles,
        locations: TestUtils.locations,
        lastModifiedDate: TestUtils.originDateString,
        todayViewIsPublic: true,
    }

    static allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
        {
            label:'Location Tags:',
            options: [{
                label: 'Ann Arbor',
                value: '1_Ann Arbor',
                selected: true,
            }],
        },
        {
            label:'Product Tags:',
            options: [],
        },
        {
            label:'Role Tags:',
            options: [],
        },
    ]

    static expectedCreateOptionText(expectedCreationString: string): string {
        return `Create "${expectedCreationString}"`;
    }
}

export default TestUtils;
