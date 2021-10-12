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

import {act, fireEvent, RenderResult} from '@testing-library/react';
import React from 'react';
import AssignmentCard from './AssignmentCard';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import {Assignment} from './Assignment';
import {Color, RoleTag} from '../Roles/RoleTag.interface';
import rootReducer from '../Redux/Reducers';
import {createStore, Store} from 'redux';
import PeopleClient from '../People/PeopleClient';
import {AxiosResponse} from 'axios';

jest.useFakeTimers();

describe('Assignment Card', () => {
    let assignmentToRender: Assignment;
    let store: Store;

    beforeEach(() => {
        assignmentToRender =  {
            id: 1,
            person: {
                newPerson: false,
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                id: 1,
                name: 'Billiam Handy',
                spaceRole: TestUtils.softwareEngineer,
                notes: 'This is a note',
                tags: TestUtils.personTags,
            },
            placeholder: false,
            productId: 0,
            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        };

        store = createStore(rootReducer, {currentSpace: TestUtils.space});
    });

    it('should render the assigned persons name', () => {
        const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
            isUnassignedProduct={false}/>, store,);
        expect(underTest.getByText('Billiam Handy')).toBeInTheDocument();
    });

    it('should render the assigned persons role if they have one', () => {
        const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
            isUnassignedProduct={false}/>, store);
        expect(underTest.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should show unmark placeholder when assignment is a placeholder', () => {
        const placeholderAssignment = {
            ...assignmentToRender,
            placeholder: true,
        };
        const underTest = renderWithRedux(<AssignmentCard
            assignment={placeholderAssignment}
            isUnassignedProduct={false}/>, store);

        fireEvent.click(underTest.getByTestId('editPersonIconContainer__billiam_handy'));
        expect(underTest.getByText('Unmark as Placeholder')).toBeInTheDocument();
    });

    describe('Read-Only Functionality', function() {

        beforeEach(function() {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: true});
        });

        it('should not display edit Menu if in read only mode', function() {

            const underTest = renderWithRedux(
                <AssignmentCard assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);

            let editPersonButton = underTest.getByTestId('editPersonIconContainer__billiam_handy');
            editPersonButton.click();
            expect(underTest.queryByTestId('editMenu')).toBeNull();
            expect(editPersonButton.childElementCount).toEqual(0);
        });

        it('should not allow drag and drop if in read only mode', function() {
            const startDraggingAssignment = jest.fn();

            const underTest = renderWithRedux(
                <AssignmentCard assignment={assignmentToRender}
                    isUnassignedProduct={false}
                    startDraggingAssignment={startDraggingAssignment}/>, store);

            fireEvent.mouseDown(underTest.getByTestId('assignmentCard__billiam_handy'));
            expect(startDraggingAssignment).not.toBeCalled();
        });

        it('should not show placeholder style in readonly', () => {
            const placeholderAssignment = {
                ...assignmentToRender,
                placeholder: true,
            };
            const underTest = renderWithRedux(<AssignmentCard
                assignment={placeholderAssignment}
                isUnassignedProduct={false}/>, store);

            const assignmentCard = underTest.getByTestId('assignmentCard__billiam_handy');
            expect(assignmentCard).toHaveClass('NotPlaceholder');
            expect(assignmentCard).not.toHaveClass('Placeholder');
        });

    });

    const expectEditMenuContents = (shown: boolean, elementUnderTest: RenderResult): void => {
        if (shown) {
            expect(elementUnderTest.getByText('Edit Person')).toBeInTheDocument();
            expect(elementUnderTest.getByText('Mark as Placeholder')).toBeInTheDocument();
            expect(elementUnderTest.getByText('Archive Person')).toBeInTheDocument();
            expect(elementUnderTest.getByText('Cancel Assignment')).toBeInTheDocument();
        } else {
            expect(elementUnderTest.queryByText('Edit Person')).not.toBeInTheDocument();
            expect(elementUnderTest.queryByText('Mark as Placeholder')).not.toBeInTheDocument();
            expect(elementUnderTest.queryByText('Archive Person')).not.toBeInTheDocument();
            expect(elementUnderTest.queryByText('Edit Assignment')).not.toBeInTheDocument();
        }
    };

    describe('Role color', () => {

        beforeEach(() => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space});
        });

        it('should render software engineer color correctly', () => {
            const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
                isUnassignedProduct={false}/>, store);
            const assignmentCardEditContainer: HTMLElement = underTest.getByTestId('editPersonIconContainer__billiam_handy');
            const person1Role: RoleTag = (TestUtils.people[0].spaceRole as RoleTag);
            const person1RoleColor: Color = (person1Role.color as Color);
            expect(assignmentCardEditContainer).toHaveStyle(`background-color: ${person1RoleColor.color}`);
        });

        it('should show base color if no color for role', () => {
            const otherBilliam: Assignment = {
                ...assignmentToRender,
                person: {
                    ...assignmentToRender.person,
                    spaceRole: {id: 1, spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Software Engineer'},
                },
            };

            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={otherBilliam}
                    isUnassignedProduct={false}/>, store);
            const assignmentCardEditContainer: HTMLElement = underTest.getByTestId('editPersonIconContainer__billiam_handy');
            expect(assignmentCardEditContainer).toHaveStyle('background-color: transparent');
        });

        it('should close the EditMenu when you click the colorful div w/ triple dots if it was open when you clicked', () => {
            const underTest = renderWithRedux(<AssignmentCard
                assignment={assignmentToRender}
                isUnassignedProduct={false}
            />, store);

            fireEvent.click(underTest.getByTestId('editPersonIconContainer__billiam_handy'));
            expectEditMenuContents(true, underTest);

            fireEvent.click(underTest.getByTestId('editPersonIconContainer__billiam_handy'));
            expectEditMenuContents(false, underTest);
        });

        it('should close edit menu when clicking any edit menu option', () => {
            const underTest = renderWithRedux(<AssignmentCard
                assignment={assignmentToRender}
                isUnassignedProduct={false}
            />, store);

            fireEvent.click(underTest.getByTestId('editPersonIconContainer__billiam_handy'));

            fireEvent.click(underTest.getByText('Edit Person'));

            expectEditMenuContents(false, underTest);
        });
    });

    describe('Edit Menu', () => {
        beforeEach(() => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space});
        });

        it('should begin life with the EditMenu closed', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expectEditMenuContents(false, underTest);
        });

        it('should open the EditMenu when you click the colorful div w/ triple dots', () => {
            const underTest = renderWithRedux(<AssignmentCard
                assignment={assignmentToRender}
                isUnassignedProduct={false}
            />, store);
            fireEvent.click(underTest.getByTestId('editPersonIconContainer__billiam_handy'));
            expectEditMenuContents(true, underTest);
        });

        it('should use the PersonClient to update the assigned person to an archive date of today when Archive Person is clicked', () => {
            PeopleClient.archivePerson = jest.fn(() => Promise.resolve({data: {}} as AxiosResponse));
            const underTest = renderWithRedux(<AssignmentCard
                assignment={assignmentToRender}
                isUnassignedProduct={false}
            />, store);
            fireEvent.click(underTest.getByTestId('editPersonIconContainer__billiam_handy'));
            expectEditMenuContents(true, underTest);
            fireEvent.click(underTest.getByText('Archive Person'));
            expect(PeopleClient.archivePerson).toHaveBeenCalledWith(TestUtils.space, assignmentToRender.person);
        });

    });

    describe('New Person Badge', () => {

        beforeEach(() => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space});
        });

        it('should show the new badge if the assignment says the person is new and there is a newPersonDate', () => {
            const assignmentThatIsNew: Assignment = {
                id: 199,
                person: {
                    spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                    id: 1,
                    name: 'Mary Pettigrew',
                    spaceRole: {id: 3, spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Product Designer', color: {color: '1', id: 2}},
                    newPerson: true,
                    newPersonDate: new Date('2021-01-01'),
                    tags: [],
                },
                placeholder: false,
                productId: 0,
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            };
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentThatIsNew}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.getByText('NEW')).toBeInTheDocument();
        });

        it('should not show any new badge if the assignment says the person is not new', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.queryByText('NEW')).not.toBeInTheDocument();
        });
    });

    describe('Hoverable Notes', () => {

        beforeEach(() => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isDragging: false});
        });

        it('should display hover notes icon if person has valid notes', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.getByText('note')).toBeInTheDocument();
        });

        it('should not display hover notes icon if person has valid notes, but user is readOnly', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.queryByTestId('notesIcon')).toBeNull();
        });

        it('should not display hover notes icon if person has no notes', () => {
            delete assignmentToRender.person.notes;

            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.queryByTestId('notesIcon')).toBeNull();
        });

        it('should display hover notes when hovered over', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.queryByText('This is a note')).toBeNull();

            act(() => {
                fireEvent.mouseEnter(underTest.getByText('note'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.getByText('This is a note')).toBeVisible();
        });

        it('should not show hover box when assignment card is unassigned', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={true}/>, store);
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
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.queryByText('This is a note')).toBeNull();
            expect(underTest.getByText('note')).toBeInTheDocument();

            act(() => {
                fireEvent.mouseEnter(underTest.getByText('note'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.queryByText('This is a note')).toBeNull();
        });
    });

    describe('Hoverable Person tag', () => {
        beforeEach(() => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isDragging: false});
        });

        it('should display person tag Icon if person has valid notes', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.getByText('local_offer')).toBeInTheDocument();
        });

        it('should not display person tag Icon if person has valid person tags, but user is readOnly', () => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space, isDragging: false, isReadOnly: true});
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.queryByText('local_offer')).toBeNull();
        });

        it('should not display person tag Icon if person has no person tags', () => {
            delete assignmentToRender.person.tags;

            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>, store);
            expect(underTest.queryByText('local_offer')).toBeNull();
        });

        it('should hide hover box for assignment when an assignment is being dragged', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={true}/>, store);
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
