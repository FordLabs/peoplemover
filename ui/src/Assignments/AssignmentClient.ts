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
import {CreateAssignmentsRequest} from './CreateAssignmentRequest';
import moment from 'moment';
import {Assignment} from './Assignment';
import {Person} from '../People/Person';

class AssignmentClient {
    static async createAssignmentForDate(assignment: CreateAssignmentsRequest): Promise<AxiosResponse> {
        return Axios.post(`/api/assignment/create`, assignment,
            {headers: { 'Content-Type': 'application/json'}}
        );
    }

    static async getAssignmentsUsingPersonIdAndDate(personId: number, date: Date): Promise<AxiosResponse> {
        const dateAsString = moment(date).format('YYYY-MM-DD');
        return Axios.get('/api/person/' + personId + '/assignments/date/' + dateAsString,
            {headers: { 'Content-Type': 'application/json'}}
        );
    }

    static async getAssignmentEffectiveDates(spaceUuid: string): Promise<AxiosResponse> {
        return Axios.get('/api/assignment/dates/' + spaceUuid,
            {headers: { 'Content-Type': 'application/json'}}
        );
    }

    static async deleteAssignment(assignmentToDelete: Assignment): Promise<AxiosResponse> {
        return Axios.delete(`/api/assignment/delete`,
            {
                headers: { 'Content-Type': 'application/json'},
                data: {'assignmentToDelete': assignmentToDelete},
            }
        );
    }

    static async deleteAssignmentForDate(date: Date, person: Person): Promise<AxiosResponse> {
        const dateAsString = moment(date).format('YYYY-MM-DD');
        return Axios.delete(`/api/assignment/delete/` + dateAsString,
            {
                headers: { 'Content-Type': 'application/json'},
                data: person,
            }
        );
    }

    static async getReassignments(spaceId: number, requestedDate: Date): Promise<AxiosResponse> {
        const formattedDate = moment(requestedDate).format('YYYY-MM-DD');
        return Axios.get(`/api/reassignment/` + spaceId + '/' + formattedDate,
            {headers: { 'Content-Type': 'application/json'}}
        );
    }
}

export default AssignmentClient;
