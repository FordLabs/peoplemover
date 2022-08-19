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

import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import TestData from 'Utils/TestData';
import PersonCard from './PersonCard';
import { ViewingDateState } from 'State/ViewingDateState';
import { IsReadOnlyState } from 'State/IsReadOnlyState';
import { ModalContents, ModalContentsState } from 'State/ModalContentsState';
import { RecoilObserver } from 'Utils/RecoilObserver';
import PersonForm from 'Common/PersonForm/PersonForm';
import { renderWithRecoil } from 'Utils/TestUtils';
import { Person } from 'Types/Person';

describe('Person Card', () => {
    let modalContent: ModalContents | null;
    const personToRender: Person = {
        newPerson: false,
        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        id: 1,
        name: 'Billiam Handy',
        spaceRole: TestData.softwareEngineer,
        notes: 'This is a note',
        tags: TestData.personTags,
        archiveDate: new Date(2000, 0, 1),
    };
    const viewingDate = new Date(2020, 0, 1);

    beforeEach(() => {
        modalContent = null;
        jest.clearAllMocks();
    });

    it('should render the assigned persons name', () => {
        renderPersonCard(viewingDate);
        expect(screen.getByText('Billiam Handy')).toBeInTheDocument();
    });

    it('should render the assigned persons role if they have one', () => {
        renderPersonCard(viewingDate);
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should make the call to open the Edit Person modal when person name is clicked', async () => {
        renderPersonCard(viewingDate);
        const william = screen.getByText(personToRender.name);
        expect(william).toBeEnabled();

        fireEvent.click(william);

        expect(modalContent).toEqual({
            title: 'Edit Person',
            component: (
                <PersonForm isEditPersonForm personEdited={personToRender} />
            ),
        });
    });

    it('should not show any icons (note, tag)', () => {
        renderPersonCard(viewingDate);
        expect(screen.queryByText('note')).toBeNull();
        expect(screen.queryByText('local_offer')).toBeNull();
    });

    it('should not have the hover box on mouseover', async () => {
        renderPersonCard(viewingDate);
        fireEvent.mouseEnter(await screen.getByText(personToRender.name));
        expect(await screen.queryByText('note')).toBeNull();
        expect(screen.queryByText('local_offer')).toBeNull();
    });

    describe('Read-Only Functionality', function () {
        it('should not display Edit Person Modal if in read only mode', function () {
            renderPersonCard(new Date(), true);
            const william = screen.getByText(personToRender.name);
            fireEvent.click(william);
        });
    });

    function renderPersonCard(
        initialViewingDate: Date = new Date(),
        isReadOnly = false
    ): void {
        renderWithRecoil(
            <>
                <RecoilObserver
                    recoilState={ModalContentsState}
                    onChange={(value: ModalContents) => {
                        modalContent = value;
                    }}
                />
                <PersonCard person={personToRender} />
            </>,
            ({ set }) => {
                set(ViewingDateState, initialViewingDate);
                set(IsReadOnlyState, isReadOnly);
            }
        );
    }
});
