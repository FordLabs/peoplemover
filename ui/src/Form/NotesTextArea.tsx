/*
 *
 *  * Copyright (c) 2019 Ford Motor Company
 *  * All rights reserved.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  * http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import React, {useEffect, useState} from 'react';
import '../Modal/Form.scss';

interface NotesProps {
    notes?: string;
    callBack: (notes: string) => void;
    maxLength?: number;
}
export default function NotesTextArea({ notes = '', callBack, maxLength = 255 }: NotesProps): JSX.Element {
    const [notesState, setNotesState] = useState<string>(notes);
    useEffect(() => {setNotesState(notes);}, [notes]);

    const handleChange = (element: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setNotesState(element.target.value);
        callBack(element.target.value);
    };

    return <>
        <label className="formItemLabel" htmlFor="notes">Notes</label>
        <textarea className="formInput formTextInput notes"
            data-testid="formNotesToField"
            id="notes"
            name="notes"
            value={notes}
            onChange={handleChange}
            rows={4}
            cols={25}
            maxLength={maxLength} />
        <span className={`notesFieldText ${notesState.length >= maxLength ? 'notesFieldTooLong' : ''}`} data-testid="notesFieldText">
            {notesState.length}&nbsp;({maxLength} characters max)
        </span>
    </>;
}
