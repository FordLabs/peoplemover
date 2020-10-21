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
import AssignmentClient from './AssignmentClient';
import {CreateAssignmentsRequest, ProductPlaceholderPair} from './CreateAssignmentRequest';
import TestUtils from '../tests/TestUtils';
import {Assignment} from './Assignment';
import moment from 'moment';
import Cookies from 'universal-cookie';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';

declare let window: MatomoWindow;

describe('the assignment client', () => {

    let originalWindow: Window;
    const cookies = new Cookies();
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        cookies.set('accessToken', '123456');
        Axios.get = jest.fn(() => Promise.resolve({} as AxiosResponse));
        Axios.post = jest.fn(() => Promise.resolve({} as AxiosResponse));
        Axios.delete = jest.fn(() => Promise.resolve({} as AxiosResponse));
        originalWindow = window;
    });

    afterEach(function() {
        cookies.remove('accessToken');
        (window as Window) = originalWindow;
    });

    it('should get all assignments for given personId and date', async () => {
        const personId = 10;
        const date = new Date(2019, 1, 10);

        const expectedUrl = `/api/person/${personId}/assignments/date/2019-02-10`;

        await AssignmentClient.getAssignmentsUsingPersonIdAndDate(personId, date);

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should create assignments for given date and send matomo event', async () => {
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

        const expectedUrl = '/api/assignment/create';

        await AssignmentClient.createAssignmentForDate(expectedCreateAssignmentRequest);

        expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedCreateAssignmentRequest, expectedConfig);
        expect(window._paq).toContainEqual(['trackEvent', 'person', 'assign', TestUtils.person1.name]);
    });

    it('should send matomo error event if assign person fails', async () => {
        Axios.post = jest.fn(() => Promise.reject({code: 417} as any));

        const expectedCreateAssignmentRequest: CreateAssignmentsRequest = {
            requestedDate: moment(new Date()).format('YYYY-MM-DD'),
            person: TestUtils.person1,
            products: [],

        };

        try {
            await AssignmentClient.createAssignmentForDate(expectedCreateAssignmentRequest);
        } catch (err) {
            expect(window._paq).toContainEqual(['trackEvent', 'personError', 'assign', TestUtils.person1.name, 417]);
        }

    });

    it('should get all effective dates given space', async () => {
        const spaceUuid = 'UUUUUUUUUIDDDD';

        const expectedUrl = `/api/assignment/dates/${spaceUuid}`;

        await AssignmentClient.getAssignmentEffectiveDates(spaceUuid);

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should delete assignment given assignment', async () => {
        const expectedAssignmentToDelete: Assignment = TestUtils.assignmentForPerson1;

        const expectedUrl = '/api/assignment/delete';
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 123456',
            },
            data: {'assignmentToDelete': expectedAssignmentToDelete},
        };

        await AssignmentClient.deleteAssignment(expectedAssignmentToDelete);

        expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should delete assignment given person for a specific date', async () => {
        const expectedUrl = '/api/assignment/delete/' + TestUtils.originDateString;
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 123456',
            },
            data: TestUtils.person1,
        };
        await AssignmentClient.deleteAssignmentForDate(new Date(2019, 0, 1), TestUtils.person1);

        expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should get reassignments given assignment', async () => {
        const spaceUuid = 'spaceuuid';
        const requestedDate = new Date(2020, 5, 20);

        const expectedUrl = `/api/reassignment/${spaceUuid}/2020-06-20`;

        await AssignmentClient.getReassignments(spaceUuid, requestedDate);

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });
});
