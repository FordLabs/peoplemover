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
import {TagClient} from 'Types/TagClient';
import MatomoEvents from 'Matomo/MatomoEvents';
import {Space} from 'Types/Space';
import {RoleTagRequest} from 'Types/TagRequest';
import {getAxiosConfig} from 'Utils/getAxiosConfig';

function getBaseRolesUrl(spaceUuid: string): string {
    return '/api/spaces/' + spaceUuid + '/roles';
}

async function get(spaceUuid: string): Promise<AxiosResponse> {
    const url = getBaseRolesUrl(spaceUuid);
    return Axios.get(url, getAxiosConfig());
}

async function add(role: RoleTagRequest, space: Space): Promise<AxiosResponse> {
    const url = getBaseRolesUrl(space.uuid || '');
    return Axios.post(url, role, getAxiosConfig()).then((result) => {
        MatomoEvents.pushEvent(space.name, 'addRole', role.name);
        return result;
    }).catch((err) => {
        MatomoEvents.pushEvent(space.name, 'addRoleError', role.name, err.code);
        return Promise.reject(err);
    });
}

async function edit(role: RoleTagRequest, space: Space): Promise<AxiosResponse> {
    const url = `${getBaseRolesUrl(space.uuid || '')}/${role.id}`;
    return Axios.put(url, role, getAxiosConfig()).then((result) => {
        MatomoEvents.pushEvent(space.name, 'editRole', role.name);
        return result;
    }).catch((err) => {
        MatomoEvents.pushEvent(space.name, 'editRoleError', role.name, err.code);
        return Promise.reject(err);
    });
}

async function deleteRole(roleId: number, space: Space): Promise<AxiosResponse> {
    const url = getBaseRolesUrl(space.uuid!) + `/${roleId}`;
    return Axios.delete(url, getAxiosConfig()).then((result) => {
        MatomoEvents.pushEvent(space.name, 'deleteRole', roleId.toString());
        return result;
    }).catch((err) => {
        MatomoEvents.pushEvent(space.name, 'deleteRoleError', roleId.toString(), err.code);
        return Promise.reject(err);
    });
}
const RoleClient: TagClient = {
    get,
    add,
    edit,
    delete: deleteRole
}

export default RoleClient;