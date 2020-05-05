import CalendarHeader from './CalendarHeader';
import CalendarInputLabel from './CalendarInputLabel';
import DatePicker from 'react-datepicker';
import ReactDatePicker from 'react-datepicker';
import React, {createRef, useEffect, useState} from 'react';
import './Calendar.scss';
import Axios from "axios";
import moment from "moment";

interface CalendarProps {
    spaceId: number;
}

function Calendar({spaceId}: CalendarProps): JSX.Element {
    const [currentDate, setCurrentDate] = useState<Date>();
    const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
    const calendarRef = createRef<ReactDatePicker>();

    useEffect(() => {
        calendarRef.current?.setOpen(isCalendarOpen);
    }, [isCalendarOpen]);

    function onChange(date: Date): void {
        setCurrentDate(date);
        setIsCalendarOpen(false);
        Axios.get(`${process.env.REACT_APP_URL}product/${spaceId}/${moment(date.toDateString()).format('YYYY-MM-DD')}`,
            {headers: {'Content-Type': 'application/json'}}
        ).then(response => {
            console.log(response.data);
        });

    }

    function isWeekday(date: Date): boolean {
        const day = date.getDay();
        return day !== 0 && day !== 6;
    }

    return (
        <div className="calendar tab" data-testid="calendar">
            <DatePicker
                ref={calendarRef}
                selected={currentDate}
                onChange={onChange}
                onClickOutside={(): void => {
                    setTimeout(() => setIsCalendarOpen(false), 250);
                }}
                showPopperArrow={false}
                filterDate={isWeekday}
                renderCustomHeader={CalendarHeader}
                customInput={
                    <CalendarInputLabel
                        isOpen={isCalendarOpen}
                        setIsOpen={setIsCalendarOpen}
                    />
                }
            />
        </div>
    );
}

export default Calendar;