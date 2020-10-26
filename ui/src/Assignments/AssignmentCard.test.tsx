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

import {act, fireEvent} from '@testing-library/react';
import React from 'react';
import AssignmentCard from './AssignmentCard';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import {Assignment} from './Assignment';
import {ThemeApplier} from '../ReusableComponents/ThemeApplier';
import {Color, SpaceRole} from '../Roles/Role.interface';

jest.useFakeTimers();

describe('Assignment Card', () => {
    let assignmentToRender: Assignment;

    beforeEach(() => {
        assignmentToRender =  {
            id: 1,
            person: {
                newPerson: false,
                spaceId: 0,
                id: 1,
                name: 'Billiam Handy',
                spaceRole: {id: 1, spaceId: 0, name: 'Software Engineer', color: {id: 1, color: '#44'}},
                notes: 'This is a note',
            },
            placeholder: false,
            productId: 0,
            spaceId: 1,
        };
    });

    it('should render the assigned persons name', () => {
        const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
            isUnassignedProduct={false}/>);
        expect(underTest.getByText('Billiam Handy')).toBeInTheDocument();
    });

    it('should render the assigned persons role if they have one', () => {
        const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
            isUnassignedProduct={false}/>);
        expect(underTest.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should show unmark placeholder when assignment is a placeholder', () => {
        const placeholderAssignment = {
            ...assignmentToRender,
            placeholder: true,
        };
        const {getByText, getByTestId} = renderWithRedux(<AssignmentCard
            assignment={placeholderAssignment}
            isUnassignedProduct={false}/>);

        fireEvent.click(getByTestId('editPersonIconContainer__billiam_handy'));
        expect(getByText('Unmark as Placeholder')).toBeInTheDocument();
    });

    describe('Role color', () => {
        const originalImpl = ThemeApplier.setBackgroundColorOnElement;

        beforeEach(() => {
            ThemeApplier.setBackgroundColorOnElement = jest.fn().mockImplementation();
        });

        afterEach(() => {
            ThemeApplier.setBackgroundColorOnElement = originalImpl;
        });

        it('should render software engineer color correctly', () => {
            const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
                isUnassignedProduct={false}/>);
            const assignmentCardEditContainer: HTMLElement = underTest.getByTestId('editPersonIconContainer__billiam_handy');
            const person1Role: SpaceRole = (TestUtils.people[0].spaceRole as SpaceRole);
            const person1RoleColor: Color = (person1Role.color as Color);
            expect(ThemeApplier.setBackgroundColorOnElement).toHaveBeenCalledWith(
                assignmentCardEditContainer,
                person1RoleColor.color
            );
        });

        it('should show base color if no color for role', () => {
            const otherBilliam: Assignment = {
                ...assignmentToRender,
                person: {
                    ...assignmentToRender.person,
                    spaceRole: {id: 1, spaceId: 0, name: 'Software Engineer'},
                },
            };

            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={otherBilliam}
                    isUnassignedProduct={false}/>
            );
            const assignmentCardEditContainer: HTMLElement = underTest.getByTestId('editPersonIconContainer__billiam_handy');
            expect(ThemeApplier.setBackgroundColorOnElement).toHaveBeenCalledWith(
                assignmentCardEditContainer,
                undefined
            );
        });

        it('should close the EditMenu when you click the colorful div w/ triple dots if it was open when you clicked', () => {
            const {getByText, getByTestId, queryByText} = renderWithRedux(<AssignmentCard
                assignment={assignmentToRender}
                isUnassignedProduct={false}
            />);

            fireEvent.click(getByTestId('editPersonIconContainer__billiam_handy'));
            expect(getByText('Edit Person')).toBeInTheDocument();
            expect(getByText('Mark as Placeholder')).toBeInTheDocument();
            expect(getByText('Cancel Assignment')).toBeInTheDocument();

            fireEvent.click(getByTestId('editPersonIconContainer__billiam_handy'));
            expect(queryByText('Edit Person')).not.toBeInTheDocument();
            expect(queryByText('Mark as Placeholder')).not.toBeInTheDocument();
            expect(queryByText('Edit Assignment')).not.toBeInTheDocument();
        });

        it('should close edit menu when clicking any edit menu option', () => {
            const {queryByText, getByText, getByTestId} = renderWithRedux(<AssignmentCard
                assignment={assignmentToRender}
                isUnassignedProduct={false}
            />);

            fireEvent.click(getByTestId('editPersonIconContainer__billiam_handy'));

            fireEvent.mouseDown(getByText('Edit Person'));

            expect(queryByText('Edit Person')).not.toBeInTheDocument();
        });
    });

    describe('Edit Menu', () => {
        it('should begin life with the EditMenu closed', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>
            );
            expect(underTest.queryByText('Edit Person')).not.toBeInTheDocument();
            expect(underTest.queryByText('Edit Assignment')).not.toBeInTheDocument();
        });

        it('should open the EditMenu when you click the colorful div w/ triple dots', () => {
            const {getByText, getByTestId} = renderWithRedux(<AssignmentCard
                assignment={assignmentToRender}
                isUnassignedProduct={false}
            />);
            fireEvent.click(getByTestId('editPersonIconContainer__billiam_handy'));
            expect(getByText('Edit Person')).toBeInTheDocument();
            expect(getByText('Mark as Placeholder')).toBeInTheDocument();
            expect(getByText('Cancel Assignment')).toBeInTheDocument();
        });
    });

    describe('New Person Badge', () => {
        it('should show the new badge if the assignment says the person is new', () => {
            const assignmentThatIsNew: Assignment = {
                id: 199,
                person: {
                    spaceId: 0,
                    id: 1,
                    name: 'Mary Pettigrew',
                    spaceRole: {id: 3, spaceId: 0, name: 'Product Designer', color: {color: '1', id: 2}},
                    newPerson: true,
                },
                placeholder: false,
                productId: 0,
                spaceId: 1,
            };
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentThatIsNew}
                    isUnassignedProduct={false}/>
            );
            expect(underTest.getByText('NEW')).toBeInTheDocument();
        });

        it('should not show any new badge if the assignment says the person is not new', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>
            );
            expect(underTest.queryByText('NEW')).not.toBeInTheDocument();
        });
    });

    describe('Hoverable Notes', () => {
        it('should display hover notes icon if person has valid notes', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>
            );
            expect(underTest.getByTestId('notesIcon')).toBeInTheDocument();
        });

        it('should not display hover notes icon if person has no notes', () => {
            delete assignmentToRender.person.notes;

            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>
            );
            expect(underTest.queryByTestId('notesIcon')).toBeNull();
        });

        it('should display hover notes when hovered over', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>
            );

            expect(underTest.queryByTestId('hoverBoxContainer')).toBeNull();

            act(() => {
                fireEvent.mouseEnter(underTest.getByTestId('personName'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.getByTestId('hoverBoxContainer')).toBeInTheDocument();
            expect(underTest.getByText('This is a note')).toBeVisible();
        });

        it('should hide notes when user hovers away', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}/>
            );

            expect(underTest.queryByTestId('hoverBoxContainer')).toBeNull();

            act(() => {
                fireEvent.mouseEnter(underTest.getByTestId('personName'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.getByTestId('hoverBoxContainer')).toBeInTheDocument();
            expect(underTest.getByText('This is a note')).toBeVisible();

            act(() => {
                fireEvent.mouseLeave(underTest.getByTestId('personName'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.queryByTestId('hoverBoxContainer')).toBeNull();
        });

        it('should not show hover box when assignment card is unassigned', () => {
            const underTest = renderWithRedux(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={true}/>
            );

            expect(underTest.queryByTestId('hoverBoxContainer')).toBeNull();
            expect(underTest.getByTestId('notesIcon')).toBeInTheDocument();

            act(() => {
                fireEvent.mouseEnter(underTest.getByTestId('personName'));
                jest.advanceTimersByTime(500);
            });

            expect(underTest.queryByTestId('hoverBoxContainer')).toBeNull();
        });
    });
});
