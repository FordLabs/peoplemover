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
import * as React from 'react';
import Select from './Select';
import {render, RenderResult, fireEvent} from '@testing-library/react';

describe('Select', () => {

    let component: RenderResult;
    let onChange: jest.Mock;
    const options = [
        {
            value: 0,
            displayValue: <span>Zero</span>,
            ariaLabel: 'ariaLabel0',
        },
        {
            value: 1,
            displayValue: <span>One</span>,
            ariaLabel: 'ariaLabel1',
        },
        {
            value: 2,
            displayValue: <span>Two</span>,
            ariaLabel: 'ariaLabel2',
        },
    ];
    
    beforeEach(() => {
        onChange = jest.fn();
        component = render(
            <Select
                ariaLabel="selectAriaLabel"
                selectedOption={options[0]}
                options={options}
                onChange={onChange}/>
        );
    });
    
    it('should display a newly selected option', () => {
        fireEvent.click(component.getByText('Zero'));
        fireEvent.click(component.getByText('Two'));

        expect(component.queryByText('Zero')).toBeNull();
        expect(component.queryByText('One')).toBeNull();
        expect(component.queryByText('Two')).not.toBeNull();
    });

    it('should notify watcher of value change', () => {
        fireEvent.click(component.getByText('Zero'));
        fireEvent.click(component.getByText('Two'));

        expect(onChange).toHaveBeenCalledWith(options[2]);
    });
});
