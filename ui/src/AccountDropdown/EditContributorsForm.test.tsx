/*
 *
 *  Copyright (c) 2020 Ford Motor Company
 *  All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import {renderWithRedux} from '../tests/TestUtils';
import React from 'react';
import {fireEvent, RenderResult, wait} from '@testing-library/react';
import EditContributorsForm from './EditContributorsForm';

Object.assign(navigator, {
    clipboard: {
        writeText: (): void => {return;},
    },
});

describe('Edit Contributors view only section', function() {
    const expectedUrl = 'https://some-url';
    let originalWindow: Window;
    let component: RenderResult;

    beforeEach(() => {
        originalWindow = window;
        delete window.location;
        (window as Window) = Object.create(window);
        window.location = {href: expectedUrl} as Location;
        component = renderWithRedux(<EditContributorsForm/>);
    });

    afterEach(() => {
        (window as Window) = originalWindow;
    });

    it('should show correct space URL', function() {
        expect(component.queryByText(expectedUrl)).not.toBeNull();
    });

    it('should copy the url to clipboard', async () => {
        jest.spyOn(navigator.clipboard, 'writeText');

        await wait(() => {
            fireEvent.click(component.getByText('Copy link'));
        });

        expect(navigator.clipboard.writeText).toBeCalledWith(expectedUrl);
    });

    it('should should change text on copy', async () => {
        await wait(() => {
            fireEvent.click(component.getByText('Copy link'));
        });

        expect(component.queryByText('Copy link')).toBeNull();
        expect(component.queryByText('Copied!')).not.toBeNull();
    });
});
