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
import ContactUsPage from './ContactUsPage';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import ContactUsClient from '../Services/Api/ContactUsClient';
import {ContactUsRequest, UserType} from '../Types/ContactUsRequest';
import {axe} from 'jest-axe';
import {renderWithRecoil} from '../Utils/TestUtils';
import {
    shouldNotShowSpaceNameInHeader,
    shouldOnlyShowSignoutButtonInAccountDropdown,
    shouldRenderLogoAsDashboardLinkInHeader,
} from '../Utils/HeaderTestUtils';

jest.mock('Services/Api/ContactUsClient');

describe('Contact Us Page', () => {
    it('should populate and submit contact us form', async () => {
        const confirmationMessage = 'Thanks! A member of our team will reach out to help you.';
        const expectedFormValues: ContactUsRequest = {
            name: 'Layla',
            email: 'layla@abc.com',
            userType: UserType.NEW_USER,
            message: 'Something isn\'t working right.'
        }

        renderContactUsPage();

        await userEvent.type(screen.getByLabelText('Name:'), expectedFormValues.name);
        await userEvent.type(screen.getByLabelText('Email:'), expectedFormValues.email);
        const radioButtonToClick = screen.getByLabelText(expectedFormValues.userType);
        expect(radioButtonToClick).not.toBeChecked();
        await userEvent.click(radioButtonToClick);
        expect(radioButtonToClick).toBeChecked();
        expect(screen.getByLabelText('Existing User')).not.toBeChecked();
        expect(screen.getByLabelText('Other')).not.toBeChecked();
        await userEvent.type(screen.getByLabelText('How can we help?'), expectedFormValues.message);

        expect(screen.queryByText(confirmationMessage)).toBeNull();

        await userEvent.click(screen.getByText('Send'));

        await waitFor(() => expect(ContactUsClient.send).toHaveBeenCalledWith(expectedFormValues));

        expect(screen.queryByText('Send')).toBeNull();
        expect(screen.getByText(confirmationMessage)).toBeDefined();
    });

    describe('Contact Us Header', () => {
        let container: string | Element;

        beforeEach(() => {
            ({container} = renderContactUsPage());
        })

        it('should have no axe violations', async () => {
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should show header', () => {
            expect(screen.getByTestId('peopleMoverHeader')).toBeDefined();
        });

        it('should NOT show space name', () => {
            shouldNotShowSpaceNameInHeader();
        });

        it('should show logo that links back to the dashboard', () => {
            shouldRenderLogoAsDashboardLinkInHeader();
        });

        it('should ONLY show the "Sign Out" button in the account dropdown', () => {
            shouldOnlyShowSignoutButtonInAccountDropdown();
        });
    });
});

function renderContactUsPage() {
    return renderWithRecoil(
        <MemoryRouter initialEntries={['/contact-us']}>
            <ContactUsPage />
        </MemoryRouter>
    );
}