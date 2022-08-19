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

import { calculateDuration } from './AssignmentService';
import TestData from 'Utils/TestData';
import { Assignment } from 'Types/Assignment';

describe('Assignment', () => {
    describe('calculateDuration', () => {
        const assignment: Assignment = {
            id: 1,
            person: TestData.hank,
            productId: TestData.productForHank.id,
            spaceUuid: TestData.hank.spaceUuid,
            placeholder: false,
            startDate: undefined,
            endDate: undefined,
        };

        it('should return 0 if the assignment has no start date', () => {
            const viewingDate = new Date(2020, 0, 1);
            expect(calculateDuration(assignment, viewingDate)).toEqual(0);
        });

        it('should return 1 if the assignment starts the same day as the viewing date with no end date', () => {
            assignment.startDate = new Date(2020, 0, 1);
            const viewingDate = new Date(2020, 0, 1);
            expect(calculateDuration(assignment, viewingDate)).toEqual(1);
        });

        it('should return 10 if the assignment starts 10 days before the viewing date', () => {
            assignment.startDate = new Date(2020, 0, 1);
            const viewingDate = new Date(2020, 0, 10);
            expect(calculateDuration(assignment, viewingDate)).toEqual(10);
        });

        it('should return a negative number if the assignment starts after the viewing date', () => {
            assignment.startDate = new Date(2020, 0, 3);
            const viewingDate = new Date(2020, 0, 1);
            expect(calculateDuration(assignment, viewingDate)).toEqual(-1);
        });

        it('should return 0 if the assignment starts the day after the viewing date', () => {
            assignment.startDate = new Date(2020, 0, 2);
            const viewingDate = new Date(2020, 0, 1);
            expect(calculateDuration(assignment, viewingDate)).toEqual(0);
        });

        it('should return 5 if the assignment has a start and end date, regardless of viewing date', () => {
            assignment.startDate = new Date(2020, 0, 1);
            assignment.endDate = new Date(2020, 0, 5);
            let viewingDate = new Date(2019, 11, 31);
            expect(calculateDuration(assignment, viewingDate)).toEqual(5);
            viewingDate = new Date(2020, 0, 1);
            expect(calculateDuration(assignment, viewingDate)).toEqual(5);
            viewingDate = new Date(2020, 0, 3);
            expect(calculateDuration(assignment, viewingDate)).toEqual(5);
            viewingDate = new Date(2020, 0, 5);
            expect(calculateDuration(assignment, viewingDate)).toEqual(5);
            viewingDate = new Date(2020, 0, 6);
            expect(calculateDuration(assignment, viewingDate)).toEqual(5);
        });
    });
});
