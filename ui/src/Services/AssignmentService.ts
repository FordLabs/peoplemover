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

import moment from 'moment';
import { Assignment } from '../Types/Assignment';

export function calculateDuration(
    assignment: Assignment,
    viewingDate: Date
): number {
    if (assignment.startDate) {
        const startMoment = moment(assignment.startDate).startOf('day');
        let endMoment = moment(viewingDate).startOf('day');
        if (assignment.endDate !== undefined && assignment.endDate !== null) {
            endMoment = moment(assignment.endDate).startOf('day');
        }
        return (
            Math.floor(moment.duration(endMoment.diff(startMoment)).asDays()) +
            1
        );
    } else {
        return 0;
    }
}

export const getDurationWithRespectToToday = (
    assignment: Assignment
): number => {
    const isFutureEnd: boolean =
        assignment.endDate !== null &&
        moment(assignment.endDate).isAfter(moment.now());
    if (isFutureEnd) {
        return calculateDuration(
            { ...assignment, endDate: undefined },
            new Date()
        );
    } else {
        return calculateDuration(assignment, new Date());
    }
};

export const didAssignmentEndInThePast = (assignment: Assignment): boolean => {
    return (
        assignment.endDate !== null &&
        moment(assignment.endDate).isBefore(moment())
    );
};
