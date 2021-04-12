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
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import Counter from './Counter';
import {RenderResult} from '@testing-library/react';

describe('counter', () => {
    let app: RenderResult;

    beforeEach( () => {
        app = renderWithRedux(<Counter products={TestUtils.products}/>);
    });

    it('should display the number of products and people when no filter are applied', async () => {
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML('Results: 5 Products, 3 People (1 Unassigned)');
    });
});
