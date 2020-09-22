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

import Axios, {AxiosResponse} from 'axios';
import {RoleAddRequest} from './RoleAddRequest';
import {RoleEditRequest} from './RoleEditRequest';
import {TraitClient} from '../Traits/TraitClient';

class RoleClient implements TraitClient {
    private getBaseRolesUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/roles';
    }

    async get(spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseRolesUrl(spaceUuid);
        return Axios.get(url);
    }

    async add(role: RoleAddRequest, spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseRolesUrl(spaceUuid);
        const config = { headers: { 'Content-Type': 'application/json' } };
        return Axios.post(url, role, config);
    }

    async edit(role: RoleEditRequest, spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseRolesUrl(spaceUuid);
        const config = { headers: { 'Content-Type': 'application/json' } };
        return Axios.put(url, role, config);
    }

    async delete(roleId: number, spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseRolesUrl(spaceUuid) + `/${roleId}`;
        return Axios.delete(url);
    }
}

export default new RoleClient();
