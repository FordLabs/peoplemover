import React, {createRef, ReactElement, ReactNode, useCallback, useEffect} from 'react';

interface DropdownProps {
    handleClose: () => void;
    ariaLabelledBy?: string;
    className?: string;
    children?: ReactNode;
    testId?: string;
    dontCloseForTheseIds?: string[];

}

export default function AccessibleDropdownContainer({handleClose, ariaLabelledBy, className, children, testId, dontCloseForTheseIds}: DropdownProps): JSX.Element {

    const dropdownContainer = createRef<HTMLDivElement>();

    const leaveFocusListener = useCallback((e: {target: EventTarget | null; key?: string}) => {
        if (!dropdownContainer.current?.contains(e.target as HTMLElement) && !dontCloseForTheseIds?.includes((e.target as HTMLElement).id)) {
            handleClose();
        }

        if (e.key === 'Escape') {
            handleClose();
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            let movementDirection = 0;
            if (e.key === 'ArrowDown') {
                movementDirection = 1;
            } else {
                movementDirection = -1;
            }

            const childrenWithNullId = React.Children.toArray(children).filter(child => (child as ReactElement).props.id === undefined);

            if (childrenWithNullId.length === 0) {
                let target = e.target as HTMLElement;

                const totalNumberOfChildren = React.Children.count(children);
                const childIndex = React.Children.toArray(children).findIndex(child => (child as ReactElement).props.id == target.id);

                const nextIndex = childIndex + movementDirection;
                if (nextIndex >= totalNumberOfChildren) {
                    // @ts-ignore
                    document.getElementById((React.Children.toArray(children)[0] as ReactElement).props.id).focus();
                } else if (nextIndex < 0) {
                    // @ts-ignore
                    document.getElementById((React.Children.toArray(children)[totalNumberOfChildren - 1] as ReactElement).props.id).focus();
                } else  {
                    // @ts-ignore
                    document.getElementById((React.Children.toArray(children)[nextIndex] as ReactElement).props.id).focus();
                }
            }

        }
    }, [dropdownContainer, handleClose]);

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
            className={className}
            aria-labelledby={ariaLabelledBy}
            data-testid={testId}
        >
            {children}
        </div>
    );
}
