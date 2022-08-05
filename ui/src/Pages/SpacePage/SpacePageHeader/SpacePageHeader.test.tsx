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

import {axe} from 'jest-axe';
import {screen} from '@testing-library/react';
import TestUtils, {renderWithRecoil} from 'Utils/TestUtils';
import {MemoryRouter} from 'react-router-dom';
import {MutableSnapshot} from 'recoil';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import React from 'react';
import TestData from 'Utils/TestData';
import {dashboardUrl} from 'Routes';
import SpacePageHeader from './SpacePageHeader';
import {shouldShowAllAccountDropdownOptions} from 'Utils/HeaderTestUtils';

describe('Space Page Header', () => {
    let container: string | Element;

    beforeEach(() => {
        TestUtils.enableInviteUsersToSpace();

        ({container} = renderWithRecoil(
            <MemoryRouter initialEntries={[`/${TestData.space.uuid}`]}>
                <SpacePageHeader />
            </MemoryRouter>,
            ({set}: MutableSnapshot) => {
                set(CurrentSpaceState, TestData.space)
            }
        ));
    })

    it('should have no axe violations', async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should show header', () => {
        expect(screen.getByTestId('peopleMoverHeader')).toBeDefined();
    });

    it('should show space name', () => {
        const headerSpaceName = screen.getByTestId('headerSpaceName');
        expect(headerSpaceName).toHaveTextContent(TestData.space.name);
    });

    it('should render "Skip to main content" accessibility link', () => {
        const skipButton = screen.getByText('Skip to main content');
        expect(skipButton).toHaveAttribute('href', '#main-content-landing-target')
    });

    it('should show logo that links back to the dashboard', () => {
        const logoLink = screen.getByTestId('peopleMoverLogoLink');
        expect(logoLink).toHaveAttribute('href', dashboardUrl);
        expect(logoLink).toHaveTextContent('PEOPLEMOVER');
        expect(screen.queryByTestId('peopleMoverStaticLogo')).toBeNull();
    });

    it('should show "Time On Product" link', () => {
        const timeOnProductLink = screen.getByText('Time On Product >');
        expect(timeOnProductLink).toBeDefined();
        expect(timeOnProductLink).toHaveAttribute('href', `/${TestData.space.uuid}/timeonproduct`);
        expect(screen.queryByText('< Back')).toBeNull();
    });

    it('should show all account dropdown options', () => {
        shouldShowAllAccountDropdownOptions();
    });
});