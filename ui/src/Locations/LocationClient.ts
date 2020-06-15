/*
 * Copyright (c) 2019 Ford Motor Company
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

    async get(spaceName: string): Promise<AxiosResponse<SpaceLocation[]>> {
        return Axios.get(
            process.env.REACT_APP_URL + 'location/' + spaceName,
        );
    }

    async add(locationAddRequest: TraitAddRequest, spaceName: string): Promise<AxiosResponse> {
        return Axios.post(
            process.env.REACT_APP_URL + 'location/' + spaceName,
            locationAddRequest
        );
    }

    async edit(locationEditRequest: TraitEditRequest, spaceName: string): Promise<AxiosResponse<SpaceLocation>> {
        return Axios.put(`${process.env.REACT_APP_URL}location/${spaceName}`,
            locationEditRequest
        );
    }

    async delete(id: number): Promise<AxiosResponse> {
        const spaceToken = window.location.pathname.substr(1);

        return Axios.delete(`${process.env.REACT_APP_URL}location/${spaceToken}/${id}`);
    }
}

export default new LocationClient();