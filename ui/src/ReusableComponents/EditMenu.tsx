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

import React from 'react';
import './EditMenu.scss';
import {useOnLoad} from './UseOnLoad';
import {createDataTestId} from '../tests/TestUtils';
import FocusTrap from 'focus-trap-react';


export interface EditMenuOption {
    callback(): void;
    text: string;
    icon: string;
}

export interface EditMenuProps {
    menuOptionList: EditMenuOption[];
    onClosed(): void;
}

function EditMenu(props: EditMenuProps): JSX.Element {
    const hiddenInputRef = React.useRef<HTMLInputElement>(null);
    const editMenuRef = React.useRef<HTMLDivElement>(null);

    useOnLoad(() => {
        const inputField = hiddenInputRef.current;
        if (inputField) setTimeout(() => inputField.focus());
        document.addEventListener('mousedown', handleClick, false);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClick(event: any): void {
        if (editMenuRef && editMenuRef.current && !editMenuRef.current.contains(event.target)) {
            close();
        }
    }

    function onOptionSelected(event: React.MouseEvent, callback: Function): void {
        event.stopPropagation();
        event.preventDefault();
        document.removeEventListener('mousedown', handleClick, false);
        callback();
    }

    function close(): void {
        document.removeEventListener('mousedown', handleClick, false);
        props.onClosed();
    }

    function listenForKeydown(event: React.KeyboardEvent): void {
        if (event.key === 'ArrowDown') {
            console.log('OHOHOHOHOHHO');
        }
        if (event.key === 'Escape') {
            close();
        }
    }



    return (
        <FocusTrap>
            <div ref={editMenuRef} className="editMenuContainer" data-testid="editMenu" onKeyDown={(e): void => listenForKeydown(e)}>
                <input className="hiddenInputField" type="text" ref={hiddenInputRef} onBlur={close}/>
                {props.menuOptionList.map((menuOption, index) =>
                    <button key={index}
                        className="editMenuContainerOption"
                        onMouseDown={(event): void =>
                            onOptionSelected(event, menuOption.callback)
                        }>
                        <i className="material-icons" 
                            data-testid={createDataTestId('editMenuOption', menuOption.text)}>
                            {menuOption.icon}
                        </i>
                        <span>{menuOption.text}</span>
                    </button>
                )}
            </div>
        </FocusTrap>
    );
}

export default EditMenu;
