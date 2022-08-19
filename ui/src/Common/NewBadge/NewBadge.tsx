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

import React from 'react';
import './NewBadge.scss';
import moment from 'moment';

interface NewBadgeProps {
    viewingDate?: Date;
    newPersonDate?: Date;
}

function NewBadge({ viewingDate, newPersonDate }: NewBadgeProps): JSX.Element {
    return (
        <span
            className={
                'newBadge ' + calculateGradient(newPersonDate, viewingDate)
            }
            data-testid="newBadge"
        >
            NEW
        </span>
    );
}

export function calculateGradient(
    newPersonDate: Date | undefined,
    viewingDate: Date | undefined
): string {
    let styleToReturn = '';
    if (newPersonDate !== undefined && viewingDate !== undefined) {
        const viewingMoment = moment(viewingDate);
        const sevenDaysAhead = moment(newPersonDate).add(7, 'days');
        const fifteenDaysAhead = moment(newPersonDate).add(15, 'days');

        if (viewingMoment.isAfter(sevenDaysAhead)) {
            styleToReturn = 'stage2';
        }
        if (viewingMoment.isAfter(fifteenDaysAhead)) {
            styleToReturn = 'stage3';
        }
    }
    return styleToReturn;
}

export default NewBadge;
