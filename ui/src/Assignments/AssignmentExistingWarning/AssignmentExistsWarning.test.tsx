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

import {renderWithRecoil} from 'Utils/TestUtils';
import AssignmentExistsWarning from './AssignmentExistsWarning';
import {screen} from '@testing-library/react';
import React from 'react';

describe('Assignment exists warning ', () => {
    it('should have appropriate text rendered', async () => {
        renderWithRecoil(<AssignmentExistsWarning/>);
        await screen.findByText('This person is already assigned to this product.');
    });

    it('should have render Okay button', async () => {
        renderWithRecoil(<AssignmentExistsWarning/>);
        await screen.findByText('Okay');
    });
});
