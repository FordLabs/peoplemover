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

import Axios from 'axios';
import AssignmentClient from './AssignmentClient';
import {CreateAssignmentsRequest, ProductPlaceholderPair} from '../../Assignments/CreateAssignmentRequest';
import TestData from '../../Utils/TestData';
import moment from 'moment';
import Cookies from 'universal-cookie';
import {MatomoWindow} from '../../Types/MatomoWindow';

declare let window: MatomoWindow;

jest.mock('axios');

describe('Assignment client', () => {

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
        Axios.get = jest.fn().mockResolvedValue({});
        Axios.post = jest.fn().mockResolvedValue({});
        Axios.delete = jest.fn().mockResolvedValue({});
        originalWindow = window;
        window._paq = [];
    });

    afterEach(function() {
        cookies.remove('accessToken');
        (window as Window) = originalWindow;
    });

    it('should get all assignments for given personId and date', async () => {
        const testUuid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
        const personId = 10;
        const date = new Date(2019, 1, 10);

        const expectedUrl = `/api/spaces/${testUuid}/person/${personId}/assignments/date/2019-02-10`;
        await AssignmentClient.getAssignmentsUsingPersonIdAndDate(testUuid, personId, date);

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
            products: [productPlaceholderPair],

        };

        const expectedUrl = `/api/spaces/${TestData.space.uuid}/person/${TestData.person1.id}/assignment/create`;

        await AssignmentClient.createAssignmentForDate(
            moment(date).format('YYYY-MM-DD'),
            [productPlaceholderPair],
            TestData.space,
            TestData.person1
        );

        expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedCreateAssignmentRequest, expectedConfig);
        expect(window._paq).toContainEqual(['trackEvent', TestData.space.name, 'assignPerson', TestData.person1.name]);
    });

    it('should send matomo error event if assign person fails', async () => {
        Axios.post = jest.fn().mockRejectedValue({code: 417});

        try {
            await AssignmentClient.createAssignmentForDate(
                moment(new Date()).format('YYYY-MM-DD'),
                [],
                TestData.space,
                TestData.person1
            );
        } catch (err) {
            expect(window._paq).toContainEqual(
                ['trackEvent', TestData.space.name, 'assignPersonError', TestData.person1.name, 417]
            );
        }
    });

    it('should not send matomo event if sendEvent is false', async () => {
        await AssignmentClient.createAssignmentForDate(
            moment(new Date()).format('YYYY-MM-DD'),
            [],
            TestData.space,
            TestData.person1,
            false
        );
        expect(window._paq).not.toContainEqual(
            ['trackEvent', TestData.space.name, 'assignPerson', TestData.person1.name]
        );
    });

    it('should send not matomo error event if sendEvent is false', async () => {
        Axios.post = jest.fn().mockRejectedValue({code: 417});

        try {
            await AssignmentClient.createAssignmentForDate(
                moment(new Date()).format('YYYY-MM-DD'),
                [],
                TestData.space,
                TestData.person1,
                false
            );
        } catch (err) {
            expect(window._paq).not.toContainEqual(
                ['trackEvent', TestData.space.name, 'assignPersonError', TestData.person1.name, 417]
            );
        }

    });

    it('should get all effective dates given space', async () => {
        const spaceUuid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
        const expectedUrl = `/api/spaces/${spaceUuid}/assignment/dates`;

        await AssignmentClient.getAssignmentEffectiveDates(spaceUuid);

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should delete assignment given person for a specific date', async () => {
        const expectedUrl = `/api/spaces/${TestData.person1.spaceUuid}/person/${TestData.person1.id}/assignment/delete/${TestData.originDateString}`;
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 123456',
            },
            data: TestData.person1,
        };
        await AssignmentClient.deleteAssignmentForDate(new Date(2019, 0, 1), TestData.person1);

        expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should request assignment history summary from the API', async () => {
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 123456',
            },
        };
        await AssignmentClient.getAssignmentsV2ForSpaceAndPerson(TestData.hank.spaceUuid, TestData.hank.id);
        expect(Axios.get).toHaveBeenCalledWith('/api/v2/spaces/' + TestData.hank.spaceUuid + '/person/' + TestData.hank.id + '/assignments', expectedConfig);
    });

    it('should return what it gets from the assignment history summary API', async () => {
        const assignment = TestData.assignmentForHank;
        Axios.get = jest.fn().mockResolvedValue({
            data: [assignment],
        });

        const actual = await AssignmentClient.getAssignmentsV2ForSpaceAndPerson(TestData.hank.spaceUuid, TestData.hank.id);
        expect(actual.data).toEqual([TestData.assignmentForHank]);
    });

    it('should get reassignments given assignment', async () => {
        const spaceUuid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
        const requestedDate = new Date(2020, 5, 20);

        const expectedUrl = `/api/spaces/${spaceUuid}/reassignment/2020-06-20`;

        await AssignmentClient.getReassignments(spaceUuid, requestedDate);

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });
});
