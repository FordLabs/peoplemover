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
import {fireEvent, render, RenderResult} from '@testing-library/react';
import ToolTip from './ToolTip';

describe('ToolTip', () => {
    let app: RenderResult;

    beforeEach(() => {
        app = render(<ToolTip contentText={<p>something </p>}/>);
    });
    
    it('should show the tip on mouse hover',  async () => {
        let button = await app.findByText('What\'s this?');
        let tip = await app.findByTestId('whatIsThisTip');

        expect(tip.classList.contains('whatIsThisHoverNotShow')).toBe(true);
        expect(tip.classList.contains('whatIsThisHoverShow')).toBe(false);
        fireEvent.mouseOver(button);
        expect(tip.classList.contains('whatIsThisHoverNotShow')).toBe(false);
        expect(tip.classList.contains('whatIsThisHoverShow')).toBe(true);
        fireEvent.mouseLeave(button);
        expect(tip.classList.contains('whatIsThisHoverNotShow')).toBe(true);
        expect(tip.classList.contains('whatIsThisHoverShow')).toBe(false);
    });

    it('should show the tip on focus',  async () => {
        let button = await app.findByText('What\'s this?');
        let tip = await app.findByTestId('whatIsThisTip');

        expect(tip.classList.contains('whatIsThisHoverNotShow')).toBe(true);
        expect(tip.classList.contains('whatIsThisHoverShow')).toBe(false);
        fireEvent.focus(button);
        expect(tip.classList.contains('whatIsThisHoverNotShow')).toBe(false);
        expect(tip.classList.contains('whatIsThisHoverShow')).toBe(true);
        fireEvent.blur(button);
        expect(tip.classList.contains('whatIsThisHoverNotShow')).toBe(true);
        expect(tip.classList.contains('whatIsThisHoverShow')).toBe(false);
    });
});
