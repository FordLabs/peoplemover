/*
 * Copyright (c) 2019 Ford Motor Company
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
import {fireEvent, RenderResult} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import TestUtils, {renderWithRedux} from './TestUtils';
import {AxiosResponse} from 'axios';
import ProductClient from '../Products/ProductClient';

describe('Product List tests', () => {
    let app: RenderResult;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        ProductClient.getProductsForDate = jest.fn(() => Promise.resolve(
            {
                data: TestUtils.products,
            } as AxiosResponse
        ));
        app = await renderWithRedux(<PeopleMover/>);
    });

    it('should only have one edit menu open at a time', async () => {
        const editPerson1Button = await app.findByTestId('editPersonIconContainer-1');
        const editPerson3Button = await app.findByTestId('editPersonIconContainer-3');

        fireEvent.click(editPerson1Button);
        await app.findByTestId('editMenu');

        fireEvent.click(editPerson3Button);
        await app.findByTestId('editMenu');

        expect(app.getAllByTestId('editMenu').length).toEqual(1);
    });
});
