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
import {getToken} from '../Auth/TokenProvider';
import MatomoEvents from "../Matomo/MatomoEvents";
import {Trait} from "../Traits/Trait";
import {TraitAddRequest} from "../Traits/TraitAddRequest";
import {Space} from "../Space/Space";

class RoleClient implements TraitClient {
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

    async add(addRequest: TraitAddRequest, space: Space): Promise<AxiosResponse<Trait>> {
        const url = this.getBaseRolesUrl(space.uuid!!);
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, addRequest, config).then((result) => {
            MatomoEvents.pushEvent(space.name, "addRole", addRequest.name)
            return result;
        });
    }

    async edit(role: RoleEditRequest, spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseRolesUrl(spaceUuid);
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, role, config);
    }

    async delete(roleId: number, spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseRolesUrl(spaceUuid) + `/${roleId}`;
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config);
    }
}

export default new RoleClient();
