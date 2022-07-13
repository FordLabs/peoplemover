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

import {Person} from '../People/Person';
import {Assignment} from '../Assignments/Assignment';
import {Product} from '../Products/Product';
import {Tag} from '../Tags/Tag';
import {Color, RoleTag} from '../Roles/RoleTag.interface';
import {LocationTag} from '../Locations/LocationTag.interface';
import {Space} from '../Space/Space';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';
import {LocalStorageFilters} from '../SortingAndFiltering/FilterLibraries';

const originDateString = '2019-01-01';

const annarbor = {id: 1, name: 'Ann Arbor', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'};
const detroit = {id: 2, name: 'Detroit', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
const dearborn = {id: 3, name: 'Dearborn', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
const southfield = {id: 4, name: 'Southfield', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};

const locations: LocationTag[] = [
    annarbor,
    dearborn,
    detroit,
    southfield,
];

const productTag1: Tag = {id: 5, name: 'AV', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
const productTag2: Tag = {id: 6, name: 'FordX', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'};
const productTag3: Tag = {id: 7, name: 'EV', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
const productTag4: Tag = {id: 8, name: 'Mache', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};

const productTags: Array<Tag> = [
    productTag1,
    productTag2,
    productTag3,
    productTag4,
];

const personTag1: Tag = {id: 5, name: 'The lil boss', spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
const personTag2: Tag = {id: 6, name: 'The big boss', spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'};

const personTags: Array<Tag> = [
    personTag1,
    personTag2,
];

const color1: Color = {color: '#81C0FA', id: 1};
const color2: Color = {color: '#83DDC2', id: 2};
const color3: Color = {color: '#FCBAE9', id: 3};
const whiteColor: Color = {color: '#FFFFFF', id: 4};

const colors: Array<Color> = [
    color1,
    color2,
    color3,
    whiteColor,
];

const softwareEngineer = {name: 'Software Engineer', id: 1, spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', color: color1};
const productManager = {name: 'Product Manager', id: 2, spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', color: color2};
const productDesigner = {name: 'Product Designer', id: 3, spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', color: color3};

const roles: RoleTag[] = [
    productDesigner,
    productManager,
    softwareEngineer,
];

const person1: Person = {
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id: 100,
    name: 'Person 1',
    spaceRole: softwareEngineer,
    notes: 'I love the theater',
    newPerson: false,
    tags: [personTag1],
};

const hank: Person = {
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id: 200,
    name: 'Hank',
    spaceRole: productManager,
    notes: "Don't forget the WD-40!",
    newPerson: false,
    tags: [personTag1],
    archiveDate: new Date(2200, 0, 1),
};

const archivedPerson: Person = {
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id: 1010,
    name: 'Unassigned Person 77',
    spaceRole: softwareEngineer,
    newPerson: false,
    tags: [],
    archiveDate: new Date(2001, 10, 10),
};

const unassignedPerson: Person = {
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id: 101,
    name: 'Unassigned Person 7',
    spaceRole: softwareEngineer,
    newPerson: false,
    tags: [],
};

const unassignedPersonNoRole: Person = {
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id: 106,
    name: 'Unassigned Person No Role',
    newPerson: false,
    tags: [],
};

const unassignedBigBossSE: Person = {
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id: 102,
    name: 'Unassigned Big Boss SE',
    spaceRole: softwareEngineer,
    newPerson: false,
    tags: [personTag2],
    archiveDate: new Date(1993, 8, 1),
};

const person2: Person = {
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id: 103,
    name: 'bob se',
    spaceRole: softwareEngineer,
    newPerson: false,
    tags: personTags,
};

const person3: Person = {
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id: 104,
    name: 'bob pm',
    spaceRole: productManager,
    newPerson: false,
    tags: [personTag1],
};

const personNoRoleNoTag: Person = {
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id: 105,
    name: 'bob norole notag',
    newPerson: false,
    tags: [],
};

const people: Array<Person> = [
    person1,
    hank,
    archivedPerson,
    unassignedPerson,
];

const assignmentForPerson1: Assignment = {
    id: 1,
    productId: 1,
    placeholder: false,
    person: person1,
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    effectiveDate: new Date(2020, 5, 1),
};

const assignmentForHank: Assignment = {
    id: 3,
    productId: 102,
    placeholder: true,
    person: hank,
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    effectiveDate: new Date(2020, 6, 1),
    startDate: new Date(2020, 0, 1),
};

const assignmentVacationForHank: Assignment = {
    id: 20,
    productId: 999,
    person: hank,
    placeholder: false,
    spaceUuid: hank.spaceUuid,
    startDate: new Date(2019, 11, 1),
    endDate: new Date(2020, 0, 1),
};

const previousAssignmentForHank: Assignment = {
    id: 21,
    productId: 3,
    person: hank,
    placeholder: false,
    spaceUuid: hank.spaceUuid,
    startDate: new Date(2019, 9, 1),
    endDate: new Date(2019, 11, 1),
};

const assignmentForUnassigned: Assignment = {
    id: 11,
    productId: 999,
    person: unassignedPerson,
    placeholder: false,
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    effectiveDate: new Date(2020, 4, 15),
    startDate: new Date(2020, 0, 2),
};

const assignmentForArchived: Assignment = {
    id: 111,
    productId: 999,
    person: archivedPerson,
    placeholder: false,
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    effectiveDate: new Date(2020, 4, 15),
    startDate: new Date(2020, 0, 2),
};

const assignmentForUnassignedNoRole: Assignment = {
    id: 14,
    productId: 999,
    person: unassignedPersonNoRole,
    placeholder: false,
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    effectiveDate: new Date(2020, 4, 15),
    startDate: new Date(2020, 0, 2),
};

const assignmentForUnassignedBigBossSE: Assignment = {
    id: 12,
    productId: 999,
    person: unassignedBigBossSE,
    placeholder: false,
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    effectiveDate: new Date(2020, 4, 15),
};

const assignmentForPerson2: Assignment = {
    id: 15,
    productId: 1,
    person: person2,
    placeholder: false,
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    effectiveDate: new Date(2020, 4, 15),
};

const assignmentForPerson3: Assignment = {
    id: 17,
    productId: 1,
    person: person3,
    placeholder: false,
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    effectiveDate: new Date(2020, 4, 15),
};

const assignmentForPersonNoRoleNoTag: Assignment = {
    id: 19,
    productId: 1,
    person: personNoRoleNoTag,
    placeholder: false,
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    effectiveDate: new Date(2020, 4, 15),
};

const assignments: Array<Assignment> = [
    assignmentForPerson1,
    assignmentForHank,
    assignmentForUnassigned,
];

const assignmentsFilterTest: Array<Assignment> = [
    assignmentForPerson1,
    assignmentForPerson2,
    assignmentForPerson3,
    assignmentForPersonNoRoleNoTag,
];

const unassignedProduct: Product = {
    id: 999,
    name: 'unassigned',
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    assignments: [assignmentForUnassigned, assignmentForArchived],
    startDate: '',
    endDate: undefined,
    archived: false,
    tags: [],
};

const unassignedProductForBigBossSE: Product = {
    id: 998,
    name: 'unassigned',
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    assignments: [assignmentForUnassignedBigBossSE],
    startDate: '',
    endDate: '',
    archived: false,
    tags: [],
};

const productWithAssignments: Product = {
    id: 1,
    name: 'Product 1',
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    startDate: '2011-01-01',
    endDate: '9999-02-02',
    spaceLocation: southfield,
    assignments: [assignmentForPerson1],
    archived: false,
    tags: [productTag2],
    notes: 'note',
};

const productWithoutAssignments: Product = {
    id: 3,
    name: 'Product 3',
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    startDate: '2011-01-01',
    endDate: '9999-02-02',
    spaceLocation: dearborn,
    assignments: [],
    archived: false,
    tags: [productTag1],
    dorf: '',
    notes: '',
    url: '',
};

const productForHank: Product = {
    id: 102,
    name: 'Hanky Product',
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    startDate: '2011-01-01',
    endDate: '9999-02-02',
    spaceLocation: annarbor,
    assignments: [assignmentForHank],
    archived: false,
    tags: [],
};

const productWithoutLocation: Product = {
    id: 5,
    name: 'Awesome Product',
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    startDate: '2011-01-01',
    endDate: '9999-02-02',
    assignments: [],
    archived: false,
    tags: [],
};

const archivedProduct: Product = {
    id: 4,
    name: 'I am archived',
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    startDate: '',
    endDate: '2019-11-02',
    spaceLocation: detroit,
    assignments: [],
    archived: true,
    tags: [],
};

const productWithTags: Product = {
    id: 6,
    name: 'Product 6',
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    startDate: '2011-01-01',
    endDate: '9999-02-02',
    spaceLocation: southfield,
    assignments: assignmentsFilterTest,
    archived: false,
    tags: [productTag2],
    notes: 'note',
};

const products: Array<Product> = [
    unassignedProduct,
    productWithAssignments,
    productForHank,
    productWithoutAssignments,
    archivedProduct,
    productWithoutLocation,
];

const notEmptyProducts: Array<Product> = [
    productWithAssignments,
];

const productsForBoard2: Array<Product> = [
    {
        id: 2,
        name: 'Product 2',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '',
        endDate: '',
        spaceLocation: detroit,
        assignments: [],
        archived: false,
        tags: [],
    },
];

const space: Space = {
    id: 1,
    uuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'testSpace',
    lastModifiedDate: originDateString,
    todayViewIsPublic: true,
}

const spaceMappingsArray: UserSpaceMapping[] = [
    {id: '1', spaceUuid: space.uuid!, userId: 'user_id', permission: 'owner'},
    {id: '2', spaceUuid: space.uuid!, userId: 'user_id_2', permission: 'editor'},
];

const defaultLocalStorageFilters: LocalStorageFilters = {
    locationTagFilters: [annarbor.name],
    productTagFilters: [],
    roleTagFilters: [],
    personTagFilters: [],
};

const TestData = {
    defaultLocalStorageFilters,

    spaceMappingsArray,
    space,

    products,
    productsForBoard2,
    notEmptyProducts,
    productWithTags,
    archivedProduct,
    productForHank,
    productWithoutAssignments,
    productWithAssignments,
    productWithoutLocation,
    unassignedProductForBigBossSE,
    unassignedProduct,

    assignments,
    assignmentsFilterTest,
    assignmentForPersonNoRoleNoTag,
    assignmentForPerson3,
    assignmentForPerson2,
    assignmentForUnassignedBigBossSE,
    assignmentForUnassignedNoRole,
    assignmentForArchived,
    assignmentForUnassigned,
    previousAssignmentForHank,
    assignmentVacationForHank,
    assignmentForHank,
    assignmentForPerson1,

    people,
    personNoRoleNoTag,
    person3,
    person2,
    person1,
    unassignedBigBossSE,
    unassignedPersonNoRole,
    unassignedPerson,
    archivedPerson,
    hank,

    roles,
    productDesigner,
    productManager,
    softwareEngineer,

    colors,
    whiteColor,
    color1,
    color2,
    color3,

    personTags,
    personTag1,
    personTag2,

    productTags,
    productTag1,
    productTag2,
    productTag3,
    productTag4,

    locations,
    southfield,
    dearborn,
    detroit,
    annarbor,

    originDateString,
}

export default TestData;