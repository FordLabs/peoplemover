/*
 *
 *  * Copyright (c) 2020 Ford Motor Company
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


import {fireEvent, render} from '@testing-library/react';
import * as React from 'react';
import FormNotesTextArea from './FormNotesTextArea';

describe('notes input', () => {
    it('should count the number of characters', () => {
        const callback = jest.fn();
        const notes = render(<FormNotesTextArea notes={'this string is 17'} callBack={callback}/>);
        notes.getByText('17 (255 characters max)');
    });

    it('should update character count when notes is typed in', function() {
        const callback = jest.fn();
        const notes = render(<FormNotesTextArea callBack={callback}/>);
        notes.getByText('0 (255 characters max)');
        const input = notes.getByLabelText('Notes');
        fireEvent.change(input, { target: { value: 'Good' } });
        notes.getByText('4 (255 characters max)');
    });

    it('should send update to parent when text changes', function() {
        const callback = jest.fn();
        const notes = render(<FormNotesTextArea callBack={callback}/>);
        const input = notes.getByLabelText('Notes');
        fireEvent.change(input, { target: { value: 'Good' } });
        expect(callback).toHaveBeenCalledWith('Good');
    });

    it('should change the max value allowed in the input', function() {
        const callback = jest.fn();
        const notes = render(<FormNotesTextArea callBack={callback} maxLength={5}/>);
        notes.getByText('0 (5 characters max)');
    });
});

