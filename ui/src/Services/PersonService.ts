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

import moment from 'moment';
import {Product} from 'Types/Product';
import {Person} from 'Types/Person';
import {Assignment} from '../Types/Assignment';

export function emptyPerson(): Person {
    return {
        id: -1,
        name: '',
        newPerson: false,
        spaceUuid: '',
        tags: [],
        customField1: '',
    };
}

export function isPersonMatchingSelectedFilters(person: Person, selectedRoleFilters: Array<string>, selectedPersonTagFilters: Array<string>): boolean {
    let isMatchingRole = false;
    let isMatchingPersonTag = false;

    if (selectedRoleFilters.length === 0) {
        isMatchingRole = true;
    } else {
        if (person.spaceRole && selectedRoleFilters.includes(person.spaceRole.name)) {
            isMatchingRole = true;
        }
    }

    if (selectedPersonTagFilters.length === 0) {
        isMatchingPersonTag = true;
    } else {
        person.tags.forEach(personTag => {
            if (selectedPersonTagFilters.includes(personTag.name)) {
                isMatchingPersonTag = true;
            }
        });
    }

    return isMatchingRole && isMatchingPersonTag;
}

export function isArchived(person: Person, date: Date): boolean {
    return person.archiveDate != null && moment(person.archiveDate).isBefore(moment(date));
}

export const getAssignments = (person: Person, products: Product[]): Assignment[] => {
    const assignments: Assignment[] = [];
    products.forEach(product => {
        const assignment = product.assignments.find(assignment => assignment.person.id === person.id);
        if (assignment !== undefined) { assignments.push(assignment);}
    });
    return assignments;
};
