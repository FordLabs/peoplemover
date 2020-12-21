/*
 * Copyright (c) 2020 Ford Motor Company
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

import {RenderResult} from '@testing-library/react';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import ProductFormLocationField from './ProductFormLocationField';
import React from 'react';

describe('', () => {
    let formField: RenderResult;
    
    beforeEach(() => {
        const currentProduct = TestUtils.productWithAssignments;
        const setCurrentProduct = jest.fn();
        const isLoading = false;
        const setIsLoading = jest.fn();
        formField = renderWithRedux(
            <ProductFormLocationField
                spaceId={1}
                currentProductState={{currentProduct, setCurrentProduct}}
                loadingState={{isLoading, setIsLoading}}
                addGroupedTagFilterOptions={jest.fn()}
            />
        );
    });
    
    it('should display "add new" menu option when typing', () => {
        let defaultText  = 'Add a location tag';
        formField.findByText(defaultText);
    });
});