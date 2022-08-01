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
import React from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithRecoil} from '../../../../Utils/TestUtils';

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
        jest.spyOn(navigator.clipboard, 'writeText');

        renderWithRecoil(<GrantEditAccessConfirmationForm/>);
    });

    afterEach(() => {
        window.location = location;
    });

    it('should show correct space URL', function() {
        expect(screen.queryByText(expectedUrl)).not.toBeNull();
    });

    it('should copy the url to clipboard', async () => {
        fireEvent.click(screen.getByText('Copy link'));
        await waitFor(() =>  expect(navigator.clipboard.writeText).toBeCalledWith(expectedUrl));
    });

    it('should should change text on copy', async () => {
        fireEvent.click(screen.getByText('Copy link'));

        await waitFor(() => {
            expect(screen.queryByText('Copy link')).toBeNull();
            expect(screen.queryByText('Copied!')).not.toBeNull();
        });
    });
});
