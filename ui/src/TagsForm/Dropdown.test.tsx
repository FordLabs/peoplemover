/*
 *   Copyright (c) 2020 Ford Motor Company
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { render, RenderResult, fireEvent } from '@testing-library/react';
import Dropdown from './Dropdown';
import React from 'react';

describe('dropdown', () => {
    let component: RenderResult;
    const onChangeValue = jest.fn();

    beforeEach(() => {
        component = render(
            <Dropdown
                value="0"
                label="Label"
                onChange={onChangeValue}
                options={['One', 'Two']}
            />
        );
    });

    it('should open when the button is clicked', () => {
        fireEvent.click(component.getByText('Label'));
        expect(component.getByText('One')).toBeInTheDocument();
    });

    it('should call onChange callback with value of selected option', () => {
        fireEvent.click(component.getByText('Label'));
        fireEvent.click(component.getByText('One'));
        expect(onChangeValue).toHaveBeenCalledTimes(1);
        expect(onChangeValue).toHaveBeenCalledWith('One');
    });
});
