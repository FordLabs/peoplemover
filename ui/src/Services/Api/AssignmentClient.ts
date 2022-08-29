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
import {CreateAssignmentsRequest, ProductPlaceholderPair} from 'Types/CreateAssignmentRequest';
import moment from 'moment';
import {Space} from 'Types/Space';
import {Person} from 'Types/Person';
import {getAxiosConfig} from 'Utils/getAxiosConfig';

async function createAssignmentForDate(requestedDate: string, products: Array<ProductPlaceholderPair>, space: Space, person: Person): Promise<AxiosResponse> {
    const url = `/api/spaces/${space.uuid}/person/${person.id}/assignment/create`;
    const assignmentRequest = {
        requestedDate,
        products,
    } as CreateAssignmentsRequest;
    return Axios.post(url, assignmentRequest, getAxiosConfig());
}

async function getAssignmentsUsingPersonIdAndDate(spaceUuid: string, personId: number, date: Date): Promise<AxiosResponse> {
    const dateAsString = moment(date).format('YYYY-MM-DD');
    const url = `/api/spaces/${spaceUuid}/person/${personId}/assignments/date/${dateAsString}`;
    return Axios.get(url, getAxiosConfig());
}

async function getAssignmentEffectiveDates(spaceUuid: string): Promise<AxiosResponse> {
    const url = `/api/spaces/${spaceUuid}/assignment/dates`;
    return Axios.get(url, getAxiosConfig());
}

async function deleteAssignmentForDate(date: Date, person: Person): Promise<AxiosResponse> {
    const dateAsString = moment(date).format('YYYY-MM-DD');
    const url = `/api/spaces/${person.spaceUuid}/person/${person.id}/assignment/delete/${dateAsString}`;
    const config = getAxiosConfig();
    return Axios.delete(url, {...config, data: person});
}

async function getReassignments(spaceUuid: string, requestedDate: Date): Promise<AxiosResponse> {
    const formattedDate = moment(requestedDate).format('YYYY-MM-DD');
    const url = `/api/spaces/${spaceUuid}/reassignment/${formattedDate}`;
    return Axios.get(url, getAxiosConfig());
}

async function getAssignmentsV2ForSpaceAndPerson(spaceUuid: string, personId: number): Promise<AxiosResponse> {
    const url = `/api/v2/spaces/${spaceUuid}/person/${personId}/assignments`;
    return Axios.get(url, getAxiosConfig());
}

const AssignmentClient = {
    createAssignmentForDate,
    getAssignmentsUsingPersonIdAndDate,
    getAssignmentEffectiveDates,
    deleteAssignmentForDate,
    getReassignments,
    getAssignmentsV2ForSpaceAndPerson
}

export default AssignmentClient;