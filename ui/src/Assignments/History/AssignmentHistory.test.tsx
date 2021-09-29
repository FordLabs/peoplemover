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
import {act, render, RenderResult} from '@testing-library/react';
import {AssignmentHistory} from './AssignmentHistory';
import ProductClient from '../../Products/ProductClient';
import moment, {now} from 'moment';
import {fireEvent} from '@testing-library/dom';

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

    async function clickLabel(renderResult: RenderResult): Promise<void> {
        const historyLabel = await renderResult.findByText('View Assignment History');
        expect(historyLabel).toBeInTheDocument();
        fireEvent.click(historyLabel);
    }

    const checkProductAndDates = (products: string[], dates: string[], container: HTMLElement, isCurrent: boolean) => {
        if (products.length === dates.length) {
            products.forEach((product, i) => {
                const historyEntry = container.children[isCurrent ? 1 : 3].children[i];
                expect(historyEntry.children[0].innerHTML).toEqual(products[i]);
                expect(historyEntry.children[1].innerHTML).toEqual(dates[i]);
            });
        } else {
            fail('differing array lengths');
        }
    };

    const checkCurrentProductAndDates = (products: string[], dates: string[], container: HTMLElement) => {
        checkProductAndDates(products, dates, container, true);
    };

    const checkPastProductAndDates = (products: string[], dates: string[], container: HTMLElement) => {
        checkProductAndDates(products, dates, container, false);
    };

    it('should not show history until it has been dropped down', async () => {
        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);
        await actual.findByText('View Assignment History');
        expect(await actual.queryByText('Hanky Product')).not.toBeInTheDocument();
        expect(await actual.findByTestId('assignmentHistoryArrow')).toBeInTheDocument();
    });

    it('should show the history happy path', async () => {

        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);

        const expectedDuration = Math.floor(moment.duration(moment(now()).startOf('day').diff(moment(TestUtils.assignmentForHank.startDate).startOf('day'))).asDays()) + 1;
        const str = '01/01/2020 - Current \\(' + expectedDuration + ' days\\)';
        const regex = new RegExp(str);
        await clickLabel(actual);
        await actual.findByText(/Hanky Product/);
        await actual.findByText(regex);
        await actual.findByText('past:');
        await actual.findByText(/Unassigned/);
        await actual.findByText(/12\/01\/2019 - 12\/31\/2019 \(31 days\)/);
        await actual.findByText(/Product 3/);
        await actual.findByText(/10\/01\/2019 - 11\/30\/2019 \(61 days\)/);
    });

    it('should sort the history in reverse chrono', async () => {
        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);
        await clickLabel(actual);

        const expectedDuration = Math.floor(moment.duration(moment(now()).startOf('day').diff(moment(TestUtils.assignmentForHank.startDate).startOf('day'))).asDays()) + 1;
        await actual.findByText('Hanky Product');
        checkCurrentProductAndDates(['Hanky Product'],
            ['01/01/2020 - Current (' + expectedDuration + ' days)'],
            actual.container);
        checkPastProductAndDates(['Unassigned', 'Product 3'],
            ['12/01/2019 - 12/31/2019 (31 days)', '10/01/2019 - 11/30/2019 (61 days)'],
            actual.container);
    });

    it('should show assignments with a future end date w.r.t. today as "current", and not show future assignments', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn(() => Promise.resolve({
            data: [{...TestUtils.assignmentForHank, endDate: new Date(2119, 8, 30)},
                TestUtils.assignmentVacationForHank,
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

        const expectedDuration = Math.floor(moment.duration(moment(now()).startOf('day').diff(moment(TestUtils.assignmentForHank.startDate).startOf('day'))).asDays()) + 1;

        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);
        await clickLabel(actual);
        checkCurrentProductAndDates(['Hanky Product'], ['01/01/2020 - Current (' + expectedDuration + ' days)'], actual.container);
        checkPastProductAndDates(['Unassigned'], ['12/01/2019 - 12/31/2019 (31 days)'], actual.container);
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
        await clickLabel(actual);

        await actual.findByText(/Unknown Product/);
        await actual.findByText(/01\/01\/2020 - Current/);
        await actual.findByText(/Unassigned/);
        await actual.findByText(/12\/01\/2019 - 12\/31\/2019 \(31 days\)/);
        await actual.findByText(/Product 3/);
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
            await clickLabel(actual);

            expect(actual.queryByText(/Hanky Product/)).not.toBeInTheDocument();
            expect(actual.queryByText(/01\/01\/2020 - Current/)).not.toBeInTheDocument();
            await actual.findByText(/Unassigned/);
            await actual.findByText(/12\/01\/2019 - 12\/31\/2019 \(31 days\)/);
            await actual.findByText(/Product 3/);
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
        await clickLabel(actual);

        await act(async () => {
            await actual.findByText(/Hanky Product/);
            await actual.findByText(/01\/01\/2020 - Current/);
            await actual.findByText(/Unassigned/);
            await actual.getByText(/12\/01\/2019 - 12\/31\/2019 \(31 days\)/);
            await actual.getByText(/Product 3/);
            await actual.getByText(/10\/01\/2019 - 11\/30\/2019 \(61 days\)/);
        });
    });

    it('should show multiple current assignments in the current section', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn(() => Promise.resolve({
            data: [{...TestUtils.assignmentForHank, endDate: new Date(2119, 8, 30)},
                TestUtils.assignmentVacationForHank,
                {
                    id: 2100,
                    productId: 3,
                    person: TestUtils.hank,
                    placeholder: false,
                    spaceUuid: TestUtils.hank.spaceUuid,
                    startDate: TestUtils.assignmentForHank.startDate,
                    endDate: TestUtils.assignmentForHank.endDate,
                },
            ],
        } as AxiosResponse));

        const expectedDuration = Math.floor(moment.duration(moment(now()).startOf('day').diff(moment(TestUtils.assignmentForHank.startDate).startOf('day'))).asDays()) + 1;

        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);
        await clickLabel(actual);
        checkCurrentProductAndDates(['Hanky Product', TestUtils.productWithoutAssignments.name],
            ['01/01/2020 - Current (' + expectedDuration + ' days)', '01/01/2020 - Current (' + expectedDuration + ' days)'],
            actual.container);
        checkPastProductAndDates(['Unassigned'], ['12/01/2019 - 12/31/2019 (31 days)'], actual.container);
    });
});
