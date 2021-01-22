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

import Axios, {AxiosResponse} from 'axios';
import {RoleAddRequest} from './RoleAddRequest.interface';
import {RoleEditRequest} from './RoleEditRequest.interface';
import {TagClient} from '../Tags/TagClient.interface';
import {getToken} from '../Auth/TokenProvider';
import MatomoEvents from '../Matomo/MatomoEvents';
import {Space} from '../Space/Space';

class RoleClient implements TagClient {
    private getBaseRolesUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/roles';
    }

    async get(spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseRolesUrl(spaceUuid);
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }

    async add(role: RoleAddRequest, space: Space): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBaseRolesUrl(space.uuid!!);
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, role, config).then((result) => {
            MatomoEvents.pushEvent(space.name, 'addRole', role.name);
            return result;
        }).catch((err) => {
            MatomoEvents.pushEvent(space.name, 'addRoleError', role.name, err.code);
            return Promise.reject(err);
        });
    }

    async edit(role: RoleEditRequest, space: Space): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBaseRolesUrl(space.uuid!!);
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, role, config).then((result) => {
            MatomoEvents.pushEvent(space.name, 'editRole', role.name);
            return result;
        }).catch((err) => {
            MatomoEvents.pushEvent(space.name, 'editRoleError', role.name, err.code);
            return Promise.reject(err);
        });
    }

    async delete(roleId: number, space: Space): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBaseRolesUrl(space.uuid!!) + `/${roleId}`;
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config).then((result) => {
            MatomoEvents.pushEvent(space.name, 'deleteRole', roleId.toString());
            return result;
        }).catch((err) => {
            MatomoEvents.pushEvent(space.name, 'deleteRoleError', roleId.toString(), err.code);
            return Promise.reject(err);
        });
    }
}

export default new RoleClient();
