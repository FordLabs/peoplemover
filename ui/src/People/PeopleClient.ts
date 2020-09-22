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
import {Person} from './Person';
import {getToken} from '../Auth/TokenProvider';

class PeopleClient {
    static async getAllPeopleInSpace(): Promise<AxiosResponse> {
        let url = `/api/person/${this.getSpaceUuid()}`;
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };
        return Axios.get(url, config);
    }

    static getSpaceUuid(): string {
        return window.location.pathname.substr(1);
    }

    static async createPersonForSpace(person: Person): Promise<AxiosResponse> {
        let url = `/api/person/${this.getSpaceUuid()}`;
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };
        return Axios.post(url, person, config);
    }

    static async updatePerson(person: Person): Promise<AxiosResponse> {
        let url = `/api/person`;
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };
        return Axios.put(url, person, config);
    }

    static async removePerson(personId: number): Promise<AxiosResponse> {
        let url = `/api/person/${personId}`;
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };
        return Axios.delete(url, config);
    }
}

export default PeopleClient;
