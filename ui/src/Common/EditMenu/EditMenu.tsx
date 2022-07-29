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

import React, {createRef} from 'react';
import './EditMenu.scss';
import AccessibleDropdownContainer from '../AccessibleDropdownContainer/AccessibleDropdownContainer';
import {createDataTestId} from '../../Utils/ReactUtils';

export interface EditMenuOption {
    callback(): void;
    text: string;
    icon: string;
}

export interface EditMenuProps {
    menuOptionList: EditMenuOption[];
    onClosed(): void;
    testId?: string;
    idToPass?: string;
}

function EditMenu(props: EditMenuProps): JSX.Element {
    function onOptionSelected(event: React.MouseEvent, callback: Function): void {
        event.stopPropagation();
        event.preventDefault();
        callback();
    }

    return (
        <AccessibleDropdownContainer handleClose={props.onClosed} className="editMenuContainer" testId={props.testId} dropdownOptionIds={props.idToPass !== undefined ? [props.idToPass] : []}>
            {props.menuOptionList.map((menuOption, index) =>
                <button key={index}
                    autoFocus={index === 0}
                    className="editMenuContainerOption"
                    id={menuOption.text}
                    ref={createRef<HTMLButtonElement>()}
                    onClick={(event): void =>
                        onOptionSelected(event, menuOption.callback)
                    }>
                    <i className="material-icons"
                        data-testid={createDataTestId('editMenuOption', menuOption.text)}>
                        {menuOption.icon}
                    </i>
                    <span>{menuOption.text}</span>
                </button>
            )}
        </AccessibleDropdownContainer>
    );
}

export default EditMenu;
