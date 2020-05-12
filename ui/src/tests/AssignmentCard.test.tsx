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

import {fireEvent} from '@testing-library/react';
import React from 'react';
import AssignmentCard from '../Assignments/AssignmentCard';
import TestUtils, {renderWithRedux} from './TestUtils';
import {Assignment} from '../Assignments/Assignment';
import {ThemeApplier} from '../ReusableComponents/ThemeApplier';
import {Color, SpaceRole} from '../Roles/Role';

describe('the assignment card', () => {

    const assignmentToRender: Assignment = {
        id: 1,
        person: {
            newPerson: false,
            spaceId: 0,
            id: 1,
            name: "Billiam O'Handy",
            spaceRole: {id: 1, spaceId: 0, name: 'Software Engineer', color: {id: 1, color: '1'}},
        },
        placeholder: false,
        productId: 0,
    };

    it('should render the assigned persons name', () => {
        const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
            isUnassignedProduct={false}/>);
        expect(underTest.getByText("Billiam O'Handy")).toBeInTheDocument();
    });

    it('should render the assigned persons role if they have one', () => {
        const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
            isUnassignedProduct={false}/>);
        expect(underTest.getByText('Software Engineer')).toBeInTheDocument();
    });

    describe('should render the appropriate role color', () => {

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
            const assignmentCardEditContainer: HTMLElement = underTest.getByTestId('editPersonIconContainer-1');
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

            const underTest = renderWithRedux(<AssignmentCard assignment={otherBilliam}
                isUnassignedProduct={false}/>);
            const assignmentCardEditContainer: HTMLElement = underTest.getByTestId('editPersonIconContainer-1');
            expect(ThemeApplier.setBackgroundColorOnElement).toHaveBeenCalledWith(
                assignmentCardEditContainer,
                undefined
            );
        });

    });

    it('should begin life with the EditMenu closed', () => {
        const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
            isUnassignedProduct={false}/>);
        expect(underTest.queryByText('Edit Person')).not.toBeInTheDocument();
        expect(underTest.queryByText('Edit Assignment')).not.toBeInTheDocument();
    });

    it('should open the EditMenu when you click the colorful div w/ triple dots', () => {

        const {getByText, getByTestId} = renderWithRedux(<AssignmentCard
            assignment={assignmentToRender}
            isUnassignedProduct={false}
        />);
        fireEvent.click(getByTestId('editPersonIconContainer-1'));
        expect(getByText('Edit Person')).toBeInTheDocument();
        expect(getByText('Mark as Placeholder')).toBeInTheDocument();
        expect(getByText('Cancel Assignment')).toBeInTheDocument();
    });

    it('should show unmark placeholder when assignment is a placeholder', () => {

        const placeholderAssignment = {
            ...assignmentToRender,
            placeholder: true,
        };
        const {getByText, getByTestId} = renderWithRedux(<AssignmentCard
            assignment={placeholderAssignment}
            isUnassignedProduct={false}/>);

        fireEvent.click(getByTestId('editPersonIconContainer-1'));
        expect(getByText('Unmark as Placeholder')).toBeInTheDocument();
    });

    it('should close the EditMenu when you click the colorful div w/ triple dots if it was open when you clicked', () => {
        const {getByText, getByTestId, queryByText} = renderWithRedux(<AssignmentCard
            assignment={assignmentToRender}
            isUnassignedProduct={false}
        />);

        fireEvent.click(getByTestId('editPersonIconContainer-1'));
        expect(getByText('Edit Person')).toBeInTheDocument();
        expect(getByText('Mark as Placeholder')).toBeInTheDocument();
        expect(getByText('Cancel Assignment')).toBeInTheDocument();

        fireEvent.click(getByTestId('editPersonIconContainer-1'));
        expect(queryByText('Edit Person')).not.toBeInTheDocument();
        expect(queryByText('Mark as Placeholder')).not.toBeInTheDocument();
        expect(queryByText('Edit Assignment')).not.toBeInTheDocument();
    });

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
        };
        const underTest = renderWithRedux(<AssignmentCard assignment={assignmentThatIsNew}
            isUnassignedProduct={false}/>);
        expect(underTest.getByText('NEW')).toBeInTheDocument();
    });

    it('should not show any new badge if the assignment says the person is not new', () => {
        const underTest = renderWithRedux(<AssignmentCard assignment={assignmentToRender}
            isUnassignedProduct={false}/>);
        expect(underTest.queryByText('NEW')).not.toBeInTheDocument();
    });

    it('should close edit menu when clicking any edit menu option', () => {
        const {queryByText, getByText, getByTestId} = renderWithRedux(<AssignmentCard
            assignment={assignmentToRender}
            isUnassignedProduct={false}
        />);

        fireEvent.click(getByTestId('editPersonIconContainer-1'));

        fireEvent.mouseDown(getByText('Edit Person'));

        expect(queryByText('Edit Person')).not.toBeInTheDocument();
    });
});