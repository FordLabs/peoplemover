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
import {SpaceLocation} from './SpaceLocation';
import {TraitAddRequest} from '../Traits/TraitAddRequest';
import {TraitEditRequest} from '../Traits/TraitEditRequest';
import {TraitClient} from '../Traits/TraitClient';
import {getToken} from '../Auth/TokenProvider';
import {Trait} from "../Traits/Trait";
import {Space} from "../Space/Space";

class LocationClient implements TraitClient {
    private getBaseLocationsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/locations';
    }

    async get(spaceUuid: string): Promise<AxiosResponse<SpaceLocation[]>> {
        const url = this.getBaseLocationsUrl(spaceUuid);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }

    async add(addRequest: TraitAddRequest, space: Space): Promise<AxiosResponse<Trait>> {
        const url = this.getBaseLocationsUrl(space.uuid!!);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, addRequest, config);
    }

    async edit(editRequest: TraitEditRequest, space: Space): Promise<AxiosResponse<Trait>> {
        const url = this.getBaseLocationsUrl(space.uuid!!);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, editRequest, config);
    }

    async delete(trait: Trait, space: Space): Promise<AxiosResponse> {
        const url = this.getBaseLocationsUrl(space.uuid!!) + `/${trait.id}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config);
    }
}

export default new LocationClient();
