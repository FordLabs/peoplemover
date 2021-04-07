/*!
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
    clearFilterButton?: ReactNode;
}

export default function Dropdown({buttonId, dropdownButtonContent, dropdownContent, dropdownOptionIds, dropdownTestId, buttonTestId, closeOnSelect = false, clearFilterButton}: DropdownProps): JSX.Element {

    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);

    const toggleDropdownMenu = (): void => {
        setDropdownToggle(!dropdownToggle);
    };

    const idArrowUp = buttonId + 'up-arrow';

    return (
        <div className="dropdown-group">
            <div className={'testttt'}>
                <button
                    onClick={(): void => {toggleDropdownMenu();}}
                    id={buttonId}
                    data-testid={buttonTestId}
                    className="dropdown-button"
                >
                    {dropdownButtonContent}
                    {dropdownToggle
                        ? <i className="material-icons greyIcon" id={idArrowUp}>keyboard_arrow_up</i>
                        : <i className="material-icons greyIcon" >keyboard_arrow_down</i>
                    }
                </button>
                {clearFilterButton}
            </div>
            {dropdownToggle &&
                <div className="dropdown-contents-container">
                    <AccessibleDropdownContainer
                        testId={dropdownTestId}
                        className="sortby-dropdown"
                        handleClose={(): void => {
                            setDropdownToggle(false);
                        }}
                        dropdownOptionIds={dropdownOptionIds.concat([idArrowUp])}
                        closeOnSelect={closeOnSelect}
                    >
                        {dropdownContent}

                    </AccessibleDropdownContainer>
                </div>}
        </div>
    );
}
