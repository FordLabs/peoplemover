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
import {getToken} from "../Auth/TokenProvider";


class LocationClient implements TraitClient {

    async get(spaceUuid: string): Promise<AxiosResponse<SpaceLocation[]>> {
        return Axios.get(
            `/api/location/${spaceUuid}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
            }
        );
    }

    async add(locationAddRequest: TraitAddRequest, spaceUuid: string): Promise<AxiosResponse> {
        return Axios.post(
            `/api/location/${spaceUuid}`,
            locationAddRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
            }
        );
    }

    async edit(locationEditRequest: TraitEditRequest, spaceUuid: string): Promise<AxiosResponse<SpaceLocation>> {
        return Axios.put(
            `/api/location/${spaceUuid}`,
            locationEditRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
            }
        );
    }

    async delete(id: number): Promise<AxiosResponse> {
        const spaceUuid = window.location.pathname.substr(1);

        return Axios.delete(`/api/location/${spaceUuid}/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
            });
    }
}

export default new LocationClient();
