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

import React, {
    createRef,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
} from 'react';

interface DropdownProps {
    handleClose: () => void;
    ariaLabelledBy?: string;
    className?: string;
    children?: ReactNode;
    testId?: string;
    dropdownOptionIds?: string[];
    closeOnSelect?: boolean;
}

export default function AccessibleDropdownContainer({
    handleClose,
    ariaLabelledBy,
    className,
    children,
    testId,
    dropdownOptionIds,
    closeOnSelect,
}: DropdownProps): JSX.Element {
    const dropdownContainer = createRef<HTMLDivElement>();

    const leaveFocusListener = useCallback(
        (e: { target: EventTarget | null; key?: string }) => {
            const setFocusOnExpectedElementWhenUsingUpOrDownKey = (e: {
                target: EventTarget | null;
                key?: string;
            }): void => {
                if (isArrowKeyFunctionalitySetup()) {
                    const movementDirection = getMovementDirection(e.key);
                    setFocusState(e, movementDirection);
                }
            };

            const isArrowKeyFunctionalitySetup = (): boolean => {
                const childrenWithUndefinedId = React.Children.toArray(
                    children
                ).filter(
                    (child) => (child as ReactElement).props.id === undefined
                );
                const childrenWithNullRef = React.Children.toArray(
                    children
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                ).filter((child) => (child as ReactElement).ref === null);

                return (
                    childrenWithUndefinedId.length === 0 &&
                    childrenWithNullRef.length === 0
                );
            };

            const getMovementDirection = (key?: string): number => {
                if (key === 'ArrowDown') return 1;
                return -1;
            };

            const setFocusState = (
                e: { target: EventTarget | null; key?: string },
                movementDirection: number
            ): void => {
                const target = e.target as HTMLElement;

                const totalNumberOfChildren = React.Children.count(children);
                const childIndex = React.Children.toArray(children).findIndex(
                    (child) => (child as ReactElement).props.id === target.id
                );

                const nextIndex = childIndex + movementDirection;
                if (nextIndex >= totalNumberOfChildren) {
                    focusChild(0);
                } else if (nextIndex < 0) {
                    focusChild(totalNumberOfChildren - 1);
                } else {
                    focusChild(nextIndex);
                }
            };

            const focusChild = (index: number): void => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                React.Children.toArray(children)[index].ref.current.focus();
            };

            if (
                !dropdownContainer.current?.contains(e.target as HTMLElement) &&
                !dropdownOptionIds?.includes((e.target as HTMLElement).id)
            ) {
                handleClose();
            }

            if (e.key === 'Escape') handleClose();

            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                setFocusOnExpectedElementWhenUsingUpOrDownKey(e);
            }
        },
        [dropdownContainer, handleClose, children, dropdownOptionIds]
    );

    useEffect(() => {
        document.addEventListener('mouseup', leaveFocusListener);
        document.addEventListener('keyup', leaveFocusListener);
        return (): void => {
            document.removeEventListener('mouseup', leaveFocusListener);
            document.removeEventListener('keyup', leaveFocusListener);
        };
    }, [leaveFocusListener]);
    return (
        // The button presses (enter or space) on the child element buttons
        // propogate down to trigger the onClick events down to this component.
        // As such, the keyboard functionality is handled, just not in this component
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
            ref={dropdownContainer}
            className={className}
            aria-labelledby={ariaLabelledBy}
            data-testid={testId}
            onClick={(): void => {
                if (closeOnSelect) handleClose();
            }}
        >
            {children}
        </div>
    );
}
