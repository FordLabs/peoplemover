import TestUtils, {mockDate} from "../../tests/TestUtils";
import React from "react";
import AssignmentClient from "../AssignmentClient";
import {AxiosResponse} from "axios";
import {render} from "@testing-library/react";
import {AssignmentHistory} from "./AssignmentHistory";
import ProductClient from "../../Products/ProductClient";
import moment, {now} from "moment";

describe('Assignment History', function () {

    beforeEach(function () {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn(() => Promise.resolve({
            data: [{...TestUtils.assignmentForHank, endDate: null},
                TestUtils.assignmentVacationForHank,
                TestUtils.previousAssignmentForHank],
        } as AxiosResponse));
        ProductClient.getProductsForDate = jest.fn(() => Promise.resolve({
            data: [TestUtils.productForHank, TestUtils.unassignedProduct, TestUtils.productWithoutAssignments]
        } as AxiosResponse));
    });

    it('should show the history happy path', async function () {

        const actual = render(<AssignmentHistory person={TestUtils.hank}/>);

        const expectedDuration = Math.floor(moment.duration(moment(now()).startOf('day').diff(moment(TestUtils.assignmentForHank.startDate).startOf('day'))).asDays()) + 1

        await actual.findByText('Hanky Product 01/01/2020 - Current ('+expectedDuration+' days)');
        await actual.findByText('Unassigned 12/01/2019 - 12/31/2019 (31 days)');
        await actual.findByText('Product 3 10/01/2019 - 11/30/2019 (61 days)');
    });
    it('should not show assignments from the future w.r.t. today', async () => {
    });
    it('should be able to show a product with assignments in the future w.r.t. viewingDate but past w.r.t. today', async () => {
    });
    it('does not blow up if an assignment has no matching product', () => {
    });
})
;
