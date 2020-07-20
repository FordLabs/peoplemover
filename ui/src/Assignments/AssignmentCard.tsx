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

import React, {RefObject, useEffect, useState} from 'react';
import EditMenu, {EditMenuOption} from '../ReusableComponents/EditMenu';

import NewBadge from '../ReusableComponents/NewBadge';
import {connect} from 'react-redux';
import {AvailableModals, fetchProductsAction, setCurrentModalAction} from '../Redux/Actions';
import AssignmentClient from './AssignmentClient';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';

import '../Application/Styleguide/Styleguide.scss';
import './AssignmentCard.scss';
import {Assignment} from './Assignment';
import {ThemeApplier} from '../ReusableComponents/ThemeApplier';
import {CreateAssignmentsRequest, ProductPlaceholderPair} from './CreateAssignmentRequest';
import moment from "moment";
import HoverBox from "../ReusableComponents/HoverBox";

interface AssignmentCardProps {
    viewingDate: Date;
    assignment: Assignment;
    container?: string;
    isUnassignedProduct: boolean;

    startDraggingAssignment?(ref: RefObject<HTMLDivElement>, assignment: Assignment, e: React.MouseEvent): void;

    setCurrentModal?(modalState: CurrentModalState): void;

    fetchProducts?(): void;
}

function AssignmentCard({
    viewingDate,
    assignment = {id: 0} as Assignment,
    container,
    isUnassignedProduct,
    startDraggingAssignment,
    setCurrentModal,
    fetchProducts,
}: AssignmentCardProps): JSX.Element {

    const [editMenuIsOpened, setEditMenuIsOpened] = useState<boolean>(false);
    const assignmentRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);
    const assignmentEditRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);
    const [hoverBoxIsOpened, setHoverBoxIsOpened] = useState<boolean>(false);


    function onEditMenuClosed(): void {
        setEditMenuIsOpened(false);
    }

    function toggleEditMenu(): void {
        if (!isUnassignedProduct) {
            if (editMenuIsOpened) {
                setEditMenuIsOpened(false);
            } else {
                setEditMenuIsOpened(true);
            }
        } else {
            const newModalState: CurrentModalState = {
                modal: AvailableModals.EDIT_PERSON,
                item: assignment,
            };
            setCurrentModal!!(newModalState);
        }
    }

    function editPersonAndCloseEditMenu(): void {
        toggleEditMenu();
        const newModalState: CurrentModalState = {
            modal: AvailableModals.EDIT_PERSON,
            item: assignment,
        };
        setCurrentModal!!(newModalState);
    }

    async function markAsPlaceholderAndCloseEditMenu(): Promise<void> {
        const assignments: Array<Assignment> = (await AssignmentClient.getAssignmentsUsingPersonIdAndDate(assignment.person.id, viewingDate)).data;

        const assignmentIndex: number = assignments.findIndex(fetchedAssignment => (fetchedAssignment.productId === assignment.productId));
        assignments[assignmentIndex].placeholder = !assignment.placeholder;

        const productPlaceholderPairs: Array<ProductPlaceholderPair> = assignments.map(fetchedAssignment => ({
            productId: fetchedAssignment.productId,
            placeholder: fetchedAssignment.placeholder,
        } as ProductPlaceholderPair));

        const assignmentToUpdate: CreateAssignmentsRequest = {
            requestedDate: moment(viewingDate).format('YYYY-MM-DD'),
            person: assignment.person,
            products: productPlaceholderPairs,
        };

        toggleEditMenu();

        AssignmentClient.createAssignmentForDate(assignmentToUpdate).then(fetchProducts);
    }

    async function cancelAssignmentAndCloseEditMenu(): Promise<void> {
        const assignments: Array<Assignment> = (await AssignmentClient.getAssignmentsUsingPersonIdAndDate(assignment.person.id, viewingDate)).data;

        const productPlaceholderPairs: Array<ProductPlaceholderPair> = assignments
            .filter(fetchedAssignment => fetchedAssignment.id !== assignment.id)
            .map(fetchedAssignment => ({
                productId: fetchedAssignment.productId,
                placeholder: fetchedAssignment.placeholder,
            } as ProductPlaceholderPair));

        const assignmentToUpdate: CreateAssignmentsRequest = {
            requestedDate: moment(viewingDate).format('YYYY-MM-DD'),
            person: assignment.person,
            products: productPlaceholderPairs,
        };

        toggleEditMenu();
        AssignmentClient.createAssignmentForDate(assignmentToUpdate).then(fetchProducts);
    }

    function getMenuOptionList(): Array<EditMenuOption> {
        return [
            {
                callback: editPersonAndCloseEditMenu,
                text: 'Edit Person',
                icon: 'fa-user-circle',
            },
            {
                callback: markAsPlaceholderAndCloseEditMenu,
                text: assignment.placeholder ? 'Unmark as Placeholder' : 'Mark as Placeholder',
                icon: 'fa-pen',
            },
            {
                callback: cancelAssignmentAndCloseEditMenu,
                text: 'Cancel Assignment',
                icon: 'fa-trash',
            }];
    }

    useEffect(() => {
        let color: string | undefined;
        if (assignment.person.spaceRole && assignment.person.spaceRole.color) {
            color = assignment.person.spaceRole.color.color;
        }

        ThemeApplier.setBackgroundColorOnElement(assignmentEditRef.current!, color);
        if (assignment.placeholder) {
            ThemeApplier.setBorderColorOnElement(assignmentRef.current!, color);
        }
    }, [assignment]);


    return (
        <div
            className={`personContainer ${container === 'productDrawerContainer' ? 'borderedPeople' : ''} ${assignment.placeholder ? 'Placeholder' : 'NotPlaceholder'}`}
            data-testid={`assignmentCard${assignment.id}`}
            ref={assignmentRef}
            onMouseDown={e => startDraggingAssignment!!(assignmentRef, assignment, e)}
        >
            {assignment.person.newPerson ? <NewBadge/> : null}
            <div data-testid={`assignmentCard${assignment.id}info`}
                className="personNameAndRoleContainer">
                <div className={`${assignment.person.name === 'Chris Boyer' ? 'chrisBoyer' : ''} personName`}
                    onMouseEnter={e => setHoverBoxIsOpened(true)}
                    onMouseLeave={e => setHoverBoxIsOpened(false)}>
                    {assignment.person.name}
                    {assignment.person.notes !== '' &&
                        <div className="fas fa-file notesIcon">
                            {hoverBoxIsOpened && <HoverBox notes={assignment.person.notes!}/>}
                        </div>
                    }
                </div>
                <div className="personRole">
                    {assignment.person.spaceRole && assignment.person.spaceRole.name}
                </div>
            </div>
            <div
                ref={assignmentEditRef}
                className={`personRoleColor`}
                data-testid={`editPersonIconContainer-${assignment.id}`}
                onClick={toggleEditMenu}>
                <div className="fas fa-ellipsis-v personEditIcon greyIcon"/>
            </div>
            {
                editMenuIsOpened &&
                <EditMenu
                    menuOptionList={getMenuOptionList()}
                    onClosed={onEditMenuClosed}
                />
            }
        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    whichEditMenuOpen: state.whichEditMenuOpen,
    viewingDate: state.viewingDate,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    fetchProducts: () => dispatch(fetchProductsAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentCard);
