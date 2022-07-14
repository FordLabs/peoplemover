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

import TestData from '../../Utils/TestData';
import React from 'react';
import AssignmentClient from '../AssignmentClient';
import {act, render, RenderResult} from '@testing-library/react';
import {AssignmentHistory} from './AssignmentHistory';
import ProductClient from '../../Products/ProductClient';
import moment, {now} from 'moment';
import {fireEvent} from '@testing-library/dom';
import {Assignment} from '../Assignment';

jest.mock('../../Products/ProductClient');

describe('Assignment History', () => {

    const daysBetweenStartAndToday = (assignment: Assignment): number  => {
        return Math.floor(moment.duration(moment(now()).startOf('day').diff(moment(assignment.startDate).startOf('day'))).asDays());
    };

    async function clickLabel(renderResult: RenderResult): Promise<void> {
        const historyLabel = await renderResult.findByText('View Assignment History');
        expect(historyLabel).toBeInTheDocument();
        fireEvent.click(historyLabel);
    }

    const checkProductAndDates = (products: string[], dates: string[], container: HTMLElement, isCurrent: boolean) => {
        if (products.length === dates.length) {
            products.forEach((product, i) => {
                const historyEntry = container.children[isCurrent ? 1 : 3].children[i];
                expect(historyEntry).toBeDefined();
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

    beforeEach(() => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({
            data: [{...TestData.assignmentForHank, endDate: null},
                TestData.assignmentVacationForHank,
                TestData.previousAssignmentForHank],
        })
        ProductClient.getProductsForDate = jest.fn().mockResolvedValue({
            data: [TestData.productForHank, TestData.unassignedProduct, TestData.productWithoutAssignments],
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not show history until it has been dropped down', async () => {
        const actual = render(<AssignmentHistory person={TestData.hank}/>);
        await actual.findByText('View Assignment History');
        expect(await actual.queryByText('Hanky Product')).not.toBeInTheDocument();
        expect(await actual.findByTestId('assignmentHistoryArrow')).toBeInTheDocument();
    });

    it('should show the history happy path', async () => {

        const actual = render(<AssignmentHistory person={TestData.hank}/>);

        const str = '01/01/2020 - Current \\(' + daysBetweenStartAndToday(TestData.assignmentForHank) + ' days\\)';
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
        const actual = render(<AssignmentHistory person={TestData.hank}/>);
        await clickLabel(actual);

        await actual.findByText('Hanky Product');
        checkCurrentProductAndDates(['Hanky Product'],
            ['01/01/2020 - Current (' + daysBetweenStartAndToday(TestData.assignmentForHank) + ' days)'],
            actual.container);
        checkPastProductAndDates(['Unassigned', 'Product 3'],
            ['12/01/2019 - 12/31/2019 (31 days)', '10/01/2019 - 11/30/2019 (61 days)'],
            actual.container);
    });

    it('should show assignments with a future end date w.r.t. today as "current", and not show future assignments', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({
            data: [{...TestData.assignmentForHank, endDate: new Date(2119, 8, 30)},
                TestData.assignmentVacationForHank,
                {
                    id: 2100,
                    productId: 3,
                    person: TestData.hank,
                    placeholder: false,
                    spaceUuid: TestData.hank.spaceUuid,
                    startDate: new Date(2119, 9, 1),
                    endDate: new Date(2119, 10, 30),
                },
            ],
        });

        const actual = render(<AssignmentHistory person={TestData.hank}/>);
        await clickLabel(actual);
        checkCurrentProductAndDates(['Hanky Product'], ['01/01/2020 - Current (' + daysBetweenStartAndToday(TestData.assignmentForHank) + ' days)'], actual.container);
        checkPastProductAndDates(['Unassigned'], ['12/01/2019 - 12/31/2019 (31 days)'], actual.container);
    });

    it('should show assignments with an end date of today as "current", and not show assignments beginning tomorrow', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({
            data: [{...TestData.assignmentForHank, endDate: moment().add(1, 'days').toDate()},
                TestData.assignmentVacationForHank,
                {
                    id: 2100,
                    productId: 3,
                    person: TestData.hank,
                    placeholder: false,
                    spaceUuid: TestData.hank.spaceUuid,
                    startDate: moment().add(1, 'days').toDate(),
                    endDate: new Date(2119, 10, 30),
                },
            ],
        });

        const actual = render(<AssignmentHistory person={TestData.hank}/>);
        await clickLabel(actual);
        checkCurrentProductAndDates(['Hanky Product'], ['01/01/2020 - Current (' + daysBetweenStartAndToday(TestData.assignmentForHank) + ' days)'], actual.container);
        checkPastProductAndDates(['Unassigned'], ['12/01/2019 - 12/31/2019 (31 days)'], actual.container);
    });

    it('does not blow up if an assignment has no matching product', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({
            data: [{...TestData.assignmentForHank, endDate: null},
                TestData.assignmentVacationForHank,
                TestData.previousAssignmentForHank],
        });
        ProductClient.getProductsForDate = jest.fn().mockResolvedValue({
            data: [TestData.unassignedProduct, TestData.productWithoutAssignments],
        });

        const actual = render(<AssignmentHistory person={TestData.hank}/>);
        await clickLabel(actual);

        await actual.findByText(/Unknown Product/);
        await actual.findByText(/01\/01\/2020 - Current/);
        await actual.findByText(/Unassigned/);
        await actual.findByText(/12\/01\/2019 - 12\/31\/2019 \(31 days\)/);
        await actual.findByText(/Product 3/);
        await actual.findByText(/10\/01\/2019 - 11\/30\/2019 \(61 days\)/);
    });

    it('does not blow up if an assignment has no start date, and does not show a line in the table for it', async () => {
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({
            data: [{...TestData.assignmentForHank, endDate: null, startDate: null},
                TestData.assignmentVacationForHank,
                TestData.previousAssignmentForHank],
        });
        ProductClient.getProductsForDate = jest.fn().mockResolvedValue({
            data: [TestData.unassignedProduct, TestData.productWithoutAssignments],
        });
        await act(async () => {
            const actual = render(<AssignmentHistory person={TestData.hank}/>);
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
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({
            data: [{...TestData.assignmentForHank, endDate: null, startDate: '2020-01-01'},
                TestData.assignmentVacationForHank,
                TestData.previousAssignmentForHank],
        });
        ProductClient.getProductsForDate = jest.fn().mockResolvedValue({
            data: [TestData.unassignedProduct, TestData.productWithoutAssignments, TestData.productForHank],
        });
        const actual = render(<AssignmentHistory person={TestData.hank}/>);
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
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({
            data: [{...TestData.assignmentForHank, endDate: new Date(2119, 8, 30)},
                TestData.assignmentVacationForHank,
                {
                    id: 2100,
                    productId: 3,
                    person: TestData.hank,
                    placeholder: false,
                    spaceUuid: TestData.hank.spaceUuid,
                    startDate: TestData.assignmentForHank.startDate,
                    endDate: TestData.assignmentForHank.endDate,
                },
            ],
        });

        const expectedDuration = daysBetweenStartAndToday(TestData.assignmentForHank);

        const actual = render(<AssignmentHistory person={TestData.hank}/>);
        await clickLabel(actual);
        checkCurrentProductAndDates(['Hanky Product', TestData.productWithoutAssignments.name],
            ['01/01/2020 - Current (' + expectedDuration + ' days)', '01/01/2020 - Current (' + expectedDuration + ' days)'],
            actual.container);
        checkPastProductAndDates(['Unassigned'], ['12/01/2019 - 12/31/2019 (31 days)'], actual.container);
    });
});
