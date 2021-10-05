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

import {RoleTag} from '../Roles/RoleTag.interface';
import {Tag} from '../Tags/Tag';

export interface Person {
    id: number;
    name: string;
    spaceRole?: RoleTag;
    notes?: string;
    newPerson: boolean;
    newPersonDate?: Date;
    spaceUuid: string;
    tags: Array<Tag>;
    customField1?: string;
    archiveDate?: Date;
}

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
