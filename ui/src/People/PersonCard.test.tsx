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

import {act, fireEvent} from '@testing-library/react';
import React from 'react';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import rootReducer from '../Redux/Reducers';
import {createStore, Store} from 'redux';
import PersonCard from "./PersonCard";
import {Person} from "./Person";

describe('Person Card', () => {
    let personToRender: Person;
    let store: Store;

    beforeEach(() => {
        personToRender = {
            newPerson: false,
            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            id: 1,
            name: 'Billiam Handy',
            spaceRole: TestUtils.softwareEngineer,
            notes: 'This is a note',
            tags: TestUtils.personTags,
        };

        store = createStore(rootReducer, {currentSpace: TestUtils.space});
    });

    it('should render the assigned persons name', () => {
        const underTest = renderWithRedux(<PersonCard person={personToRender}/>, store,);
        expect(underTest.getByText('Billiam Handy')).toBeInTheDocument();
    });

    xit('should render the assigned persons role if they have one', () => {
        const underTest = renderWithRedux(<PersonCard person={personToRender}/>, store);
        expect(underTest.getByText('Software Engineer')).toBeInTheDocument();
    });

    xdescribe('Read-Only Functionality', function () {

        beforeEach(function () {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: true});
        });

        it('should not display edit Menu if in read only mode', function () {

            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);

            let editPersonButton = underTest.getByTestId('editPersonIconContainer__billiam_handy');
            editPersonButton.click();
            expect(underTest.queryByTestId('editMenu')).toBeNull();
            expect(editPersonButton.childElementCount).toEqual(0);
        });

    });

    xdescribe('Hoverable Notes', () => {

        beforeEach(() => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isDragging: false});
        });

        it('should display hover notes icon if person has valid notes', () => {
            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.getByText('note')).toBeInTheDocument();
        });

        it('should not display hover notes icon if person has valid notes, but user is readOnly', () => {
            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.queryByTestId('notesIcon')).toBeNull();
        });

        it('should not display hover notes icon if person has no notes', () => {
            delete personToRender.notes;

            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.queryByTestId('notesIcon')).toBeNull();
        });

        it('should display hover notes when hovered over', () => {
            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.queryByText('This is a note')).toBeNull();

            act(() => {
                fireEvent.mouseEnter(underTest.getByText('note'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.getByText('This is a note')).toBeVisible();
        });

        it('should not show hover box when assignment card is unassigned', () => {
            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.queryByText('This is a note')).toBeNull();
            expect(underTest.getByText('note')).toBeInTheDocument();

            act(() => {
                fireEvent.mouseEnter(underTest.getByText('note'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.queryByText('This is a note')).toBeNull();
        });

        it('should hide hover box for assignment when an assignment is being dragged', () => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isDragging: true});
            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.queryByText('This is a note')).toBeNull();
            expect(underTest.getByText('note')).toBeInTheDocument();

            act(() => {
                fireEvent.mouseEnter(underTest.getByText('note'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.queryByText('This is a note')).toBeNull();
        });
    });

    xdescribe('Hoverable Person tag', () => {
        beforeEach(() => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isDragging: false});
        });

        it('should display person tag Icon if person has valid notes', () => {
            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.getByText('local_offer')).toBeInTheDocument();
        });

        it('should not display person tag Icon if person has valid person tags, but user is readOnly', () => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isDragging: false, isReadOnly: true});
            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.queryByText('local_offer')).toBeNull();
        });

        it('should not display person tag Icon if person has no person tags', () => {
            delete personToRender.tags;

            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.queryByText('local_offer')).toBeNull();
        });

        it('should hide hover box for assignment when an assignment is being dragged', () => {
            const underTest = renderWithRedux(
                <PersonCard person={personToRender}/>, store);
            expect(underTest.queryByText('The lil boss,The big boss')).toBeNull();
            expect(underTest.getByText('local_offer')).toBeInTheDocument();

            act(() => {
                fireEvent.mouseEnter(underTest.getByText('local_offer'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.queryByText('The lil boss,The big boss')).toBeNull();
        });
    });
});
