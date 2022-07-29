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
import {enUS} from 'date-fns/locale';

interface CustomHeaderProps {
    date: Date;
    decreaseMonth: () => void;
    increaseMonth: () => void;
    prevMonthButtonDisabled: boolean;
    nextMonthButtonDisabled: boolean;
}

function CalendarHeader({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
}: CustomHeaderProps): JSX.Element {
    const MonthTitle = enUS?.localize?.month(date.getMonth());
    const YearTitle = date.getFullYear();
    return (
        <div className="calendarContainer">
            <button
                className="calendarMonthArrows"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
            >
                <i className="material-icons greyIcon">arrow_left</i>
            </button>
            <div className="monthText">
                {MonthTitle} {YearTitle}
            </div>
            <button
                className="calendarMonthArrows"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
            >
                <i className="material-icons greyIcon">arrow_right</i>
            </button>
        </div>
    );
}

export default CalendarHeader;
