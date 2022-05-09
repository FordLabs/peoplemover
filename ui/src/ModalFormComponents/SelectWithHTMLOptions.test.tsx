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
import * as React from 'react';
import SelectWithHTMLOptions from './SelectWithHTMLOptions';
import {render, RenderResult, fireEvent, waitFor} from '@testing-library/react';

jest.useFakeTimers();

describe('SelectWithHTMLOptions', () => {
    const setTimeoutTime = 100;
    const [upKey, downKey, enterKey] = [38, 40, 13];

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
            <SelectWithHTMLOptions
                ariaLabel="selectAriaLabel"
                selectedOption={options[0]}
                options={options}
                onChange={onChange}/>
        );
    });

    describe('onClick', () => {
        beforeEach(async () => {
            const selectDropdownButton = component.getByText('Zero');
            await waitFor(() => {
                fireEvent.click(selectDropdownButton);
                jest.advanceTimersByTime(setTimeoutTime);
            });

            const selectDropdownOption = component.getByText('Two');
            await waitFor(() => {
                fireEvent.click(selectDropdownOption);
                jest.advanceTimersByTime(setTimeoutTime);
            });
        });

        it('should display a newly selected option on click', () => {
            expect(component.queryByText('Zero')).toBeNull();
            expect(component.queryByText('One')).toBeNull();
            const expectedDropdownButton = component.queryByText('Two');
            expect(expectedDropdownButton).not.toBeNull();
        });

        it('should notify watcher of value change on click', () => {
            expect(onChange).toHaveBeenCalledWith(options[2]);
        });
    });


    describe('onKeyDown', () => {
        beforeEach(async () => {
            const selectDropdownButton = component.getByText('Zero');
            await waitFor(() => {
                fireEvent.keyDown(selectDropdownButton, {keyCode: enterKey});
                jest.advanceTimersByTime(setTimeoutTime);
            });

            const selectedOptionZero = component.getByTestId('selectOption__0');
            expect(selectedOptionZero.className).toContain('focused');
            await waitFor(() => {
                fireEvent.keyDown(component.getByTestId('selectDropdownOptions'), {keyCode: downKey});
            });

            await waitFor(() => {
                fireEvent.keyDown(component.getByTestId('selectDropdownOptions'), {keyCode: downKey});
            });

            const selectedOptionTwo = component.getByTestId('selectOption__2');
            expect(selectedOptionTwo.className).toContain('focused');

            await waitFor(() => {
                fireEvent.keyDown(component.getByTestId('selectDropdownOptions'), {keyCode: upKey});
            });

            const selectedOptionOne = component.getByTestId('selectOption__1');
            expect(selectedOptionOne.className).toContain('focused');

            await waitFor(() => {
                fireEvent.keyDown(component.getByTestId('selectDropdownOptions'), {keyCode: enterKey});
                jest.advanceTimersByTime(setTimeoutTime);
            });
        });

        it('should display a newly selected option on keydown', () => {
            expect(component.queryByText('Zero')).toBeNull();
            const expectedDropdownButton = component.queryByText('One');
            expect(expectedDropdownButton).not.toBeNull();
            expect(component.queryByText('Two')).toBeNull();
        });

        it('should notify watcher of value change on keydown', () => {
            expect(onChange).toHaveBeenCalledWith(options[1]);
        });
    });

    describe('Aria Labels', () => {
        beforeEach(async () => {
            const selectDropdownButton = component.getByText('Zero');
            await waitFor(() => {
                fireEvent.click(selectDropdownButton);
                jest.advanceTimersByTime(setTimeoutTime);
            });
        });

        it('should have aria labels on the dropdown toggle button', () => {
            component.getByLabelText('selectAriaLabel Selector: ariaLabel0 is selected');
        });

        it('should have aria labels on the dropdown options list', () => {
            component.getByLabelText('selectAriaLabel Options');
        });

        it('should have aria labels on the dropdown options', () => {
            component.getByLabelText('ariaLabel0');
            component.getByLabelText('ariaLabel1');
            component.getByLabelText('ariaLabel2');
        });

        it('should have aria-selected to be true on the active option', () => {
            const options = component.getAllByRole('option');

            options.forEach((option) => {
                if (option.innerHTML.includes('Zero')) {
                    expect(option.getAttribute('aria-selected')).toBe('true');
                } else {
                    expect(option.getAttribute('aria-selected')).toBe('false');
                }
            });
        });
    });
});
