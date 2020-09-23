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

import {fireEvent, RenderResult} from '@testing-library/react';
import FilterInput from '../ReusableComponents/FilterInput';
import React from 'react';
import TestUtils, {renderWithRedux} from './TestUtils';
import {Person} from '../People/Person';

describe('The Filter Input', () => {

    const peopleList: Person[] = [
        {name: 'Player1', id: 1, spaceRole: {name: '', id: 1, spaceId: 1}, newPerson: false, spaceId: 0},
        {name: 'Spieler1', id: 2, spaceRole: {name: '', id: 1, spaceId: 1}, newPerson: false, spaceId: 0},
        {name: 'Player2', id: 3, spaceRole: {name: '', id: 1, spaceId: 1}, newPerson: false, spaceId: 0},
    ];

    let result: RenderResult;

    describe('autocomplete', () => {
        beforeEach(() => {
            result = renderWithRedux(<div>
                <FilterInput nameAndId={'person'}
                    listName={'peopleList'}
                    optionList={peopleList}
                    changeCallback={(): null => null}
                    initiallySelectedProduct={TestUtils.unassignedProduct}
                    labelText=""
                />
            </div>);
        });

        it('should show the Oops! div if you search for something no list item starts with', () => {
            expect(result.queryByText("Oops! This person doesn't exist.")).not.toBeInTheDocument();
            fireEvent.change(result.getByTestId('person'), {target: {value: 'Spiee'}});
            expect(result.getByText("Oops! This person doesn't exist.")).toBeInTheDocument();
        });

        it('should not show the Oops! div if you search for something in the list but different case', () => {
            expect(result.queryByText("Oops! This person doesn't exist.")).not.toBeInTheDocument();
            fireEvent.change(result.getByTestId('person'), {target: {value: 's'}});
            expect(result.queryByText("Oops! This person doesn't exist.")).not.toBeInTheDocument();
        });
    });
});