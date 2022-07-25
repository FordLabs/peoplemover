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
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';

describe('Contact Us Page', () => {
    it('should populate and submit contact us form', async () => {
        console.log = jest.fn();

        const expectedFormValues = {
            name: 'Layla',
            email: 'layla@abc.com',
            userType: 'New User',
            message: 'Something isn\'t working right.'
        }

        render(<MemoryRouter><ContactUsPage /></MemoryRouter>);
        await userEvent.type(screen.getByLabelText('Name:'), expectedFormValues.name);
        await userEvent.type(screen.getByLabelText('Email:'), expectedFormValues.email);
        const radioButtonToClick = screen.getByLabelText(expectedFormValues.userType);
        expect(radioButtonToClick).not.toBeChecked();
        await userEvent.click(radioButtonToClick);
        expect(radioButtonToClick).toBeChecked();
        expect(screen.getByLabelText('Existing User')).not.toBeChecked();
        expect(screen.getByLabelText('Other')).not.toBeChecked();
        await userEvent.type(screen.getByLabelText('How can we help?'), expectedFormValues.message);

        await userEvent.click(screen.getByText('Send'));

        expect(console.log).toHaveBeenCalledWith('Send!', expectedFormValues);
    });
});