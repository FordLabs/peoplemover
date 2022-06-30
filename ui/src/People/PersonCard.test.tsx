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

import {fireEvent, screen} from '@testing-library/react';
import React from 'react';
import {renderWithRedux} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import {Store} from 'redux';
import PersonCard from './PersonCard';
import {Person} from './Person';
import {setCurrentModalAction} from '../Redux/Actions';
import {AvailableModals} from '../Modal/AvailableModals';
import {RecoilRoot} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import configureStore from 'redux-mock-store';
import {IsReadOnlyState} from '../State/IsReadOnlyState';

describe('Person Card', () => {
    const personToRender: Person = {
        newPerson: false,
        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        id: 1,
        name: 'Billiam Handy',
        spaceRole: TestData.softwareEngineer,
        notes: 'This is a note',
        tags: TestData.personTags,
        archiveDate: new Date(2000, 0, 1),
    }
    let store: Store;
    const viewingDate = new Date(2020, 0, 1);
    let initialState: unknown;

    beforeEach(() => {
        jest.clearAllMocks();

        initialState = {currentSpace: TestData.space}
    });

    it('should render the assigned persons name', () => {
        renderPersonCard(initialState, viewingDate);
        expect(screen.getByText('Billiam Handy')).toBeInTheDocument();
    });

    it('should render the assigned persons role if they have one', () => {
        renderPersonCard(initialState, viewingDate);
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should make the call to open the Edit Person modal when person name is clicked', async () => {
        renderPersonCard(initialState, viewingDate);
        const william = screen.getByText(personToRender.name);
        expect(william).toBeEnabled();

        fireEvent.click(william);

        expect(store.dispatch).toHaveBeenCalledWith(
            setCurrentModalAction({
                modal: AvailableModals.EDIT_PERSON,
                item: personToRender,
            })
        );
    });

    it('should not show any icons (note, tag)', () => {
        renderPersonCard(initialState, viewingDate);
        expect(screen.queryByText('note')).toBeNull();
        expect(screen.queryByText('local_offer')).toBeNull();
    });

    it('should not have the hover box on mouseover', async () => {
        renderPersonCard(initialState, viewingDate);
        fireEvent.mouseEnter(await screen.getByText(personToRender.name));
        expect(await screen.queryByText('note')).toBeNull();
        expect(screen.queryByText('local_offer')).toBeNull();
    });

    describe('Read-Only Functionality', function() {
        beforeEach(() => {
            initialState = {currentSpace: TestData.space};
        });

        it('should not display Edit Person Modal if in read only mode', function() {
            renderPersonCard(initialState, new Date(), true);
            const william = screen.getByText(personToRender.name);
            fireEvent.click(william);
            expect(store.dispatch).not.toHaveBeenCalled();
        });
    });

    function renderPersonCard(preloadedReduxState: unknown, initialViewingDate: Date =  new Date(), isReadOnly = false): void {
        const mockStore = configureStore([]);
        store = mockStore(preloadedReduxState);
        store.dispatch = jest.fn();
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, initialViewingDate);
                set(IsReadOnlyState, isReadOnly);
            }}>
                <PersonCard person={personToRender}/>
            </RecoilRoot>,
            store
        )
    }
});
