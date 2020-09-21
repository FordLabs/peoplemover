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

class LocationClient implements TraitClient {
    private getBaseLocationsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/locations';
    }

    async get(spaceUuid: string): Promise<AxiosResponse<SpaceLocation[]>> {
        const url = this.getBaseLocationsUrl(spaceUuid);
        return Axios.get(url);
    }

    async add(locationAddRequest: TraitAddRequest, spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseLocationsUrl(spaceUuid);
        return Axios.post(url, locationAddRequest);
    }

    async edit(locationEditRequest: TraitEditRequest, spaceUuid: string): Promise<AxiosResponse<SpaceLocation>> {
        const url = this.getBaseLocationsUrl(spaceUuid);
        return Axios.put(url, locationEditRequest);
    }

    async delete(id: number): Promise<AxiosResponse> {
        const spaceUuid = window.location.pathname.substr(1);
        const url = this.getBaseLocationsUrl(spaceUuid) + `/${id}`;
        return Axios.delete(url);
    }
}

export default new LocationClient();
