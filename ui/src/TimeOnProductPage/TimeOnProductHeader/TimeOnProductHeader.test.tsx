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

import {screen} from '@testing-library/react';
import TestUtils, {renderWithRecoil} from '../../Utils/TestUtils';
import {MemoryRouter} from 'react-router-dom';
import {MutableSnapshot} from 'recoil';
import React from 'react';
import {CurrentSpaceState} from '../../State/CurrentSpaceState';
import TestData from '../../Utils/TestData';
import {axe} from 'jest-axe';
import {
    shouldRenderLogoAsDashboardLinkInHeader,
    shouldShowAllAccountDropdownOptions,
    shouldShowSpaceNameInHeader,
} from '../../Utils/HeaderTestUtils';
import TimeOnProductHeader from './TimeOnProductHeader';

describe('Time On Product Page Header', () => {
    let container: string | Element;

    beforeEach(() => {
        TestUtils.enableInviteUsersToSpace();

        ({container} = renderWithRecoil(
            <MemoryRouter initialEntries={[`/${TestData.space.uuid}/timeonproduct`]}>
                <TimeOnProductHeader />
            </MemoryRouter>,
            ({set}: MutableSnapshot) => {
                set(CurrentSpaceState,  TestData.space)
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
        shouldShowSpaceNameInHeader();
    });

    it('should show logo that links back to the dashboard', () => {
        shouldRenderLogoAsDashboardLinkInHeader();
    });

    it('should show "Back" to space link', async () => {
        const backToSpaceLink = screen.getByText('< Back');
        expect(backToSpaceLink).toBeDefined();
        expect(backToSpaceLink).toHaveAttribute('href', `/${TestData.space.uuid}`);
    });

    it('should show all account dropdown options', () => {
        shouldShowAllAccountDropdownOptions();
    });
});