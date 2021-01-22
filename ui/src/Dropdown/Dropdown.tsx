import React, {createRef, ReactNode, useCallback, useEffect} from 'react';

interface DropdownProps {
    handleClose: () => void;
    ariaLabelledBy: string;
    children?: ReactNode;
}

export default function Dropdown({handleClose, ariaLabelledBy, children}: DropdownProps): JSX.Element {

    const dropdownContainer = createRef<HTMLDivElement>();

    const leaveFocusListener = useCallback((e: {target: EventTarget | null; key?: string}) => {
        if (!dropdownContainer.current?.contains(e.target as HTMLElement)) {
            handleClose();
        }
        if (e.key === 'Escape') {
            handleClose();
        }
    }, [dropdownContainer]);

    useEffect(() => {
        document.addEventListener('mouseup', leaveFocusListener);
        document.addEventListener('keyup', leaveFocusListener);
        return (): void => {
            document.removeEventListener('mouseup', leaveFocusListener);
            document.removeEventListener('keyup', leaveFocusListener);
        };
    }, [leaveFocusListener]);
    return (
        <div
            ref={dropdownContainer}
            role="menu"
            className="ellipsisDropdownContainer"
            aria-labelledby={ariaLabelledBy}
        >
            {children}
        </div>
    );
}
