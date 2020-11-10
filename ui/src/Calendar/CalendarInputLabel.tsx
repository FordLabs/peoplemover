import React, {forwardRef, Ref} from 'react';

interface CustomInputProps {
    isReadOnly: boolean;
    value?: string;
    isOpen: boolean;
    setIsOpen: (isCalendarOpen: boolean) => void;
}

function CalendarCustomInput(
    {isReadOnly, isOpen, setIsOpen, value}: CustomInputProps,
    forwardedRef: Ref<HTMLDivElement>
): JSX.Element {
    const viewingDate: Date = value === '' ? new Date() : new Date(value!);
    const dateFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    function calendarClicked(): void {
        if (!isReadOnly) {
            setIsOpen(!isOpen);
        }
    }

    function handleKeyDownForCalendarClicked(event: React.KeyboardEvent): void {
        if (!isReadOnly && event.key === 'Enter') {
            calendarClicked();
        }
    }

    const caretDirectionIcon = isOpen ? 'fa-caret-up' : 'fa-caret-down';
    return (
        <div className={`calendarCustomInput ${isReadOnly ? 'readOnly' : ''}`}
            onClick={calendarClicked}
            onKeyDown={(e): void => handleKeyDownForCalendarClicked(e)}
            data-testid="calendarToggle">
            Viewing: {viewingDate.toLocaleString('en-us', dateFormatOptions)}
            {!isReadOnly &&
                <i className={`fas ${caretDirectionIcon} drawerCaret`}
                    data-testid={`calendar-${caretDirectionIcon}`}/>
            }
        </div>
    );
}

const CalendarInputLabel = forwardRef<HTMLDivElement, CustomInputProps>(CalendarCustomInput);

export default CalendarInputLabel;
