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

import Axios, { AxiosResponse } from 'axios';
import { TagRequest } from 'Types/TagRequest';
import { TagClient } from 'Types/TagClient';
import { Space } from 'Types/Space';
import { LocationTag } from 'Types/Tag';
import { getAxiosConfig } from 'Utils/getAxiosConfig';

function getBaseLocationsUrl(spaceUuid: string): string {
    return '/api/spaces/' + spaceUuid + '/locations';
}

async function get(spaceUuid: string): Promise<AxiosResponse<LocationTag[]>> {
    const url = getBaseLocationsUrl(spaceUuid);
    return Axios.get(url, getAxiosConfig());
}

async function add(location: TagRequest, space: Space): Promise<AxiosResponse> {
    const url = getBaseLocationsUrl(space.uuid || '');
    return Axios.post(url, location, getAxiosConfig());
}

async function edit(
    location: TagRequest,
    space: Space
): Promise<AxiosResponse<LocationTag>> {
    const url = getBaseLocationsUrl(space.uuid || '') + `/${location.id}`;
    return Axios.put(url, location, getAxiosConfig());
}

async function deleteLocation(
    locationId: number,
    space: Space
): Promise<AxiosResponse> {
    const url = getBaseLocationsUrl(space.uuid!) + `/${locationId}`;
    return Axios.delete(url, getAxiosConfig());
}

const LocationClient: TagClient = {
    get,
    add,
    edit,
    delete: deleteLocation,
};

export default LocationClient;
