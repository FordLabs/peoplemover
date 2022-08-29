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

import React, {useEffect, useState} from 'react';

interface Props {
    note?: string;
    onChange: (notes: string) => void;
    maxLength?: number;
}
export default function FormNotesTextArea({ note = '', onChange, maxLength = 255 }: Props): JSX.Element {
    const [notesState, setNotesState] = useState<string>(note);

    useEffect(() => {
        setNotesState(note);
    }, [note]);

    const handleChange = (element: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const value = element.target.value;
        setNotesState(value);
        onChange(value);
    };

    return (
        <div className="formItem">
            <label className="formItemLabel" htmlFor="notes">Notes</label>
            <textarea className="formInput formTextInput notes"
                data-testid="formNotesToField"
                id="notes"
                name="notes"
                value={note}
                onChange={handleChange}
                rows={4}
                cols={25}
                maxLength={maxLength} />
            <span className={`notesFieldText ${notesState.length >= maxLength ? 'notesFieldTooLong' : ''}`} data-testid="notesFieldText">
                {notesState.length}&nbsp;({maxLength} characters max)
            </span>
        </div>
    );
}
