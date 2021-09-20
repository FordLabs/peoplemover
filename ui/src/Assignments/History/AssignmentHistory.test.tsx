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

import TestUtils from '../../tests/TestUtils';
import React from 'react';
import AssignmentClient from '../AssignmentClient';
import {AxiosResponse} from 'axios';
import {act, render} from '@testing-library/react';
import {AssignmentHistory} from './AssignmentHistory';
import ProductClient from '../../Products/ProductClient';
import moment, {now} from 'moment';

describe('Assignment History', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn(() => Promise.resolve({
            data: [{...TestUtils.assignmentForHank, endDate: null},
                TestUtils.assignmentVacationForHank,
                TestUtils.previousAssignmentForHank],
        } as AxiosResponse));
        ProductClient.getProductsForDate = jest.fn(() => Promise.resolve({
            data: [TestUtils.productForHank, TestUtils.unassignedProduct, TestUtils.productWithoutAssignments],
        } as AxiosResponse));
    });

    it('should show the history happy path', async () => {

        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);

        const expectedDuration = Math.floor(moment.duration(moment(now()).startOf('day').diff(moment(TestUtils.assignmentForHank.startDate).startOf('day'))).asDays()) + 1;
        const str = '01/01/2020 - Current \\(' + expectedDuration + ' days\\)';
        const regex = new RegExp(str);

        await actual.findByText('Hanky Product');
        await actual.findByText(regex);
        await actual.findByText('Unassigned');
        await actual.findByText(/12\/01\/2019 - 12\/31\/2019 \(31 days\)/);
        await actual.findByText('Product 3');
        await actual.findByText(/10\/01\/2019 - 11\/30\/2019 \(61 days\)/);
    });

    it('should sort the history in reverse chrono', async () => {
        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);

        const tableCells = await actual.findAllByRole('cell');
        expect(tableCells.length).toEqual(6);
        expect(tableCells[0].firstChild!.nodeValue).toEqual('Hanky Product');
        expect(tableCells[2].firstChild!.nodeValue).toEqual('Unassigned');
        expect(tableCells[4].firstChild!.nodeValue).toEqual('Product 3');
    });

    it('should not show assignments from the future w.r.t. today', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn(() => Promise.resolve({
            data: [{...TestUtils.assignmentForHank, endDate: null},
                TestUtils.assignmentVacationForHank,
                TestUtils.previousAssignmentForHank,
                {
                    id: 2100,
                    productId: 3,
                    person: TestUtils.hank,
                    placeholder: false,
                    spaceUuid: TestUtils.hank.spaceUuid,
                    startDate: new Date(2119, 9, 1),
                    endDate: new Date(2119, 10, 30),
                },
            ],
        } as AxiosResponse));

        await act(async () => {
            const actual = render(<AssignmentHistory person={TestUtils.hank}/>);
            expect(await actual.queryByText(/Product 3 10\/01\/2119 - 11\/30\/2119/)).not.toBeInTheDocument();
        });
    });

    it('does not blow up if an assignment has no matching product', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn(() => Promise.resolve({
            data: [{...TestUtils.assignmentForHank, endDate: null},
                TestUtils.assignmentVacationForHank,
                TestUtils.previousAssignmentForHank],
        } as AxiosResponse));
        ProductClient.getProductsForDate = jest.fn(() => Promise.resolve({
            data: [TestUtils.unassignedProduct, TestUtils.productWithoutAssignments],
        } as AxiosResponse));

        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);

        await actual.findByText('Unknown Product');
        await actual.findByText(/01\/01\/2020 - Current/);
        await actual.findByText('Unassigned');
        await actual.findByText(/12\/01\/2019 - 12\/31\/2019 \(31 days\)/);
        await actual.findByText('Product 3');
        await actual.findByText(/10\/01\/2019 - 11\/30\/2019 \(61 days\)/);
    });

    it('does not blow up if an assignment has no start date, and does not show a line in the table for it', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn(() => Promise.resolve({
            data: [{...TestUtils.assignmentForHank, endDate: null, startDate: null},
                TestUtils.assignmentVacationForHank,
                TestUtils.previousAssignmentForHank],
        } as AxiosResponse));
        ProductClient.getProductsForDate = jest.fn(() => Promise.resolve({
            data: [TestUtils.unassignedProduct, TestUtils.productWithoutAssignments],
        } as AxiosResponse));
        await act(async () => {
            const actual = render(<AssignmentHistory person={TestUtils.hank}/>);
            expect(actual.queryByText('Hanky Product')).not.toBeInTheDocument();
            expect(actual.queryByText(/01\/01\/2020 - Current/)).not.toBeInTheDocument();
            await actual.findByText('Unassigned');
            await actual.findByText(/12\/01\/2019 - 12\/31\/2019 \(31 days\)/);
            await actual.findByText('Product 3');
            await actual.findByText(/10\/01\/2019 - 11\/30\/2019 \(61 days\)/);
        });
    });

    it('can handle string start dates', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn(() => Promise.resolve({
            data: [{...TestUtils.assignmentForHank, endDate: null, startDate: '2020-01-01'},
                TestUtils.assignmentVacationForHank,
                TestUtils.previousAssignmentForHank],
        } as AxiosResponse));
        ProductClient.getProductsForDate = jest.fn(() => Promise.resolve({
            data: [TestUtils.unassignedProduct, TestUtils.productWithoutAssignments, TestUtils.productForHank],
        } as AxiosResponse));
        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);
        await act(async () => {
            await actual.findByText('Hanky Product');
            await actual.findByText(/01\/01\/2020 - Current/);
            await actual.findByText('Unassigned');
            await actual.getByText(/12\/01\/2019 - 12\/31\/2019 \(31 days\)/);
            await actual.getByText('Product 3');
            await actual.getByText(/10\/01\/2019 - 11\/30\/2019 \(61 days\)/);
        });
    });
});
