import React from 'react';
import { enUS } from 'date-fns/locale';

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
                {enUS.localize!.month(date.getMonth())}
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
