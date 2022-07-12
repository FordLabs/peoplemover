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

import {fireEvent, screen, waitFor} from '@testing-library/react';
import React from 'react';
import AssignmentCard from './AssignmentCard';
import {renderWithRecoil} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import {Assignment} from './Assignment';
import {Color, RoleTag} from '../Roles/RoleTag.interface';
import PeopleClient from '../People/PeopleClient';
import {ViewingDateState} from '../State/ViewingDateState';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import {IsDraggingState} from '../State/IsDraggingState';
import AssignmentClient from './AssignmentClient';
import moment from 'moment';
import ProductClient from '../Products/ProductClient';
import {CurrentSpaceState} from '../State/CurrentSpaceState';

jest.mock('../Products/ProductClient');
jest.mock('Assignments/AssignmentClient');

describe('Assignment Card', () => {
    let assignmentToRender: Assignment;

    beforeEach(() => {
        assignmentToRender =  {
            id: 6555,
            person: {
                newPerson: false,
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                id: 445,
                name: 'Billiam Handy',
                spaceRole: TestData.softwareEngineer,
                notes: 'This is a note',
                tags: TestData.personTags,
            },
            placeholder: false,
            productId: 1,
            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        };

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    })

    it('should render the assigned persons name', () => {
        renderAssignmentCard(assignmentToRender);
        expect(screen.getByText('Billiam Handy')).toBeInTheDocument();
    });

    it('should render the assigned persons role if they have one', () => {
        renderAssignmentCard(assignmentToRender);
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should mark person as placeholder', async () => {
        const placeholderAssignment = {
            ...assignmentToRender,
            placeholder: false,
        };
        renderAssignmentCard(placeholderAssignment);
        expect(screen.getByTestId('assignmentCard__billiam_handy')).not.toHaveClass('placeholder');

        fireEvent.click(screen.getByTestId('editPersonIconContainer__billiam_handy'));

        (await screen.getByText('Mark as Placeholder')).click();
        await waitFor(() => expect(AssignmentClient.getAssignmentsUsingPersonIdAndDate)
            .toHaveBeenCalledWith(assignmentToRender.spaceUuid, assignmentToRender.person.id, expect.any(Date))
        )
        await waitFor(() => expect(AssignmentClient.createAssignmentForDate)
            .toHaveBeenCalledWith(moment(new Date()).format('YYYY-MM-DD'), [{"placeholder": true, "productId": 1}], TestData.space, assignmentToRender.person, false)
        )
        await waitFor(() => expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(TestData.space.uuid, expect.any(Date)))
    });

    it('should unmark person as placeholder', async () => {
        const placeholderAssignment = {
            ...assignmentToRender,
            placeholder: true,
        };
        renderAssignmentCard(placeholderAssignment);
        expect(screen.getByTestId('assignmentCard__billiam_handy')).toHaveClass('placeholder');

        fireEvent.click(screen.getByTestId('editPersonIconContainer__billiam_handy'));
        (await screen.getByText('Unmark as Placeholder')).click();

        await waitFor(() => expect(AssignmentClient.getAssignmentsUsingPersonIdAndDate).toHaveBeenCalledWith(
            assignmentToRender.spaceUuid, assignmentToRender.person.id, expect.any(Date)
        ))
        await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(
            moment(new Date()).format('YYYY-MM-DD'), [{"placeholder": false, "productId": 1}], TestData.space, assignmentToRender.person, false
        ))
        await waitFor(() => expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(TestData.space.uuid, expect.any(Date)));
    });

    describe('Read-Only Functionality', function() {
        it('should not display edit Menu if in read only mode', function() {
            renderWithRecoil(
                <AssignmentCard assignment={assignmentToRender} />,
                ({set}) => {
                    set(IsReadOnlyState, true);
                    set(CurrentSpaceState, TestData.space)
                }
            );
            const editPersonButton = screen.getByTestId('editPersonIconContainer__billiam_handy');
            editPersonButton.click();
            expect(screen.queryByTestId('editMenu')).toBeNull();
            expect(editPersonButton.childElementCount).toEqual(0);
        });

        it('should not allow drag and drop if in read only mode', function() {
            const startDraggingAssignment = jest.fn();
            renderWithRecoil(
                <AssignmentCard
                    assignment={assignmentToRender}
                    isUnassignedProduct={false}
                    startDraggingAssignment={startDraggingAssignment}
                />,
                ({set}) => {
                    set(IsReadOnlyState, true);
                    set(CurrentSpaceState, TestData.space)
                }
            );

            fireEvent.mouseDown(screen.getByTestId('assignmentCard__billiam_handy'));
            expect(startDraggingAssignment).not.toBeCalled();
        });

        it('should not show placeholder style in readonly', () => {
            const placeholderAssignment = {
                ...assignmentToRender,
                placeholder: true,
            };
            renderWithRecoil(
                <AssignmentCard assignment={placeholderAssignment} />,
                ({set}) => {
                    set(IsReadOnlyState, true);
                    set(CurrentSpaceState, TestData.space)
                }
            );

            const assignmentCard = screen.getByTestId('assignmentCard__billiam_handy');
            expect(assignmentCard).toHaveClass('notPlaceholder');
            expect(assignmentCard).not.toHaveClass('placeholder');
        });

    });

    const expectEditMenuContents = (shown: boolean): void => {
        if (shown) {
            expect(screen.getByText('Edit Person')).toBeInTheDocument();
            expect(screen.getByText('Mark as Placeholder')).toBeInTheDocument();
            expect(screen.getByText('Archive Person')).toBeInTheDocument();
            expect(screen.getByText('Cancel Assignment')).toBeInTheDocument();
        } else {
            expect(screen.queryByText('Edit Person')).not.toBeInTheDocument();
            expect(screen.queryByText('Mark as Placeholder')).not.toBeInTheDocument();
            expect(screen.queryByText('Archive Person')).not.toBeInTheDocument();
            expect(screen.queryByText('Edit Assignment')).not.toBeInTheDocument();
        }
    };

    describe('Role color', () => {
        it('should render software engineer color correctly', () => {
            renderAssignmentCard(assignmentToRender);
            const assignmentCardEditContainer: HTMLElement = screen.getByTestId('editPersonIconContainer__billiam_handy');
            const person1Role: RoleTag = (TestData.people[0].spaceRole as RoleTag);
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
            renderAssignmentCard(otherBilliam);

            const assignmentCardEditContainer: HTMLElement = screen.getByTestId('editPersonIconContainer__billiam_handy');
            expect(assignmentCardEditContainer).toHaveStyle('background-color: transparent');
        });

        it('should close the EditMenu when you click the colorful div w/ triple dots if it was open when you clicked', () => {
            renderAssignmentCard(assignmentToRender);

            fireEvent.click(screen.getByTestId('editPersonIconContainer__billiam_handy'));
            expectEditMenuContents(true);

            fireEvent.click(screen.getByTestId('editPersonIconContainer__billiam_handy'));
            expectEditMenuContents(false);
        });

        it('should close edit menu when clicking any edit menu option', () => {
            renderAssignmentCard(assignmentToRender);

            fireEvent.click(screen.getByTestId('editPersonIconContainer__billiam_handy'));
            fireEvent.click(screen.getByText('Edit Person'));

            expectEditMenuContents(false);
        });
    });

    describe('Edit Menu', () => {
        it('should initialize with the Edit Menu closed', () => {
            renderWithRecoil(
                <AssignmentCard assignment={assignmentToRender}/>,
                ({set}) => {
                    set(ViewingDateState, new Date(2020, 0, 1))
                }
            );

            expectEditMenuContents(false);
        });

        it('should open the EditMenu when you click the colorful div w/ triple dots', () => {
            renderAssignmentCard(assignmentToRender);
            fireEvent.click(screen.getByTestId('editPersonIconContainer__billiam_handy'));
            expectEditMenuContents(true);
        });

        it('should show a confirmation modal when Archive Person is clicked, and be able to close it', async () => {
            renderAssignmentCard(assignmentToRender);
            fireEvent.click(screen.getByTestId('editPersonIconContainer__billiam_handy'));
            expectEditMenuContents(true);
            fireEvent.click(screen.getByText('Archive Person'));
            expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
            fireEvent.click(screen.getByText('Cancel'));
            expect(await screen.queryByText('Are you sure?')).not.toBeInTheDocument();
        });

        it('should use the PersonClient to update the assigned person to archived as of the viewing date when Archive Person is clicked and the modal is confirmed', async () => {
            PeopleClient.archivePerson = jest.fn().mockResolvedValue({data: {}});
            const viewingDate = new Date(2020, 0, 1);

            renderWithRecoil(
                <AssignmentCard assignment={assignmentToRender} />,
                ({set}) => {
                    set(ViewingDateState, viewingDate)
                    set(CurrentSpaceState, TestData.space)
                }
            );

            fireEvent.click(screen.getByTestId('editPersonIconContainer__billiam_handy'));
            expectEditMenuContents(true);
            fireEvent.click(screen.getByText('Archive Person'));
            fireEvent.click(await screen.findByText('Archive'));
            await waitFor(() =>expect(PeopleClient.archivePerson).toHaveBeenCalledWith(TestData.space, assignmentToRender.person, new Date(2020, 0, 1)));
        });
    });

    describe('New Person Badge', () => {
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
            renderAssignmentCard(assignmentThatIsNew);

            expect(screen.getByText('NEW')).toBeInTheDocument();
        });

        it('should not show any new badge if the assignment says the person is not new', () => {
            renderAssignmentCard(assignmentToRender);
            expect(screen.queryByText('NEW')).not.toBeInTheDocument();
        });
    });

    describe('Hoverable Notes', () => {
        it('should display hover notes icon if person has valid notes', () => {
            renderAssignmentCard(assignmentToRender);
            expect(screen.getByText('note')).toBeInTheDocument();
        });

        it('should not display hover notes icon if person has valid notes, but user is readOnly', () => {
            renderAssignmentCard(assignmentToRender);
            expect(screen.queryByTestId('notesIcon')).toBeNull();
        });

        it('should not display hover notes icon if person has no notes', () => {
            delete assignmentToRender.person.notes;
            renderAssignmentCard(assignmentToRender);
            expect(screen.queryByTestId('notesIcon')).toBeNull();
        });

        it('should display hover notes when hovered over', () => {
            renderAssignmentCard(assignmentToRender);

            expect(screen.queryByText('This is a note')).toBeNull();

            fireEvent.mouseEnter(screen.getByText('note'));
            jest.advanceTimersByTime(500);

            expect(screen.getByText('This is a note')).toBeVisible();
        });

        it('should not show hover box when assignment card is unassigned', async () => {
            renderAssignmentCard(assignmentToRender,true);

            expect(screen.queryByText('This is a note')).toBeNull();
            expect(screen.getByText('note')).toBeInTheDocument();

            fireEvent.mouseEnter(screen.getByText('note'));
            jest.advanceTimersByTime(500);

            await waitFor(() =>expect(screen.queryByText('This is a note')).toBeNull());
        });

        it('should hide hover box for assignment when an assignment is being dragged', () => {
            renderWithRecoil(
                <AssignmentCard assignment={{...assignmentToRender}} />,
                ({set}) => {
                    set(IsDraggingState, true);
                    set(CurrentSpaceState, TestData.space)
                }
            )

            expect(screen.queryByText('This is a note')).toBeNull();
            expect(screen.getByText('note')).toBeInTheDocument();

            fireEvent.mouseEnter(screen.getByText('note'));
            jest.advanceTimersByTime(500);

            expect(screen.queryByText('This is a note')).toBeNull();
        });
    });

    describe('Hoverable Person tag', () => {
        it('should display person tag Icon if person has valid notes', () => {
            renderAssignmentCard(assignmentToRender);
            expect(screen.getByText('local_offer')).toBeInTheDocument();
        });

        it('should not display person tag Icon if person has valid person tags, but user is readOnly', () => {
            renderWithRecoil(
                <AssignmentCard assignment={{...assignmentToRender}} />,
                ({set}) => {
                    set(IsReadOnlyState, true);
                    set(CurrentSpaceState, TestData.space)
                }
            )
            expect(screen.queryByText('local_offer')).toBeNull();
        });

        it('should not display person tag Icon if person has no person tags', () => {
            assignmentToRender.person.tags = [];
            renderAssignmentCard(assignmentToRender);
            expect(screen.queryByText('local_offer')).toBeNull();
        });

        it('should hide hover box for assignment when an assignment is being dragged', () => {
            renderAssignmentCard(assignmentToRender);

            expect(screen.queryByText('The lil boss,The big boss')).toBeNull();
            expect(screen.getByText('local_offer')).toBeInTheDocument();

            fireEvent.mouseEnter(screen.getByText('local_offer'));
            jest.advanceTimersByTime(500);

            expect(screen.queryByText('The lil boss,The big boss')).toBeNull();
        });
    });

    function renderAssignmentCard(assignment: Assignment, isUnassignedProduct = false): void {
        renderWithRecoil(
            <AssignmentCard
                assignment={{...assignment}}
                isUnassignedProduct={isUnassignedProduct}
            />,
            ({set}) => {
                set(CurrentSpaceState, TestData.space)
            }
        )
    }
});
