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
import { render, RenderResult } from '@testing-library/react';
import PeopleMoverLogo from './PeopleMoverLogo';

import { axe } from 'jest-axe';

describe('People Mover Logo', () => {
    let app: RenderResult;

    describe('Link Logo', () => {
        beforeEach(() => {
            app = render(<PeopleMoverLogo href="https://whatever.com" />);
        });

        it('should be a link when an href is present', async () => {
            expect(app.getByTestId('peopleMoverLogoLink').nodeName).toBe('A');
        });

        it('should have no axe violations', async () => {
            const results = await axe(app.container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Static Logo', () => {
        beforeEach(() => {
            app = render(<PeopleMoverLogo />);
        });

        it('should be a div when an href is NOT present', async () => {
            expect(app.getByTestId('peopleMoverStaticLogo').nodeName).toBe(
                'DIV'
            );
        });

        it('should have no axe violations', async () => {
            const results = await axe(app.container);
            expect(results).toHaveNoViolations();
        });
    });
});
