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

import GrantEditAccessConfirmationForm from './GrantEditAccessConfirmationForm';
import {renderWithRedux} from 'Utils/TestUtils';
import React from 'react';
import {fireEvent, waitFor} from '@testing-library/react';

Object.assign(navigator, {
    clipboard: {
        writeText: (): void => {return;},
    },
});

describe('Grant Edit Access Confirmation Form', function() {
    const expectedUrl = 'https://some-url';
    let location: (string | Location) & Location;

    beforeEach(() => {
        location = window.location;
        Reflect.deleteProperty(window, 'location');

        Object.defineProperty(window, 'location', {
            value: { href: expectedUrl },
            writable: true,
        });
    });

    afterEach(() => {
        window.location = location;
    });

    it('should show correct space URL', function() {
        const component = renderWithRedux(<GrantEditAccessConfirmationForm/>);
        expect(component.queryByText(expectedUrl)).not.toBeNull();
    });

    it('should copy the url to clipboard', async () => {
        jest.spyOn(navigator.clipboard, 'writeText');
        const component = renderWithRedux(<GrantEditAccessConfirmationForm/>);

        await waitFor(() => {
            fireEvent.click(component.getByText('Copy link'));
        });

        expect(navigator.clipboard.writeText).toBeCalledWith(expectedUrl);
    });

    it('should should change text on copy', async () => {
        const component = renderWithRedux(<GrantEditAccessConfirmationForm/>);

        await waitFor(() => {
            fireEvent.click(component.getByText('Copy link'));
        });

        expect(component.queryByText('Copy link')).toBeNull();
        expect(component.queryByText('Copied!')).not.toBeNull();
    });
});
