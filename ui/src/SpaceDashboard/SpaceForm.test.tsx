/*
 * Copyright (c) 2021 Ford Motor Company
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

import * as React from 'react';
import {renderWithRedux} from '../tests/TestUtils';
import {fireEvent} from '@testing-library/dom';
import SpaceForm from './SpaceForm';

describe('Space Form', () => {
    it('should update the count for number of characters and have max input of 40', () => {
        const form = renderWithRedux(<SpaceForm/>);
        const spaceCount = form.getByTestId('createSpaceFieldText');
        const spaceInput = form.getByTestId('createSpaceInputField');
        expect(spaceCount.textContent).toBe('0 (40 characters max)');
        fireEvent.change(spaceInput, {target: {value: 'Some Name'}});
        expect(spaceCount.textContent).toBe('9 (40 characters max)');
        // @ts-ignore
        expect(spaceInput.maxLength).toBe(40);
    });
});

