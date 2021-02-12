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

import React, {forwardRef, Ref} from 'react';

interface CustomInputProps {
    isReadOnly: boolean;
    value?: string;
    isOpen: boolean;
    setIsOpen: (isCalendarOpen: boolean) => void;
}

function NewCalendarCustomInput(
    {isReadOnly, isOpen, setIsOpen, value}: CustomInputProps,
    forwardedRef: Ref<HTMLDivElement>
): JSX.Element {
    const viewingDate: Date = !value ? new Date() : new Date(value);
    const dateFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    function calendarClicked(): void {
        setIsOpen(!isOpen);
    }

    return (
        <div className={'calendarSubHeader'}>
            <div className={'calendarLabel'}>
                <i className="material-icons calendarIcon" aria-hidden>calendar_today
                </i>
                <span>
                    Viewing:
                </span>
            </div>
            <button className={`newCalendarCustomInput ${isReadOnly ? 'readOnly' : ''}`}
                onClick={calendarClicked}
                disabled={isReadOnly}
                data-testid="calendarToggle"
            >
                <span className="newCalendarViewingDate">
                    {viewingDate.toLocaleString('en-us', dateFormatOptions)}
                </ span>
                {   !isReadOnly && (
                    isOpen
                        ? <i className="material-icons greyIcon" data-testid="calendar_up-arrow">arrow_drop_up</i>
                        : <i className="material-icons greyIcon" data-testid="calendar_down-arrow">arrow_drop_down</i>
                )}
            </button>
        </div>
    );
}

export default forwardRef<HTMLDivElement, CustomInputProps>(NewCalendarCustomInput);
