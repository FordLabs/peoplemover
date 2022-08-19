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

import { screen } from '@testing-library/react';
import { renderWithRecoil } from '../../Utils/TestUtils';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import ErrorPageTemplate from './ErrorPageTemplate';
import errorImageSrc from 'Assets/403.png';
import {
    shouldHideHeaderAccountDropdown,
    shouldNotShowSpaceNameInHeader,
    shouldRenderLogoAsDashboardLinkInHeader,
} from '../../Utils/HeaderTestUtils';

describe('Error Page Template', () => {
    const errorPageText = 'Error Text!';

    beforeEach(() => {
        renderWithRecoil(
            <MemoryRouter initialEntries={['/error/404']}>
                <ErrorPageTemplate
                    errorGraphic={errorImageSrc}
                    errorText={errorPageText}
                />
            </MemoryRouter>
        );
    });

    it('should show error text', () => {
        expect(screen.getByText(errorPageText)).toBeDefined();
    });

    describe('Header', () => {
        it('should show header', () => {
            expect(screen.getByTestId('peopleMoverHeader')).toBeDefined();
        });

        it('should NOT show space name', () => {
            shouldNotShowSpaceNameInHeader();
        });

        it('should show logo that links back to the dashboard', () => {
            shouldRenderLogoAsDashboardLinkInHeader();
        });

        it('should not show the account dropdown at all when user is on the error page', () => {
            shouldHideHeaderAccountDropdown();
        });
    });
});
