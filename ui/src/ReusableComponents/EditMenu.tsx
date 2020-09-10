/*
 * Copyright (c) 2020 Ford Motor Company
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


export interface EditMenuOption {
    callback(): void;
    text: string;
    icon: string;
}

export interface EditMenuProps {
    menuOptionList: EditMenuOption[];
    onClosed(): void;
}

function EditMenu(props: EditMenuProps) {

    const hiddenInputRef: any = React.useRef();

    useOnLoad(() => {
        const inputField = hiddenInputRef.current;
        setTimeout(() => inputField.focus());
    });

    function onOptionSelected(event: any, callback: any) {
        event.stopPropagation();
        event.preventDefault();
        callback();
    }

    function close() {
        props.onClosed();
    }

    return (

        <div
            className="editMenuContainer"
            data-testid="editMenu"
        >

            <input className={'hiddenInputField'} type={'text'} ref={hiddenInputRef} onBlur={close}/>

            {props.menuOptionList.map((menuOption, index) =>
                <div key={index}
                    className="editMenuContainerOption"
                    onMouseDown={event => onOptionSelected(event, menuOption.callback)}>
                    <i className={`fas ${menuOption.icon}`} data-testid={`editMenuOption${index}`}/>
                    <span>{menuOption.text}</span>
                </div>
            )}
        </div>


    );
}

export default EditMenu;