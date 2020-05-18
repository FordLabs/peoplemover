import CalendarHeader from './CalendarHeader';
import CalendarInputLabel from './CalendarInputLabel';
import DatePicker from 'react-datepicker';
import ReactDatePicker from 'react-datepicker';
import React, {createRef, useEffect, useState} from 'react';
import './Calendar.scss';
import {connect} from "react-redux";
import {setViewingDateAction} from "../Redux/Actions";
import {GlobalStateProps} from "../Redux/Reducers";

interface CalendarProps {
    viewingDate: Date;

    setViewingDate(date: Date): Date;
}

function Calendar({
    viewingDate,
    setViewingDate,
}: CalendarProps
): JSX.Element {
    const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
    const calendarRef = createRef<ReactDatePicker>();

    useEffect(() => {
        calendarRef.current?.setOpen(isCalendarOpen);
    }, [isCalendarOpen]);

    function onChange(date: Date): void {
        setViewingDate(date);
        setIsCalendarOpen(false);
    }

    function isWeekday(date: Date): boolean {
        const day = date.getDay();
        return day !== 0 && day !== 6;
    }

    return (
        <div className="calendar tab" data-testid="calendar">
            <DatePicker
                ref={calendarRef}
                selected={viewingDate}
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

const mapStateToProps = (state: GlobalStateProps) => ({
    viewingDate: state.viewingDate,
});

const mapDispatchToProps = (dispatch: any) => ({
    setViewingDate: (date: Date) => dispatch(setViewingDateAction(date)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Calendar);