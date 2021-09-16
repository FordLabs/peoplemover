import TestUtils, {mockDate} from "../../tests/TestUtils";
import React from "react";
import AssignmentClient from "../AssignmentClient";
import {AxiosResponse} from "axios";
import {act, render, RenderResult} from '@testing-library/react';
import {AssignmentHistory} from "./AssignmentHistory";
import ProductClient from "../../Products/ProductClient";
import moment, {now} from "moment";

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

        const expectedDuration = Math.floor(moment.duration(moment(now()).startOf('day').diff(moment(TestUtils.assignmentForHank.startDate).startOf('day'))).asDays()) + 1

        await actual.findByText('Hanky Product 01/01/2020 - Current (' + expectedDuration + ' days)');
        await actual.findByText('Unassigned 12/01/2019 - 12/31/2019 (31 days)');
        await actual.findByText('Product 3 10/01/2019 - 11/30/2019 (61 days)');
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

        await actual.findByText(/Unknown Product 01\/01\/2020 - Current/);
    });
});
