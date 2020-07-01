import React, {forwardRef, Ref, useEffect} from 'react';

interface CustomInputProps {
    value?: string;
    isOpen: boolean;
    setIsOpen: (isCalendarOpen: boolean) => void;
}

function CalendarCustomInput(
    {isOpen, setIsOpen, value}: CustomInputProps,
    forwardedRef: Ref<HTMLDivElement>
): JSX.Element {
    const viewingDate: Date = value === '' ? new Date() : new Date(value!);
    const dateFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    function calendarClicked(): void {
        setIsOpen(!isOpen);
    }

    const caretDirectionIcon = isOpen ? 'fa-caret-up' : 'fa-caret-down';
    return (
        <div className="calendarCustomInput" onClick={calendarClicked}>
            Viewing: {viewingDate.toLocaleString('en-us', dateFormatOptions)}
            <i className={`fas ${caretDirectionIcon} drawerCaret`}
                data-testid={`calendar-${caretDirectionIcon}`}/>
        </div>
    );
}

const CalendarInputLabel = forwardRef<HTMLDivElement, CustomInputProps>(CalendarCustomInput);

export default CalendarInputLabel;