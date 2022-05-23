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

import {UserSpaceMapping} from '../UserSpaceMapping';
import {Space} from '../Space';

const space: Space = {
    id: 1,
    uuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'testSpace',
    lastModifiedDate:  '2019-01-01',
    todayViewIsPublic: true,
}

const spaceMappingsArray: UserSpaceMapping[] = [
    {id: '1', spaceUuid: space.uuid!, userId: 'user_id', permission: 'owner'},
    {id: '2', spaceUuid: space.uuid!, userId: 'user_id_2', permission: 'editor'},
];

const SpaceClient = {
    getSpacesForUser: jest.fn().mockResolvedValue([]),
    getUsersForSpace:  jest.fn().mockResolvedValue(spaceMappingsArray),
    changeOwner: jest.fn().mockResolvedValue({}),
    removeUser: jest.fn().mockResolvedValue({}),
    deleteSpaceByUuid: jest.fn().mockResolvedValue({})
}

export default SpaceClient;