/*
 * Copyright (c) 2021 Ford Motor Company
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
import ProductTagClient from '../Tags/ProductTag/ProductTagClient';
import {Tag} from '../Tags/Tag';
import ColorClient from '../Roles/ColorClient';
import {Color, RoleTag} from '../Roles/RoleTag.interface';
import {LocationTag} from '../Locations/LocationTag.interface';
import {AxiosResponse} from 'axios';
import SpaceClient from '../Space/SpaceClient';
import {Space} from '../Space/Space';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';

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
        PeopleClient.createPersonForSpace = jest.fn((space, person) => Promise.resolve({
            data: person,
        } as AxiosResponse));
        PeopleClient.getAllPeopleInSpace = jest.fn(() => Promise.resolve({
            data: TestUtils.people,
        } as AxiosResponse));
        PeopleClient.updatePerson = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));
        PeopleClient.removePerson = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));

        SpaceClient.removeUser = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));

        SpaceClient.getSpaceFromUuid = jest.fn(() => Promise.resolve({
            data: TestUtils.space,
        } as AxiosResponse));

        SpaceClient.getUsersForSpace = jest.fn(() => Promise.resolve(
            TestUtils.spaceMappingsArray as UserSpaceMapping[]));

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
                {id: 1, name: 'Software Engineer', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  color: TestUtils.color1},
                {id: 2, name: 'Product Manager', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  color: TestUtils.color2},
                {id: 3, name: 'Product Designer', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  color: TestUtils.color3},
            ],
        } as AxiosResponse));
        RoleClient.add = jest.fn(() => Promise.resolve({
            data: {name: 'Product Owner', id: 1, spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  color: {color: '1', id: 2}},
        } as AxiosResponse));
        RoleClient.edit = jest.fn(() => Promise.resolve({
            data: {name: 'Architecture', id: 1, spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  color: TestUtils.color3},
        } as AxiosResponse));
        RoleClient.delete = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));

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
        LocationClient.delete = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));

        ProductClient.createProduct = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));
        ProductClient.deleteProduct = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));
        ProductClient.editProduct = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));
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
            data: {id: 6, name: 'Finance', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'},
        } as AxiosResponse));
        ProductTagClient.delete = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));

        PersonTagClient.get = jest.fn(() => Promise.resolve({
            data: TestUtils.personTags,
        } as AxiosResponse));
        PersonTagClient.add = jest.fn(() => Promise.resolve({
            data: {id: 1337, name: 'Low Achiever', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'},
        } as AxiosResponse));
        PersonTagClient.edit = jest.fn(() => Promise.resolve({
            data: {id: 6, name: 'Halo Group', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'},
        } as AxiosResponse));
        PersonTagClient.delete = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));
    }

    static async waitForHomePageToLoad(app: RenderResult): Promise<void> {
        await app.findByText(/PeopleMover/i);
    }

    static dummyCallback: () => void = () => null;

    static originDateString = '2019-01-01';

    static annarbor = {id: 1, name: 'Ann Arbor', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'};
    static detroit = {id: 2, name: 'Detroit', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
    static dearborn = {id: 3, name: 'Dearborn', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
    static southfield = {id: 4, name: 'Southfield', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};

    static locations: LocationTag[] = [
        TestUtils.annarbor,
        TestUtils.detroit,
        TestUtils.dearborn,
        TestUtils.southfield,
    ];

    static productTag1: Tag = {id: 5, name: 'AV', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
    static productTag2: Tag = {id: 6, name: 'FordX', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'};
    static productTag3: Tag = {id: 7, name: 'EV', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
    static productTag4: Tag = {id: 8, name: 'Mache', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};

    static productTags: Array<Tag> = [
        TestUtils.productTag1,
        TestUtils.productTag2,
        TestUtils.productTag3,
        TestUtils.productTag4,
    ];

    static personTag1: Tag = {id: 5, name: 'The lil boss', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
    static personTag2: Tag = {id: 6, name: 'The big boss', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'};

    static personTags: Array<Tag> = [
        TestUtils.personTag1,
        TestUtils.personTag2,
    ];

    static color1: Color = {color: '#EFEFEF', id: 1};
    static color2: Color = {color: '#ABABAB', id: 2};
    static color3: Color = {color: '#CDCDCD', id: 3};
    static whiteColor: Color = {color: 'white', id: 4};

    static colors: Array<Color> = [
        TestUtils.color1,
        TestUtils.color2,
        TestUtils.color3,
        TestUtils.whiteColor,
    ];

    static softwareEngineer = {name: 'Software Engineer', id: 1, spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', color: TestUtils.color1};
    static productManager = {name: 'Product Manager', id: 2, spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', color: TestUtils.color2};
    static productDesigner = {name: 'Product Designer', id: 3, spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', color: TestUtils.color3};

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
        tags: [TestUtils.personTag1],
    };

    static hank: Person = {
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        id: 200,
        name: 'Hank',
        spaceRole: TestUtils.productManager,
        notes: "Don't forget the WD-40!",
        newPerson: false,
        tags: [TestUtils.personTag1],
    };

    static unassignedPerson: Person = {
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        id: 101,
        name: 'Unassigned Person 7',
        spaceRole: TestUtils.softwareEngineer,
        newPerson: false,
        tags: [],
    };

    static unassignedBigBossSE: Person = {
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        id: 102,
        name: 'Unassigned Big Boss SE',
        spaceRole: TestUtils.softwareEngineer,
        newPerson: false,
        tags: [TestUtils.personTag2],
    };

    static person2: Person = {
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        id: 103,
        name: 'bob se',
        spaceRole: TestUtils.softwareEngineer,
        newPerson: false,
        tags: TestUtils.personTags,
    };

    static person3: Person = {
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        id: 104,
        name: 'bob pm',
        spaceRole: TestUtils.productManager,
        newPerson: false,
        tags: [TestUtils.personTag1],
    };

    static personNoRoleNoTag: Person = {
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        id: 105,
        name: 'bob norole notag',
        newPerson: false,
        tags: [],
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

    static assignmentForUnassignedBigBossSE: Assignment = {
        id: 12,
        productId: 999,
        person: TestUtils.unassignedBigBossSE,
        placeholder: false,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        effectiveDate: new Date(2020, 4, 15),
    };

    static assignmentForPerson2: Assignment = {
        id: 15,
        productId: 1,
        person: TestUtils.person2,
        placeholder: false,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        effectiveDate: new Date(2020, 4, 15),
    };

    static assignmentForPerson3: Assignment = {
        id: 17,
        productId: 1,
        person: TestUtils.person3,
        placeholder: false,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        effectiveDate: new Date(2020, 4, 15),
    };

    static assignmentForPersonNoRoleNoTag: Assignment = {
        id: 19,
        productId: 1,
        person: TestUtils.personNoRoleNoTag,
        placeholder: false,
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        effectiveDate: new Date(2020, 4, 15),
    };

    static assignments: Array<Assignment> = [
        TestUtils.assignmentForPerson1,
        TestUtils.assignmentForHank,
        TestUtils.assignmentForUnassigned,
    ];

    static assignmentsFilterTest: Array<Assignment> = [
        TestUtils.assignmentForPerson1,
        TestUtils.assignmentForPerson2,
        TestUtils.assignmentForPerson3,
        TestUtils.assignmentForPersonNoRoleNoTag,
    ];

    static unassignedProduct: Product = {
        id: 999,
        name: 'unassigned',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        assignments: [TestUtils.assignmentForUnassigned],
        startDate: '',
        endDate: '',
        archived: false,
        tags: [],
    };

    static unassignedProductForBigBossSE: Product = {
        id: 998,
        name: 'unassigned',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        assignments: [TestUtils.assignmentForUnassignedBigBossSE],
        startDate: '',
        endDate: '',
        archived: false,
        tags: [],
    };

    static productWithAssignments: Product = {
        id: 1,
        name: 'Product 1',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        spaceLocation: TestUtils.southfield,
        assignments: [TestUtils.assignmentForPerson1],
        archived: false,
        tags: [TestUtils.productTag2],
        notes: 'note',
    };

    static productWithoutAssignments: Product = {
        id: 3,
        name: 'Product 3',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        spaceLocation: TestUtils.dearborn,
        assignments: [],
        archived: false,
        tags: [TestUtils.productTag1],
    };

    static productForHank: Product = {
        id: 102,
        name: 'Hanky Product',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        spaceLocation: TestUtils.annarbor,
        assignments: [TestUtils.assignmentForHank],
        archived: false,
        tags: [],
    };

    static productWithoutLocation: Product = {
        id: 5,
        name: 'Awesome Product',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        assignments: [],
        archived: false,
        tags: [],
    };

    static archivedProduct: Product = {
        id: 4,
        name: 'I am archived',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '',
        endDate: '2019-11-02',
        spaceLocation: TestUtils.detroit,
        assignments: [],
        archived: true,
        tags: [],
    };

    static productWithTags: Product = {
        id: 1,
        name: 'Product 1',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        spaceLocation: TestUtils.southfield,
        assignments: TestUtils.assignmentsFilterTest,
        archived: false,
        tags: [TestUtils.productTag2],
        notes: 'note',
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
            spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            startDate: '',
            endDate: '',
            spaceLocation: TestUtils.detroit,
            assignments: [],
            archived: false,
            tags: [],
        },
    ];

    static space: Space = {
        id: 1,
        uuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'testSpace',
        roles: TestUtils.roles,
        locations: TestUtils.locations,
        lastModifiedDate: TestUtils.originDateString,
        todayViewIsPublic: true,
    }

    static spaceMappingsArray: UserSpaceMapping[] = [
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        {id: '1', spaceUuid: TestUtils.space.uuid!!, userId: 'user_id', permission: 'owner'},
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        {id: '2', spaceUuid: TestUtils.space.uuid!!, userId: 'user_id_2', permission: 'editor'},
    ];


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
        {
            label:'Person Tags:',
            options: [],
        },
    ]

    static expectedCreateOptionText(expectedCreationString: string): string {
        return `Create "${expectedCreationString}"`;
    }
}

export default TestUtils;
