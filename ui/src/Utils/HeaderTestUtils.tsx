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

import { fireEvent, screen, within } from '@testing-library/react';
import { dashboardUrl } from '../Routes';
import TestData from './TestData';

export function openAccountDropdown() {
    const userIconButton = screen.getByTestId('accountDropdownToggle');
    fireEvent.click(userIconButton);
}

export function shouldShowAllAccountDropdownOptions() {
    openAccountDropdown();
    expect(screen.getByText('Sign Out')).toBeDefined();
    expect(screen.getByText('Share Access')).toBeDefined();
    expect(screen.getByText('Download Report')).toBeDefined();
}

export function shouldRenderLogoAsDashboardLinkInHeader() {
    const header = screen.getByTestId('peopleMoverHeader');
    const logoLink = within(header).getByTestId('peopleMoverLogoLink');
    expect(logoLink).toHaveAttribute('href', dashboardUrl);
    expect(logoLink).toHaveTextContent('PEOPLEMOVER');
    expect(within(header).queryByTestId('peopleMoverStaticLogo')).toBeNull();
}

export function shouldRenderStaticLogo() {
    const header = screen.getByTestId('peopleMoverHeader');
    const staticLogo = within(header).getByTestId('peopleMoverStaticLogo');
    expect(staticLogo).not.toHaveAttribute('href');
    expect(staticLogo).toHaveTextContent('PEOPLEMOVER');
    expect(within(header).queryByTestId('peopleMoverLogoLink')).toBeNull();
}

export function shouldOnlyShowSignoutButtonInAccountDropdown() {
    openAccountDropdown();

    expect(screen.getByText('Sign Out')).toBeDefined();
    expect(screen.queryByText('Share Access')).toBeNull();
    expect(screen.queryByText('Download Report')).toBeNull();
}

export function shouldNotShowSpaceNameInHeader() {
    expect(screen.queryByText(TestData.space.name)).toBeNull();
}

export function shouldShowSpaceNameInHeader() {
    expect(screen.getByText(TestData.space.name)).toBeDefined();
}

export function shouldHideHeaderAccountDropdown() {
    expect(screen.queryByText('bob')).toBeNull();
    expect(screen.queryByText('Sign Out')).toBeNull();
    expect(screen.queryByText('Share Access')).toBeNull();
    expect(screen.queryByText('Download Report')).toBeNull();
}
