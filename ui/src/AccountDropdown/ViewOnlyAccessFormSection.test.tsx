/*
 *  Copyright (c) 2022 Ford Motor Company
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
 */

import {renderWithRedux} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import React from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import rootReducer from '../Redux/Reducers';
import SpaceClient from '../Space/SpaceClient';
import {createStore, Store} from 'redux';
import {Space} from '../Space/Space';
import {setCurrentSpaceAction} from '../Redux/Actions';
import ViewOnlyAccessFormSection from './ViewOnlyAccessFormSection';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';

declare let window: MatomoWindow;

Object.assign(navigator, {
    clipboard: {
        writeText: (): void => {
            return;
        },
    },
});

describe('View Only Access Form Section', () => {
    const testSpace = TestData.space;
    const testSpaceWithViewOnlyOn = {...testSpace, todayViewIsPublic: true};
    const testSpaceWithViewOnlyOff = {...testSpace, todayViewIsPublic: false};
    const expectedUrl = 'https://some-url';

    let location: (string | Location) & Location;
    let _paq: (string | number)[][];

    beforeEach(() => {
        location = window.location;
        _paq = window._paq
        Reflect.deleteProperty(window, 'location');

        Object.defineProperty(window, 'location', {
            value: { href: expectedUrl },
            writable: true,
        });
        Object.defineProperty(window, '_paq', {
            value: [],
            writable: true,
        });

        jest.clearAllMocks();
    });

    afterEach(() => {
        window.location = location;
        window._paq = _paq
    });

    it('should show correct space URL', async () => {
        setupComponent(testSpaceWithViewOnlyOn);

        const actualLinkToSpace = await screen.findByTestId('linkToSpace');
        expect(actualLinkToSpace.getAttribute('value')).toBe(expectedUrl);
    });

    it('should copy the url to clipboard', async () => {
        setupComponent(testSpaceWithViewOnlyOn);
        jest.spyOn(navigator.clipboard, 'writeText');

        await waitFor(() => {
            fireEvent.click(screen.getByText('Copy link'));
        });

        expect(navigator.clipboard.writeText).toBeCalledWith(expectedUrl);
        expect(window._paq).toContainEqual(['trackEvent', TestData.space.name, 'readOnlyLinkCopied', '']);
    });

    it('should should change text on copy', async () => {
        setupComponent(testSpaceWithViewOnlyOn);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Copy link'));
        });

        expect(screen.queryByText('Copy link')).toBeNull();
        expect(screen.queryByText('Copied!')).not.toBeNull();
    });

    it('should populate Enable View Only toggle with information from current space', function() {
        setupComponent(testSpaceWithViewOnlyOn);
        const enableViewOnlyCheckbox = screen.getByTestId('viewOnlyAccessToggle');
        expect(enableViewOnlyCheckbox).toBeChecked();
    });

    it('should update the current space when the toggle is clicked', async function() {
        const { store } = setupComponent(testSpaceWithViewOnlyOn);

        const expectedUpdatedSpaceData = {...testSpace, todayViewIsPublic: false};
        SpaceClient.editSpaceReadOnlyFlag = jest.fn().mockResolvedValue({
            data: expectedUpdatedSpaceData,
        });

        const enableViewOnlyCheckbox = screen.getByTestId('viewOnlyAccessToggle');
        expect(enableViewOnlyCheckbox).toBeChecked();
        await fireEvent.click(enableViewOnlyCheckbox);

        expect(SpaceClient.editSpaceReadOnlyFlag).toHaveBeenCalledWith(
            testSpace.uuid,
            expectedUpdatedSpaceData
        );

        expect(store.dispatch).toHaveBeenCalledWith(setCurrentSpaceAction(expectedUpdatedSpaceData));
    });

    it('should have copy link button disabled when view only view is turned off', async function() {
        setupComponent(testSpaceWithViewOnlyOff);
        const viewOnlyAccessFormCopyLinkButton = screen.getByTestId('viewOnlyAccessFormCopyLinkButton');
        expect(viewOnlyAccessFormCopyLinkButton).toBeDisabled();
    });

    it('should show toggle and tooltips when form is expanded', () => {
        setupComponent(testSpaceWithViewOnlyOn, false);
        expect(screen.queryByTestId('viewOnlyAccessToggle')).toBeInTheDocument();
        expect(screen.queryByTestId('viewOnlyAccessTooltip')).toBeInTheDocument();
    });

    it('should hide toggle and tooltips when form is collapsed', () => {
        setupComponent(testSpaceWithViewOnlyOn, true);
        expect(screen.queryByTestId('viewOnlyAccessToggle')).toBeNull();
        expect(screen.queryByTestId('viewOnlyAccessTooltip')).toBeNull();
    });
});

const setupComponent = (currentSpace: Space, collapsed = false): { store: Store } => {
    const store = createStore(rootReducer,  {currentSpace});
    store.dispatch = jest.fn();
    renderWithRedux(
        <ViewOnlyAccessFormSection collapsed={collapsed} />,
        store,
        {currentSpace: currentSpace}
    );

    return { store };
};
