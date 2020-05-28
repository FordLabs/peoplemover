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
import {wait} from '@testing-library/react';
import AssignmentClient from '../Assignments/AssignmentClient';
import {CreateAssignmentsRequest, ProductPlaceholderPair} from "../Assignments/CreateAssignmentRequest";
import TestUtils from "./TestUtils";

describe('the assignment client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Axios.post = jest.fn(() => Promise.resolve({} as AxiosResponse));
    });

    it('should post once per product when you call createAssignmentsUsingIds', async () => {
        const productIds = [1, 2, 3, 4];
        const personId = 101;
        const placeholderValues = [false, false, true, false];

        await AssignmentClient.createAssignmentsUsingIds(personId, productIds, placeholderValues);

        await wait(() => {
            const spy = jest.spyOn(Axios, 'post');
            expect(spy).toBeCalledTimes(4);
            expect(spy.mock.calls[0][1]).toEqual({
                personId: 101,
                productId: 1,
                placeholder: false,
            });
            expect(spy.mock.calls[1][1]).toEqual({
                personId: 101,
                productId: 2,
                placeholder: false,
            });
            expect(spy.mock.calls[2][1]).toEqual({
                personId: 101,
                productId: 3,
                placeholder: true,
            });
            expect(spy.mock.calls[3][1]).toEqual({
                personId: 101,
                productId: 4,
                placeholder: false,
            });
        });
    });

    it('should assume placeholder=false if you do not specify it when calling createAssignmentsUsingIds', async () => {
        const productIds = [1, 2, 3, 4];
        const personId = 101;

        await AssignmentClient.createAssignmentsUsingIds(personId, productIds);

        await wait(() => {
            const spy = jest.spyOn(Axios, 'post');
            expect(spy).toBeCalledTimes(4);
            expect(spy.mock.calls[0][1]).toEqual({
                personId: 101,
                productId: 1,
                placeholder: false,
            });
            expect(spy.mock.calls[1][1]).toEqual({
                personId: 101,
                productId: 2,
                placeholder: false,
            });
            expect(spy.mock.calls[2][1]).toEqual({
                personId: 101,
                productId: 3,
                placeholder: false,
            });
            expect(spy.mock.calls[3][1]).toEqual({
                personId: 101,
                productId: 4,
                placeholder: false,
            });
        });
    });

    it('should get all assignments for given date', async () => {
        const spaceId = 10;
        const date = new Date(2019,1,10);

        Axios.get = jest.fn();
        process.env.REACT_APP_URL = 'testUrl/';

        const expectedUrl = `testUrl/assignment/${spaceId}/2019-02-10`;
        const expectedConfig = {
            headers: {'Content-Type': 'application/json'},
        };

        await AssignmentClient.getAssignmentsUsingDate(spaceId, date);

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should get all assignments for given personId and date', async () => {
        const personId = 10;
        const date = new Date(2019,1,10);

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
            placeholder: false
        };

        const expectedCreateAssignmentRequest: CreateAssignmentsRequest = {
            requestedDate: date,
            person: TestUtils.person1,
            products: [productPlaceholderPair],

        };

        Axios.post = jest.fn();
        process.env.REACT_APP_URL = 'testUrl/';

        const expectedUrl = 'testUrl/assignment';
        const expectedConfig = {
            headers: {'Content-Type': 'application/json'},
        };

        await AssignmentClient.createAssignmentForDate(expectedCreateAssignmentRequest);

        expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedCreateAssignmentRequest, expectedConfig);
    });
});
