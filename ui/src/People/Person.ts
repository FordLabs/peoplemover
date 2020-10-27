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

import {RoleTag} from '../Roles/Role.interface';

export interface Person {
    id: number;
    name: string;
    spaceRole?: RoleTag;
    notes?: string;
    newPerson: boolean;
    spaceId: number;
}

export function emptyPerson(): Person {
    return {
        id: -1,
        name: '',
        newPerson: false,
        spaceId: -1,
    };
}
