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
import {screen} from '@testing-library/react';
import Header from './Header';
import flagsmith from 'flagsmith';
import TestUtils, {renderWithRecoil} from 'Utils/TestUtils';
import {MemoryRouter} from 'react-router-dom';
import {
    openAccountDropdown,
    shouldHideHeaderAccountDropdown,
    shouldOnlyShowSignoutButtonInAccountDropdown,
    shouldRenderLogoAsDashboardLinkInHeader,
    shouldRenderStaticLogo,
    shouldShowAllAccountDropdownOptions,
} from 'Utils/HeaderTestUtils';
import {MutableSnapshot} from 'recoil';
import {CurrentUserState} from 'State/CurrentUserState';

const debounceTimeToWait = 100;

describe('Header', () => {
    beforeEach(() => {
        TestUtils.enableInviteUsersToSpace()
    })

    describe('Space Name', () => {
        it('should show name when name prop is populated', () => {
            const expectedSpaceName = 'Test Space Name';
            renderWithRecoil(<Header spaceName={expectedSpaceName} />);
            const spaceNameComponent = screen.getByTestId('headerSpaceName');
            expect(spaceNameComponent).toHaveTextContent(expectedSpaceName)
        });

        it('should not show name when name prop is not populated', async () => {
            await renderHeaderWithoutProps();
            expect(screen.queryByTestId('headerSpaceName')).toBeNull();
        });
    });

    describe('PeopleMover Logo', () => {
        it('should render logo as a link by default', () => {
            renderHeaderWithoutProps();
            shouldRenderLogoAsDashboardLinkInHeader();
        });

        it('should render static logo as a link when showStaticPeopleMoverLogo prop is provided', () => {
            renderWithRecoil(<Header showStaticPeopleMoverLogo />);
            shouldRenderStaticLogo();
        });
    });

    describe('Account Dropdown', () => {
        beforeEach(async () => {
            jest.useFakeTimers();
            flagsmith.hasFeature = jest.fn().mockReturnValue(true);
        });

        it('should hide account dropdown when hideAccountDropdown prop is set', () => {
            renderWithRecoil(<Header hideAccountDropdown />);
            shouldHideHeaderAccountDropdown();
        });

        it('should show account dropdown when hideAccountDropdown prop is not set', async () => {
            await renderHeaderWithoutProps();
            shouldShowAllAccountDropdownOptions();
        });

        it('should only show signout button when onlyShowSignOutButton prop is set', async () => {
            renderWithRecoil(
                <MemoryRouter>
                    <Header onlyShowSignOutButton />
                </MemoryRouter>
            );
            shouldOnlyShowSignoutButtonInAccountDropdown();
        });

        it('should show username', async () => {
            await renderHeaderWithoutProps();
            expect(screen.getByText('USER_ID')).toBeDefined();
        });

        it('should not show invite users to space button when the feature flag is toggled off', async () => {
            TestUtils.enableInviteUsersToSpace(false)
            await renderHeaderWithoutProps();

            openAccountDropdown();
            jest.advanceTimersByTime(debounceTimeToWait);

            expect(screen.queryByTestId('shareAccess')).toBeNull();
        });

        it('should show invite users to space button when the feature flag is toggled on', async () => {
            TestUtils.enableInviteUsersToSpace();
            await renderHeaderWithoutProps();

            openAccountDropdown();
            jest.advanceTimersByTime(debounceTimeToWait);

            expect(await screen.findByTestId('shareAccess')).toBeDefined();
        });
    });
});

async function renderHeaderWithoutProps() {
    renderWithRecoil(
        <MemoryRouter>
            <Header />
        </MemoryRouter>,
        ({set}: MutableSnapshot) => {
            set(CurrentUserState, 'USER_ID')
        }
    );
    await screen.findByTestId('accountDropdownToggle');
}