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

import {fireEvent} from '@testing-library/react';
import React from 'react';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import rootReducer from '../Redux/Reducers';
import {createStore, Store} from 'redux';
import PersonCard from './PersonCard';
import {Person} from './Person';
import {setCurrentModalAction} from '../Redux/Actions';
import {AvailableModals} from '../Modal/AvailableModals';

describe('Person Card', () => {
    let personToRender: Person;
    let store: Store;

    beforeEach(() => {
        jest.clearAllMocks();
        personToRender = {
            newPerson: false,
            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            id: 1,
            name: 'Billiam Handy',
            spaceRole: TestUtils.softwareEngineer,
            notes: 'This is a note',
            tags: TestUtils.personTags,
            archiveDate: new Date(2000, 0, 1),
        };

        store = createStore(rootReducer, {currentSpace: TestUtils.space, viewingDate: new Date(2020, 0, 1)});
        store.dispatch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the assigned persons name', () => {
        const underTest = renderWithRedux(<PersonCard person={personToRender}/>, store);
        expect(underTest.getByText('Billiam Handy')).toBeInTheDocument();
    });

    it('should render the assigned persons role if they have one', () => {
        const underTest = renderWithRedux(<PersonCard person={personToRender}/>, store);
        expect(underTest.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should make the call to open the Edit Person modal when person name is clicked', async () => {
        const app = renderWithRedux(<PersonCard person={personToRender}/>, store);
        const billiam = app.getByText(personToRender.name);
        expect(billiam).toBeEnabled();
        fireEvent.click(billiam);
        expect(store.dispatch).toHaveBeenCalledWith(
            setCurrentModalAction({
                modal: AvailableModals.EDIT_PERSON,
                item: personToRender,
            })
        );
    });

    it('should not show any icons (note, tag)', () => {
        const app = renderWithRedux(<PersonCard person={personToRender}/>, store);
        expect(app.queryByText('note')).toBeNull();
        expect(app.queryByText('local_offer')).toBeNull();
    });

    it('should not have the hover box on mouseover', async () => {
        const app = renderWithRedux(<PersonCard person={personToRender}/>, store);
        fireEvent.mouseEnter(await app.getByText(personToRender.name));
        expect(await app.queryByText('note')).toBeNull();
        expect(app.queryByText('local_offer')).toBeNull();
    });

    describe('Read-Only Functionality', function() {

        beforeEach(function() {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: true});
            store.dispatch = jest.fn();
        });

        it('should not display Edit Person Modal if in read only mode', function() {
            const underTest = renderWithRedux(<PersonCard person={personToRender}/>, store);
            const billiam = underTest.getByText(personToRender.name);
            fireEvent.click(billiam);
            expect(store.dispatch).not.toHaveBeenCalled();
        });
    });
});
