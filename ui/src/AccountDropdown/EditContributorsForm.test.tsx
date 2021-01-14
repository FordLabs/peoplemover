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

import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import React from 'react';
import {fireEvent, RenderResult, wait} from '@testing-library/react';
import EditContributorsForm from './EditContributorsForm';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import {AxiosResponse} from 'axios';
import SpaceClient from '../Space/SpaceClient';
import {createStore} from 'redux';
import {setCurrentSpaceAction} from '../Redux/Actions';


Object.assign(navigator, {
    clipboard: {
        writeText: (): void => {
            return;
        },
    },
});

describe('Edit Contributors view only section', function() {
    const expectedUrl = 'https://some-url';
    let originalWindow: Window;
    let component: RenderResult;
    const testSpace = TestUtils.space;
    let store = createStore(rootReducer,  {currentSpace: TestUtils.space});

    beforeEach(() => {
        jest.clearAllMocks();
        originalWindow = window;
        delete window.location;
        (window as Window) = Object.create(window);
        window.location = {href: expectedUrl} as Location;

        store.dispatch = jest.fn();

        component = renderWithRedux(
            <EditContributorsForm/>,
            store,
            {currentSpace: TestUtils.space} as GlobalStateProps
        );
    });

    afterEach(() => {
        (window as Window) = originalWindow;
    });
    describe('View Only Section', function() {
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

        it('should populate Enable View Only toggle with information from current space', function() {
            const enableViewOnlyCheckbox = component.getByTestId('editContributorsToggleReadOnlySwitch');
            expect(enableViewOnlyCheckbox).toBeChecked();
        });

        it('should update the current space when the toggle is clicked', async function() {
            const expectedUpdatedSpaceData = {...testSpace, todayViewIsPublic: false};

            SpaceClient.editSpace = jest.fn(() => Promise.resolve({
                data: expectedUpdatedSpaceData,
            } as AxiosResponse));

            const enableViewOnlyCheckbox = component.getByTestId('editContributorsToggleReadOnlySwitch');
            expect(enableViewOnlyCheckbox).toBeChecked();
            await fireEvent.click(enableViewOnlyCheckbox);

            expect(SpaceClient.editSpace).toHaveBeenCalledWith(
                testSpace.uuid,
                expectedUpdatedSpaceData,
                testSpace.name
            );


            expect(store.dispatch).toHaveBeenCalledWith(setCurrentSpaceAction(expectedUpdatedSpaceData));
        });
    });
});
