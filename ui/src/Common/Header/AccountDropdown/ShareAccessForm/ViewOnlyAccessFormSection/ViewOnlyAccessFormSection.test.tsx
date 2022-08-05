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

import {renderWithRecoil} from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import React from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import SpaceClient from 'Services/Api/SpaceClient';
import {Space} from 'Types/Space';
import ViewOnlyAccessFormSection from './ViewOnlyAccessFormSection';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {RecoilObserver} from 'Utils/RecoilObserver';

Object.assign(navigator, {
    clipboard: {
        writeText: (): void => {
            return;
        },
    },
});

let actualCurrentSpace: Space | null;

describe('View Only Access Form Section', () => {
    const testSpace = TestData.space;
    const testSpaceWithViewOnlyOn = {...testSpace, todayViewIsPublic: true};
    const testSpaceWithViewOnlyOff = {...testSpace, todayViewIsPublic: false};
    const expectedUrl = 'https://some-url';

    let location: (string | Location) & Location;

    beforeEach(() => {
        actualCurrentSpace = null;

        location = window.location;
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
    });

    it('should show correct space URL', async () => {
        setupComponent(testSpaceWithViewOnlyOn);

        const actualLinkToSpace = await screen.findByTestId('linkToSpace');
        expect(actualLinkToSpace.getAttribute('value')).toBe(expectedUrl);
    });

    it('should copy the url to clipboard', async () => {
        setupComponent(testSpaceWithViewOnlyOn);
        jest.spyOn(navigator.clipboard, 'writeText');

        fireEvent.click(screen.getByText('Copy link'));

        await waitFor(() => expect(navigator.clipboard.writeText).toBeCalledWith(expectedUrl));
    });

    it('should should change text on copy', async () => {
        setupComponent(testSpaceWithViewOnlyOn);
        fireEvent.click(screen.getByText('Copy link'));

        await waitFor(() => expect(screen.queryByText('Copy link')).toBeNull());
        expect(screen.queryByText('Copied!')).not.toBeNull();
    });

    it('should populate Enable View Only toggle with information from current space', function() {
        setupComponent(testSpaceWithViewOnlyOn);
        const enableViewOnlyCheckbox = screen.getByTestId('viewOnlyAccessToggle');
        expect(enableViewOnlyCheckbox).toBeChecked();
    });

    it('should update the current space when the toggle is clicked', async function() {
        setupComponent(testSpaceWithViewOnlyOn);

        const expectedUpdatedSpaceData = {...testSpace, todayViewIsPublic: false};
        SpaceClient.editSpaceReadOnlyFlag = jest.fn().mockResolvedValue({
            data: expectedUpdatedSpaceData,
        });

        const enableViewOnlyCheckbox = screen.getByTestId('viewOnlyAccessToggle');
        expect(enableViewOnlyCheckbox).toBeChecked();
        fireEvent.click(enableViewOnlyCheckbox);

        await waitFor(() => expect(SpaceClient.editSpaceReadOnlyFlag).toHaveBeenCalledWith(
            testSpace.uuid,
            expectedUpdatedSpaceData
        ));

        expect(actualCurrentSpace).toEqual(expectedUpdatedSpaceData);
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

const setupComponent = (currentSpace: Space, collapsed = false) => {
    renderWithRecoil(
        <>
            <RecoilObserver
                recoilState={CurrentSpaceState}
                onChange={(value: Space) => {
                    actualCurrentSpace = value;
                }}
            />
            <ViewOnlyAccessFormSection collapsed={collapsed} />
        </>,
        ({set}) => {
            set(CurrentSpaceState, currentSpace)
        }
    );
};
