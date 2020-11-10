import CalendarHeader from './CalendarHeader';
import CalendarInputLabel from './CalendarInputLabel';
import DatePicker from 'react-datepicker';
import ReactDatePicker from 'react-datepicker';
import React, {createRef, useEffect, useState} from 'react';
import './Calendar.scss';
import {connect} from 'react-redux';
import {setViewingDateAction} from '../Redux/Actions';
import {GlobalStateProps} from '../Redux/Reducers';
import AssignmentClient from '../Assignments/AssignmentClient';
import {Space} from '../Space/Space';
import moment from 'moment';

interface CalendarProps {
    viewingDate: Date;
    currentSpace: Space;
    isReadOnly: boolean;
    setViewingDate(date: Date): Date;
}

function Calendar({
    viewingDate,
    currentSpace,
    isReadOnly,
    setViewingDate,
}: CalendarProps
): JSX.Element {
    const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
    const [daysHighlighted, setDaysHighlighted] = useState<Array<Date>>([]);
    const calendarRef = createRef<ReactDatePicker>();

    /* eslint-disable */
    useEffect(() => {
        calendarRef.current?.setOpen(isCalendarOpen);
        AssignmentClient.getAssignmentEffectiveDates(currentSpace.uuid!!).then(response => {
            const dates: Array<Date> = (response.data as string[]).map(date => moment(date).toDate());
            setDaysHighlighted(dates);
        });
    }, [isCalendarOpen]);
    /* eslint-enable */

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
                calendarClassName="viewing-calendar"
                ref={calendarRef}
                selected={viewingDate}
                highlightDates={[{'react-datepicker__day--highlighted': daysHighlighted}]}
                onSelect={(): void => setIsCalendarOpen(false)}
                onChange={onChange}
                onClickOutside={(): void => {
                    setTimeout(() => setIsCalendarOpen(false), 250);
                }}
                showPopperArrow={false}
                filterDate={isWeekday}
                renderCustomHeader={CalendarHeader}
                customInput={
                    <CalendarInputLabel
                        isReadOnly={isReadOnly}
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
    currentSpace: state.currentSpace,
    isReadOnly: state.isReadOnly,
});

const mapDispatchToProps = (dispatch: any) => ({
    setViewingDate: (date: Date) => dispatch(setViewingDateAction(date)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Calendar);
