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
import { renderWithRecoil } from 'Utils/TestUtils';
import { fireEvent, screen } from '@testing-library/dom';
import SpaceForm from './SpaceForm';

describe('Space Form', () => {
    beforeEach(() => {
        renderWithRecoil(<SpaceForm />);
    });

    it('should update the count for number of characters and have max input of 40', () => {
        const spaceCount = screen.getByTestId('createSpaceFieldText');
        const spaceInput = screen.getByTestId('createSpaceInputField');
        expect(spaceCount.textContent).toBe('0 (40 characters max)');
        fireEvent.change(spaceInput, { target: { value: 'Some Name' } });
        expect(spaceCount.textContent).toBe('9 (40 characters max)');
        expect(spaceInput).toHaveAttribute('maxLength', '40');
    });

    it('should show an error message if space name is only empty space', () => {
        const spaceInput = screen.getByTestId('createSpaceInputField');
        const createSpaceButton = screen.getByTestId('createSpaceButton');
        fireEvent.change(spaceInput, { target: { value: '   ' } });
        fireEvent.click(createSpaceButton);
        expect(screen.getByTestId('createSpaceErrorMessage')).toBeVisible();
    });
});
