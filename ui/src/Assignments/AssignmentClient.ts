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
import {CreateAssignmentsRequest} from './CreateAssignmentRequest';
import moment from 'moment';
import {Assignment} from './Assignment';
import {Person} from '../People/Person';
import {getToken} from '../Auth/TokenProvider';
import MatomoEvents from "../Matomo/MatomoEvents";

class AssignmentClient {

    static async createAssignmentForDate(assignment: CreateAssignmentsRequest): Promise<AxiosResponse> {
        const url = `/api/assignment/create`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        };

        return Axios.post(url, assignment, {headers}).then(result => {
            MatomoEvents.pushEvent('person', 'assign', assignment.person.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent('personError', 'assign', assignment.person.name, err.code);
            return Promise.reject(err);
        });
    }

    static async getAssignmentsUsingPersonIdAndDate(personId: number, date: Date): Promise<AxiosResponse> {
        const dateAsString = moment(date).format('YYYY-MM-DD');
        const url = `/api/person/${personId}/assignments/date/${dateAsString}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        };

        return Axios.get(url, {headers});
    }

    static async getAssignmentEffectiveDates(spaceUuid: string): Promise<AxiosResponse> {
        const url = `/api/assignment/dates/${spaceUuid}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        };

        return Axios.get(url, {headers} );
    }

    static async deleteAssignment(assignmentToDelete: Assignment): Promise<AxiosResponse> {
        const url = `/api/assignment/delete`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        };

        return Axios.delete(url, {headers, data: {'assignmentToDelete': assignmentToDelete}});
    }

    static async deleteAssignmentForDate(date: Date, person: Person): Promise<AxiosResponse> {
        const dateAsString = moment(date).format('YYYY-MM-DD');
        const url = `/api/assignment/delete/${dateAsString}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        };

        return Axios.delete(url, {headers, data: person});
    }

    static async getReassignments(spaceUuid: string, requestedDate: Date): Promise<AxiosResponse> {
        const formattedDate = moment(requestedDate).format('YYYY-MM-DD');
        const url = `/api/reassignment/` + spaceUuid + '/' + formattedDate;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        };

        return Axios.get(url, {headers});
    }
}

export default AssignmentClient;
