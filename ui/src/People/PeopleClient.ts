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
import {Person} from './Person';
import {getToken} from '../Auth/TokenProvider';
import {Space} from '../Space/Space';
import MatomoEvents from '../Matomo/MatomoEvents';

class PeopleClient {

    private static getBasePeopleUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/people';
    }

    private static config(): object {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };
    }

    static async getAllPeopleInSpace(spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBasePeopleUrl(spaceUuid);

        return Axios.get(url, this.config());
    }

    static async createPersonForSpace(space: Space, person: Person, personTagModified: string[]): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBasePeopleUrl(space.uuid!);

        return Axios.post(url, person, this.config()).then(result => {
            MatomoEvents.pushEvent(space.name, 'addPerson', person.name);
            if (personTagModified.length > 0 ) MatomoEvents.pushEvent(space.name, 'assignPersonTagToANewPerson', personTagModified.toString());
            return result;
        }).catch( err => {
            MatomoEvents.pushEvent(space.name, 'addPersonError', person.name, err.code);
            return Promise.reject(err.code);
        });
    }

    static async archivePerson(space: Space, person: Person, archiveDate: Date): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBasePeopleUrl(space.uuid!) + '/' + person.id + '/archive';
        return Axios.post(url, {archiveDate: archiveDate}, this.config());
    }

    static async updatePerson(space: Space, person: Person, personTagModified: string[]): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBasePeopleUrl(space.uuid!!) + `/${person.id}`;

        return Axios.put(url, person, this.config()).then(result => {
            MatomoEvents.pushEvent(space.name, 'editPerson', person.name);
            if (personTagModified.length > 0 ) MatomoEvents.pushEvent(space.name, 'assignPersonTagToAnAlreadyExistingPerson', personTagModified.toString());
            return result;
        }).catch( err => {
            MatomoEvents.pushEvent(space.name, 'editPersonError', person.name, err.code);
            return Promise.reject(err.code);
        });
    }

    static async removePerson(spaceUuid: string, personId: number): Promise<AxiosResponse> {
        const url = this.getBasePeopleUrl(spaceUuid) + `/${personId}`;

        return Axios.delete(url, this.config());
    }

    static async bulkImportPeople(space: Space, person: Person,people: string): Promise<AxiosResponse> {
        const url = this.getBasePeopleUrl(space.uuid!!) + `/${person.id}`;

        return Axios.post(url, person, this.config()).then(result => {
            return result;
        }).catch( err => {
            return Promise.reject(err.code);
        });
    }
}

export default PeopleClient;
