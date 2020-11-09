import React, {forwardRef, Ref} from 'react';

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

    function handleKeyDownForCalendarClicked(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            calendarClicked();
        }
    }

    return (
        <div className="calendarCustomInput"
            onClick={calendarClicked}
            onKeyDown={(e): void => handleKeyDownForCalendarClicked(e)}
            data-testid="calendarToggle">
            Viewing: {viewingDate.toLocaleString('en-us', dateFormatOptions)}
            {
                isOpen
                    ? <i className="material-icons greyIcon" data-testid="calendar_up-arrow">arrow_drop_up</i>
                    : <i className="material-icons greyIcon" data-testid="calendar_down-arrow">arrow_drop_down</i>
            }
        </div>
    );
}

const CalendarInputLabel = forwardRef<HTMLDivElement, CustomInputProps>(CalendarCustomInput);

export default CalendarInputLabel;
