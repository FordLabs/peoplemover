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

function NewBadge(): JSX.Element {
    return <span className="newBadge" data-testid="newBadge">NEW</span>;
}

export function calculateGradient(newPersonDate: Date, viewingDate: Date): string {
    const viewingMoment = moment(viewingDate);
    const eightDaysAhead = moment(newPersonDate).add(8, 'days');
    const fifteenDaysAhead = moment(newPersonDate).add(15, 'days');

    if (viewingMoment.isBetween( eightDaysAhead, fifteenDaysAhead, 'day', '[]')) {
        return 'stage2';
    } else if (viewingMoment.isAfter(fifteenDaysAhead)) {
        return 'stage3';
    }
    return '';
}

export default NewBadge;

