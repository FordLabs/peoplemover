import AccessibleDropdownContainer from './AccessibleDropdownContainer';
import React, {ReactNode, useState} from 'react';

interface DropdownProps {
    buttonId: string;
    dropdownButtonContent: ReactNode;
    dropdownContent: ReactNode;
    dropdownOptionIds: string[];
    dropdownTestId?: string;
    buttonTestId?: string;
    closeOnSelect?: boolean;
}

export default function Dropdown({buttonId, dropdownButtonContent, dropdownContent, dropdownOptionIds, dropdownTestId, buttonTestId, closeOnSelect = false}: DropdownProps): JSX.Element {

    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);

    const toggleDropdownMenu = (): void => {
        setDropdownToggle(!dropdownToggle);
    };

    return (
        <div className="dropdown-group">
            <button
                onClick={(): void => {toggleDropdownMenu();}}
                id={buttonId}
                data-testid={buttonTestId}
                className="dropdown-button"
            >
                {dropdownButtonContent}
                {dropdownToggle
                    ? <i className="material-icons greyIcon">keyboard_arrow_up</i>
                    : <i className="material-icons greyIcon">keyboard_arrow_down</i>
                }
            </button>
            {dropdownToggle &&
                <div className="dropdown-contents-container">
                    <AccessibleDropdownContainer
                        testId={dropdownTestId}
                        className="sortby-dropdown"
                        handleClose={(): void => {
                            setDropdownToggle(false);
                        }}
                        dropdownOptionIds={dropdownOptionIds}
                        closeOnSelect={closeOnSelect}
                    >
                        {dropdownContent}

                    </AccessibleDropdownContainer>
                </div>}
        </div>
    );
}
