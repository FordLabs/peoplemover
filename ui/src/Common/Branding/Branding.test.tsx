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
import { MemoryRouter } from 'react-router-dom';
import Branding from './Branding';
import { render, screen } from '@testing-library/react';
import { RunConfig } from 'Types/RunConfig';

describe('Branding', () => {
    const expectedUrl = 'url-dot-com';

    beforeEach(() => {
        window.runConfig = { ford_labs_url: expectedUrl } as RunConfig;

        render(
            <MemoryRouter>
                <Branding />
            </MemoryRouter>
        );
    });

    it('should get url from config', () => {
        const fordLabsLink = screen.getByText('FordLabs');
        expect(fordLabsLink).toHaveAttribute('href', expectedUrl);
    });

    it('should go to contact us page when clicking "Contact Us" link', () => {
        const contactUsLink = screen.getByText('Contact Us');
        expect(contactUsLink).toHaveAttribute('href', '/contact-us');
    });
});
