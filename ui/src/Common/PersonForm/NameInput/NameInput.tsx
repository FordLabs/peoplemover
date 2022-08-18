/*
 * Copyright (c) 2022 Ford Motor Company
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

import React, {ChangeEvent} from "react";

import './NameInput.scss';

interface Props {
    value?: string;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
    isPersonNameInvalid: boolean;
}

function NameInput({ value = '', onChange, isPersonNameInvalid }: Props) {
    return (
        <>
            <label className="formItemLabel" htmlFor="name">Name</label>
            <input className="formInput formTextInput"
                data-testid="personFormNameField"
                type="text"
                name="name"
                id="name"
                value={value}
                onChange={onChange}
                autoComplete="off"
                placeholder="e.g. Jane Smith"
            />
            {isPersonNameInvalid && <span className="personNameWarning">Please enter a person name.</span>}
        </>
    )
}

export default NameInput;