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

import {fireEvent, render, RenderResult} from '@testing-library/react';
import AccessibleDropdownContainer from './AccessibleDropdownContainer';
import React, {createRef} from 'react';

describe('Accessibility Dropdown Container', () => {
    let dropdownContainer: RenderResult;
    let button2: HTMLElement;

    beforeEach(() => {
        dropdownContainer = render(
            <AccessibleDropdownContainer handleClose={jest.fn()}>
                <button ref={createRef()} id={'button1'}>Button 1</button>
                <button ref={createRef()} id={'button2'}>Button 2</button>
                <button ref={createRef()} id={'button3'}>Button 3</button>
            </AccessibleDropdownContainer>
        );

        dropdownContainer.getByText('Button 2').focus();
        button2 = dropdownContainer.getByText('Button 2');
        expect(button2).toHaveFocus();
    });

    it('should allow user to change the focused option using the arrow down key and wrap to top when pressed on last element', async () => {
        fireEvent.keyUp(button2, {key: 'ArrowDown'});
        const button3 =  dropdownContainer.getByText('Button 3');
        expect(button3).toHaveFocus();

        fireEvent.keyUp(button3, {key: 'ArrowDown'});
        const button1 =  dropdownContainer.getByText('Button 1');
        expect(button1).toHaveFocus();
    });

    it('should allow user to change the focused option using the arrow up key and wrap to bottom when pressed on first element', async () => {
        fireEvent.keyUp(button2, {key: 'ArrowUp'});
        const button1 =  dropdownContainer.getByText('Button 1');
        expect(button1).toHaveFocus();

        fireEvent.keyUp(button1, {key: 'ArrowUp'});
        const button3 =  dropdownContainer.getByText('Button 3');
        expect(button3).toHaveFocus();
    });
});