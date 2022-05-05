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
import {fetchPeopleAction, fetchProductsAction, setCurrentModalAction} from '../Redux/Actions';
import AssignmentClient from './AssignmentClient';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import '../Styles/Main.scss';
import './AssignmentCard.scss';
import {Assignment, calculateDuration} from './Assignment';
import {ProductPlaceholderPair} from './CreateAssignmentRequest';
import moment from 'moment';
import PersonAndRoleInfo from './PersonAndRoleInfo';
import {createDataTestId} from '../Utils/ReactUtils';
import {Space} from '../Space/Space';
import MatomoEvents from '../Matomo/MatomoEvents';
import {AvailableModals} from '../Modal/AvailableModals';
import PeopleClient from '../People/PeopleClient';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {JSX} from '@babel/types';

interface AssignmentCardProps {
    currentSpace: Space;
    viewingDate: Date;
    assignment: Assignment;
    isUnassignedProduct: boolean;
    isReadOnly: boolean;

    startDraggingAssignment?(ref: RefObject<HTMLDivElement>, assignment: Assignment, e: React.MouseEvent): void;

    setCurrentModal(modalState: CurrentModalState): void;

    fetchProducts(): void;

    fetchPeople(): void;
}

function AssignmentCard({
    currentSpace,
    viewingDate,
    assignment = {id: 0} as Assignment,
    isUnassignedProduct,
    isReadOnly,
    startDraggingAssignment,
    setCurrentModal,
    fetchProducts,
    fetchPeople,
}: AssignmentCardProps): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spaceUuid = currentSpace.uuid!;
    const [editMenuIsOpened, setEditMenuIsOpened] = useState<boolean>(false);
    const [modal, setModal] = useState<JSX.Element | null>(null);
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
                item: assignment.person,
            };
            setCurrentModal(newModalState);
        }
    }

    function editPersonAndCloseEditMenu(): void {
        toggleEditMenu();
        const newModalState: CurrentModalState = {
            modal: AvailableModals.EDIT_PERSON,
            item: assignment.person,
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

    async function doArchivePerson(): Promise<void> {
        PeopleClient.archivePerson(currentSpace, assignment.person, viewingDate).then(() => {
            if (fetchProducts) {
                fetchProducts();
            }
            if (fetchPeople) {
                fetchPeople();
            }
        });
    }

    async function showArchivePersonModalAndCloseEditMenu(): Promise<void> {
        toggleEditMenu();
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: doArchivePerson,
            close: () => {
                setModal(null);
            },
            secondaryButton: undefined,
            content: (
                <>
                    <div>Archiving this person will remove them from all current assigments.</div>

                    <div><br/>You can later access this person from the Archived Person drawer.</div>
                </>
            ),
            submitButtonLabel: 'Archive',
        };
        setModal(ConfirmationModal(propsForDeleteConfirmationModal));
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
                callback: showArchivePersonModalAndCloseEditMenu,
                text: 'Archive Person',
                icon: 'inbox',
            },
            {
                callback: cancelAssignmentAndCloseEditMenu,
                text: 'Cancel Assignment',
                icon: 'delete',
            }];
    }

    const cssRoleColor = assignment.person.spaceRole?.color?.color ? assignment.person.spaceRole.color.color : 'transparent';

    let classNameAndRoleColor = {
        className: 'personContainer NotPlaceholder',
        roleColor: '1px solid #EDEBEB',
    };

    if (isReadOnly) {
        classNameAndRoleColor.className += ' readOnlyAssignmentCard';
    } else if (assignment.placeholder) {
        classNameAndRoleColor = {
            className: 'personContainer Placeholder',
            roleColor: `2px solid ${cssRoleColor}`,
        };
    }

    return (
        <div
            className={classNameAndRoleColor.className}
            data-testid={createDataTestId('assignmentCard', assignment.person.name)}
            ref={assignmentRef}
            style={{border: classNameAndRoleColor.roleColor}}
            onMouseDown={(e): void => {
                if (!isReadOnly && startDraggingAssignment) {
                    startDraggingAssignment(assignmentRef, assignment, e);
                }
            }}
        >
            {assignment.person.newPerson && assignment.person.newPersonDate &&
            <div className="newPersonBadge"><NewBadge newPersonDate={assignment.person.newPersonDate}
                viewingDate={viewingDate}/></div>}
            <PersonAndRoleInfo
                person={assignment.person}
                duration={calculateDuration(assignment, viewingDate)}
                isUnassignedProduct={isUnassignedProduct}/>
            <button
                className="personRoleColor"
                aria-label="Person Menu"
                disabled={isReadOnly}
                style={{backgroundColor: cssRoleColor}}
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
            {modal}
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
    fetchPeople: () => dispatch(fetchPeopleAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentCard);
/* eslint-enable */
