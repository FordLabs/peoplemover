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

import CalendarHeader from './CalendarHeader';
import CalendarInputLabel from './CalendarInputLabel';
import DatePicker from 'react-datepicker';
import ReactDatePicker from 'react-datepicker';
import React, {createRef, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import AssignmentClient from '../Assignments/AssignmentClient';
import {Space} from '../Space/Space';
import moment from 'moment';
import {useRecoilState, useRecoilValue} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {IsReadOnlyState} from '../State/IsReadOnlyState';

import './Calendar.scss';

interface Props {
    currentSpace: Space;
}

function Calendar({ currentSpace}: Props): JSX.Element {
    const { uuid = '' } = currentSpace;

    const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
    const [daysHighlighted, setDaysHighlighted] = useState<Array<Date>>([]);

    const [viewingDate, setViewingDate] = useRecoilState(ViewingDateState);
    const isReadOnly = useRecoilValue(IsReadOnlyState);

    const calendarRef = createRef<ReactDatePicker>();

    useEffect(() => {
        if (isCalendarOpen) {
            AssignmentClient.getAssignmentEffectiveDates(uuid)
                .then(response => {
                    const dates: Array<Date> = (response.data as string[]).map(date => moment(date).toDate());
                    setDaysHighlighted(dates);
                });
        }
    }, [uuid, isCalendarOpen]);

    function toggleCalendar(isOpen: boolean): void {
        setIsCalendarOpen(isOpen);
        calendarRef.current?.setOpen(isOpen);
    }

    function onChange(date: Date): void {
        setViewingDate(date);
        toggleCalendar(false);
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
                onSelect={(): void => toggleCalendar(false)}
                onChange={onChange}
                onClickOutside={(): void => {
                    setTimeout(() => toggleCalendar(false), 250);
                }}
                showPopperArrow={false}
                filterDate={isWeekday}
                renderCustomHeader={CalendarHeader}
                customInput={
                    <CalendarInputLabel
                        isReadOnly={isReadOnly}
                        isOpen={isCalendarOpen}
                        setIsOpen={toggleCalendar}
                    />
                }
            />
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(Calendar);
/* eslint-enable */
