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
import AssignmentClient from '../Assignments/AssignmentClient';
import {CreateAssignmentsRequest, ProductPlaceholderPair} from '../Assignments/CreateAssignmentRequest';
import TestUtils from './TestUtils';
import {Assignment} from "../Assignments/Assignment";
import {Person} from "../People/Person";
import moment from "moment";

describe('the assignment client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Axios.post = jest.fn(() => Promise.resolve({} as AxiosResponse));
    });

    it('should get all assignments for given personId and date', async () => {
        const personId = 10;
        const date = new Date(2019, 1, 10);

        Axios.get = jest.fn();
        process.env.REACT_APP_URL = 'testUrl/';

        const expectedUrl = `testUrl/person/${personId}/assignments/date/2019-02-10`;
        const expectedConfig = {
            headers: {'Content-Type': 'application/json'},
        };

        await AssignmentClient.getAssignmentsUsingPersonIdAndDate(personId, date);

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should create assignments for given date', async () => {
        const spaceId = 10;
        const date = new Date('2019-01-10');
        const productPlaceholderPair: ProductPlaceholderPair = {
            productId: 1,
            placeholder: false,
        };

        const expectedCreateAssignmentRequest: CreateAssignmentsRequest = {
            requestedDate: moment(date).format('YYYY-MM-DD'),
            person: TestUtils.person1,
            products: [productPlaceholderPair],

        };

        Axios.post = jest.fn();
        process.env.REACT_APP_URL = 'testUrl/';

        const expectedUrl = 'testUrl/assignment/create';
        const expectedConfig = {
            headers: {'Content-Type': 'application/json'},
        };

        await AssignmentClient.createAssignmentForDate(expectedCreateAssignmentRequest);

        expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedCreateAssignmentRequest, expectedConfig);
    });

    it('should get all effective dates given space', async () => {
        const spaceId = 10;

        Axios.get = jest.fn();
        process.env.REACT_APP_URL = 'testUrl/';

        const expectedUrl = `testUrl/assignment/dates/${spaceId}`;
        const expectedConfig = {
            headers: {'Content-Type': 'application/json'},
        };

        await AssignmentClient.getAssignmentEffectiveDates(spaceId);

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should delete assignment given assignment', async() => {
        Axios.delete = jest.fn();
        process.env.REACT_APP_URL = 'testUrl/';

        const expectedAssignmentToDelete: Assignment = TestUtils.assignmentForPerson1;

        const expectedUrl = 'testUrl/assignment/delete';
        const expectedConfig = {
            headers: {'Content-Type': 'application/json'},
            data: {'assignmentToDelete': expectedAssignmentToDelete},
        };

        await AssignmentClient.deleteAssignment(expectedAssignmentToDelete);

        expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should delete assignment given person for a specific date', async () => {
        Axios.delete = jest.fn();
        process.env.REACT_APP_URL = 'testUrl/';

        const expectedUrl = 'testUrl/assignment/delete/' + TestUtils.originDateString;
        const expectedConfig = {
            headers: {'Content-Type': 'application/json'},
            data: {'person': TestUtils.person1},
        };
        await AssignmentClient.deleteAssignmentForDate(new Date(2019, 0, 1), TestUtils.person1);

        expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should get reassignments given assignment', async() => {
        Axios.get = jest.fn();
        process.env.REACT_APP_URL = 'testUrl/';

        const spaceId = 1;
        const requestedDate = new Date(2020, 5, 20);

        const expectedAssignmentToDelete: Assignment = TestUtils.assignmentForPerson1;

        const expectedUrl = `testUrl/reassignment/${spaceId}/2020-06-20`;
        const expectedConfig = {
            headers: {'Content-Type': 'application/json'},
        };

        await AssignmentClient.getReassignments(spaceId, requestedDate);

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });
});
