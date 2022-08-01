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

import React from 'react';
import {fireEvent, render, RenderResult} from '@testing-library/react';
import ToolTip from './ToolTip';

describe('ToolTip', () => {
    let app: RenderResult;
    let testMethod: () => void;

    beforeEach(() => {
        testMethod = jest.fn();
        app = render(<ToolTip toolTipLabel="What's this?" contentElement={<p>something </p>} onHover={testMethod}/>);
    });
    
    it('should show the tip on mouse hover',  async () => {
        const button = await app.findByText('What\'s this?');
        const tip = await app.findByTestId('toolTipText');

        app.findByText('something ');

        expect(tip.classList.contains('toolTipHoverNotShow')).toBe(true);
        expect(tip.classList.contains('toolTipHoverShow')).toBe(false);
        fireEvent.mouseOver(button);
        expect(tip.classList.contains('toolTipHoverNotShow')).toBe(false);
        expect(tip.classList.contains('toolTipHoverShow')).toBe(true);
        fireEvent.mouseLeave(button);
        expect(tip.classList.contains('toolTipHoverNotShow')).toBe(true);
        expect(tip.classList.contains('toolTipHoverShow')).toBe(false);
        expect(testMethod).toHaveBeenCalledTimes(1);
    });

    it('should show the tip on focus',  async () => {
        const button = await app.findByText('What\'s this?');
        const tip = await app.findByTestId('toolTipText');

        app.findByText('something ');

        expect(tip.classList.contains('toolTipHoverNotShow')).toBe(true);
        expect(tip.classList.contains('toolTipHoverShow')).toBe(false);
        fireEvent.focus(button);
        expect(tip.classList.contains('toolTipHoverNotShow')).toBe(false);
        expect(tip.classList.contains('toolTipHoverShow')).toBe(true);
        fireEvent.blur(button);
        expect(tip.classList.contains('toolTipHoverNotShow')).toBe(true);
        expect(tip.classList.contains('toolTipHoverShow')).toBe(false);
        expect(testMethod).toHaveBeenCalledTimes(1);
    });
});
