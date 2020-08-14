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
import {Person} from './Person';

class PeopleClient {
    static async getAllPeopleInSpace(): Promise<AxiosResponse> {
        return Axios.get(
            `/api/person/${this.getSpaceName()}`,
            {headers: {'Content-Type': 'application/json'}}
        );
    }

    static getSpaceName(): string {
        return window.location.pathname.substr(1);
    }

    static async createPersonForSpace(person: Person): Promise<AxiosResponse> {
        return Axios.post(
            `/api/person/${this.getSpaceName()}`,
            person
        );
    }

    static async updatePerson(person: Person): Promise<AxiosResponse> {
        return Axios.put(`/api/person`, person
        );
    }

    static async removePerson(personId: number): Promise<AxiosResponse> {
        return Axios.delete(`/api/person/${personId}`);
    }
}

export default PeopleClient;
