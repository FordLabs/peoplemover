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

import Axios, {AxiosResponse} from 'axios';
import {Tag} from 'Types/Tag';
import {TagRequest} from '../../Types/TagRequest';
import {TagClient} from '../../Types/TagClient';
import {Space} from 'Types/Space';
import {getAxiosConfig} from '../../Utils/getAxiosConfig';

function getBasePersonTagsUrl(spaceUuid: string): string {
    return '/api/spaces/' + spaceUuid + '/person-tags';
}

async function get(spaceUuid: string): Promise<AxiosResponse<Array<Tag>>> {
    const url = getBasePersonTagsUrl(spaceUuid);
    return Axios.get(url, getAxiosConfig());
}

async function add(personTagAddRequest: TagRequest, space: Space): Promise<AxiosResponse> {
    const url = getBasePersonTagsUrl(space.uuid!);
    return Axios.post(url, personTagAddRequest, getAxiosConfig());
}

async function edit(personTagEditRequest: TagRequest, space: Space): Promise<AxiosResponse<Tag>> {
    const url = `${getBasePersonTagsUrl(space.uuid!)}/${personTagEditRequest.id}`;
    return Axios.put(url, personTagEditRequest, getAxiosConfig());
}

async function deletePerson(personTagId: number, space: Space): Promise<AxiosResponse> {
    const url = getBasePersonTagsUrl(space.uuid!) + `/${personTagId}`;
    return Axios.delete(url, getAxiosConfig());
}

const PersonTagClient: TagClient = {
    get,
    add,
    edit,
    delete: deletePerson
}

export default PersonTagClient;