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

import React from 'react';
import EditTagRow from './EditTagRow';
import {renderWithRedux} from '../tests/TestUtils';
import {act, fireEvent} from '@testing-library/react';

describe('EditTagRow', () => {
    describe('validation', () => {
        it('should treat empty strings and strings of spaces as invalid', async () => {
            const editTagRow = renderWithRedux(<EditTagRow
                tagType={'role'}
                onSave={jest.fn()}
                onCancel={jest.fn()}
                existingTags={[]}
            />);
            expect(await editTagRow.findByTestId('saveTagButton')).toBeDisabled();
            await act(async () => {fireEvent.change(await editTagRow.findByTestId('tagNameInput'), {target: {value: ''}});});
            expect(await editTagRow.findByTestId('saveTagButton')).toBeDisabled();
            await act(async () => {fireEvent.change(await editTagRow.findByTestId('tagNameInput'), {target: {value: '  '}});});
            expect(await editTagRow.findByTestId('saveTagButton')).toBeDisabled();
            await act(async () => {fireEvent.change(await editTagRow.findByTestId('tagNameInput'), {target: {value: '  one  '}});});
            expect(await editTagRow.findByTestId('saveTagButton')).toBeEnabled();
        });
    });
});