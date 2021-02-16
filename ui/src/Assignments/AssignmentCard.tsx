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

import React, {RefObject, useState} from 'react';
import EditMenu, {EditMenuOption} from '../ReusableComponents/EditMenu';

import NewBadge from '../ReusableComponents/NewBadge';
import {connect} from 'react-redux';
import {AvailableModals, fetchProductsAction, setCurrentModalAction} from '../Redux/Actions';
import AssignmentClient from './AssignmentClient';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import '../Application/Styleguide/Main.scss';
import './AssignmentCard.scss';
import {Assignment} from './Assignment';
import {ProductPlaceholderPair} from './CreateAssignmentRequest';
import moment from 'moment';
import PersonAndRoleInfo from './PersonAndRoleInfo';
import {createDataTestId} from '../tests/TestUtils';
import {Space} from '../Space/Space';
import MatomoEvents from '../Matomo/MatomoEvents';

interface AssignmentCardProps {
    currentSpace: Space;
    viewingDate: Date;
    assignment: Assignment;
    container?: string;
    isUnassignedProduct: boolean;
    isReadOnly: boolean;

    startDraggingAssignment?(ref: RefObject<HTMLDivElement>, assignment: Assignment, e: React.MouseEvent): void;

    setCurrentModal(modalState: CurrentModalState): void;

    fetchProducts(): void;
}

function AssignmentCard({
    currentSpace,
    viewingDate,
    assignment = {id: 0} as Assignment,
    container,
    isUnassignedProduct,
    isReadOnly,
    startDraggingAssignment,
    setCurrentModal,
    fetchProducts,
}: AssignmentCardProps): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spaceUuid = currentSpace.uuid!;
    const [editMenuIsOpened, setEditMenuIsOpened] = useState<boolean>(false);
    const assignmentRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);

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
            setCurrentModal(newModalState);
        }
    }

    function editPersonAndCloseEditMenu(): void {
        toggleEditMenu();
        const newModalState: CurrentModalState = {
            modal: AvailableModals.EDIT_PERSON,
            item: assignment,
        };
        setCurrentModal(newModalState);
    }

    async function markAsPlaceholderAndCloseEditMenu(): Promise<void> {
        const assignments: Array<Assignment> = (await AssignmentClient.getAssignmentsUsingPersonIdAndDate(spaceUuid, assignment.person.id, viewingDate)).data;

        const assignmentIndex: number = assignments.findIndex(fetchedAssignment => (fetchedAssignment.productId === assignment.productId));
        const markedAsPlaceholder = !assignment.placeholder;
        assignments[assignmentIndex].placeholder = markedAsPlaceholder;

        const productPlaceholderPairs: Array<ProductPlaceholderPair> = assignments.map(fetchedAssignment => ({
            productId: fetchedAssignment.productId,
            placeholder: fetchedAssignment.placeholder,
        } as ProductPlaceholderPair));

        toggleEditMenu();

        AssignmentClient.createAssignmentForDate(
            moment(viewingDate).format('YYYY-MM-DD'),
            productPlaceholderPairs,
            currentSpace,
            assignment.person,
            false)
            .then(() => {
                if (markedAsPlaceholder) {
                    MatomoEvents.pushEvent(currentSpace.name, 'markAsPlaceholder', assignment.person.name);
                } else {
                    MatomoEvents.pushEvent(currentSpace.name, 'unmarkAsPlaceholder', assignment.person.name);
                }
                if (fetchProducts) {
                    fetchProducts();
                }
            }).catch((error) => {
                MatomoEvents.pushEvent(currentSpace.name, 'placeholderError', assignment.person.name, error.code);
                return Promise.reject(error);
            });
    }

    async function cancelAssignmentAndCloseEditMenu(): Promise<void> {
        const assignments: Array<Assignment> = (await AssignmentClient.getAssignmentsUsingPersonIdAndDate(spaceUuid, assignment.person.id, viewingDate)).data;

        const productPlaceholderPairs: Array<ProductPlaceholderPair> = assignments
            .filter(fetchedAssignment => fetchedAssignment.id !== assignment.id)
            .map(fetchedAssignment => ({
                productId: fetchedAssignment.productId,
                placeholder: fetchedAssignment.placeholder,
            } as ProductPlaceholderPair));

        toggleEditMenu();

        AssignmentClient.createAssignmentForDate(
            moment(viewingDate).format('YYYY-MM-DD'),
            productPlaceholderPairs,
            currentSpace,
            assignment.person,
            false
        ).then(() => {
            MatomoEvents.pushEvent(currentSpace.name, 'cancelAssignment', assignment.person.name);
            if (fetchProducts) {
                fetchProducts();
            }
        }).catch((error) => {
            MatomoEvents.pushEvent(currentSpace.name, 'cancelAssignmentError', assignment.person.name, error.code);
            return Promise.reject(error);
        });
    }

    function getMenuOptionList(): Array<EditMenuOption> {
        return [
            {
                callback: editPersonAndCloseEditMenu,
                text: 'Edit Person',
                icon: 'account_circle',
            },
            {
                callback: markAsPlaceholderAndCloseEditMenu,
                text: assignment.placeholder ? 'Unmark as Placeholder' : 'Mark as Placeholder',
                icon: 'create',
            },
            {
                callback: cancelAssignmentAndCloseEditMenu,
                text: 'Cancel Assignment',
                icon: 'delete',
            }];
    }

    const classNames = `personContainer 
        ${container === 'productDrawerContainer' ? 'borderedPeople' : ''}
        ${!isReadOnly && assignment.placeholder ? 'Placeholder' : 'NotPlaceholder'}
        ${isReadOnly ? 'readOnlyAssignmentCard' : ''}`;

    const cssRoleColor = assignment.person.spaceRole?.color?.color ? assignment.person.spaceRole.color.color : 'transparent';

    return (
        <div
            className={classNames}
            data-testid={createDataTestId('assignmentCard', assignment.person.name)}
            ref={assignmentRef}
            style={{border: assignment.placeholder ? `2px solid ${cssRoleColor}` :  '1px solid #EDEBEB' }}
            onMouseDown={(e): void => {
                if (!isReadOnly && startDraggingAssignment) {
                    startDraggingAssignment(assignmentRef, assignment, e);
                }
            }}
        >
            {assignment.person.newPerson && <NewBadge/>}
            <PersonAndRoleInfo
                isReadOnly={isReadOnly}
                assignment={assignment}
                isUnassignedProduct={isUnassignedProduct}/>
            <button
                className="personRoleColor"
                aria-label="Person Menu"
                disabled={isReadOnly}
                style={{backgroundColor: cssRoleColor }}
                data-testid={createDataTestId('editPersonIconContainer', assignment.person.name)}
                onClick={toggleEditMenu}
            >
                {!isReadOnly &&
                    <i className="material-icons personEditIcon greyIcon" aria-hidden>
                        more_vert
                    </i>
                }
            </button>
            {editMenuIsOpened &&
            <EditMenu
                menuOptionList={getMenuOptionList()}
                onClosed={onEditMenuClosed}
                testId={createDataTestId('editMenu', assignment.person.name)}
            />
            }
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    isReadOnly: state.isReadOnly,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    fetchProducts: () => dispatch(fetchProductsAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentCard);
/* eslint-enable */
