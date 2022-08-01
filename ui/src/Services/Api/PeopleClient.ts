/*
 * Copyright (c) 2022 Ford Motor Company
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
import {Space} from 'Types/Space';
import {Person} from '../../Types/Person';
import {getAxiosConfig} from '../../Utils/getAxiosConfig';

function getBasePeopleUrl(spaceUuid: string): string {
    return '/api/spaces/' + spaceUuid + '/people';
}

async function getAllPeopleInSpace(spaceUuid: string): Promise<AxiosResponse> {
    const url = getBasePeopleUrl(spaceUuid);
    return Axios.get(url, getAxiosConfig());
}

async function createPersonForSpace(space: Space, person: Person): Promise<AxiosResponse> {
    const url = getBasePeopleUrl(space.uuid || '');
    return Axios.post(url, person, getAxiosConfig());
}

async function archivePerson(space: Space, person: Person, archiveDate: Date): Promise<AxiosResponse> {
    const url = getBasePeopleUrl(space.uuid!) + '/' + person.id + '/archive';
    return Axios.post(url, {archiveDate: archiveDate}, getAxiosConfig());
}

async function updatePerson(space: Space, person: Person): Promise<AxiosResponse> {
    const url = getBasePeopleUrl(space.uuid!) + `/${person.id}`;
    return Axios.put(url, person, getAxiosConfig())
}

async function removePerson(spaceUuid: string, personId: number): Promise<AxiosResponse> {
    const url = getBasePeopleUrl(spaceUuid) + `/${personId}`;
    return Axios.delete(url, getAxiosConfig());
}

const PeopleClient = {
    getAllPeopleInSpace,
    createPersonForSpace,
    archivePerson,
    updatePerson,
    removePerson
}


export default PeopleClient;
