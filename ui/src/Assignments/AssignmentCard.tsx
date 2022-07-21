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

import React, {RefObject, useRef, useState} from 'react';
import EditMenu, {EditMenuOption} from '../ReusableComponents/EditMenu';

import NewBadge from '../ReusableComponents/NewBadge';
import AssignmentClient from '../Services/Api/AssignmentClient';
import {calculateDuration} from './AssignmentService';
import {ProductPlaceholderPair} from './CreateAssignmentRequest';
import moment from 'moment';
import PersonAndRoleInfo from './PersonAndRoleInfo';
import {createDataTestId} from 'Utils/ReactUtils';
import MatomoService from 'Services/MatomoService';
import PeopleClient from 'Services/Api/PeopleClient';
import ConfirmationModal, {ConfirmationModalProps} from 'Modal/ConfirmationModal/ConfirmationModal';
import {JSX} from '@babel/types';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {IsReadOnlyState} from 'State/IsReadOnlyState';
import useFetchProducts from 'Hooks/useFetchProducts/useFetchProducts';
import useFetchPeople from 'Hooks/useFetchPeople/useFetchPeople';
import {ModalContentsState} from 'State/ModalContentsState';
import PersonForm from 'People/PersonForm';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {Assignment} from 'Types/Assignment';

import '../Styles/Main.scss';
import './AssignmentCard.scss';

interface Props {
    assignment: Assignment;
    isUnassignedProduct?: boolean;
    startDraggingAssignment?(ref: RefObject<HTMLDivElement>, assignment: Assignment, e: React.MouseEvent): void;
}

function AssignmentCard({
    assignment = {id: 0} as Assignment,
    isUnassignedProduct = false,
    startDraggingAssignment,
}: Props): JSX.Element {
    const viewingDate = useRecoilValue(ViewingDateState);
    const isReadOnly = useRecoilValue(IsReadOnlyState);
    const setModalContents = useSetRecoilState(ModalContentsState);
    const currentSpace = useRecoilValue(CurrentSpaceState);

    const spaceUuid = currentSpace.uuid!;
    const { fetchProducts } = useFetchProducts(spaceUuid);
    const  { fetchPeople } = useFetchPeople(spaceUuid);

    const [editMenuIsOpened, setEditMenuIsOpened] = useState<boolean>(false);
    const [modal, setModal] = useState<JSX.Element | null>(null);
    const assignmentRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

    const onEditMenuClosed = (): void => setEditMenuIsOpened(false);

    function toggleEditMenu(): void {
        if (!isUnassignedProduct) {
            setEditMenuIsOpened(!editMenuIsOpened)
        } else {
            openModal()
        }
    }

    function openModal() {
        setModalContents({
            title: 'Edit Person',
            component: <PersonForm
                isEditPersonForm
                personEdited={assignment.person}
            />,
        });
    }

    function editPersonAndCloseEditMenu(): void {
        toggleEditMenu();
        openModal();
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
                const matomoAction = markedAsPlaceholder ? 'markAsPlaceholder' : 'unmarkAsPlaceholder';
                MatomoService.pushEvent(currentSpace.name, matomoAction, assignment.person.name);

                if (fetchProducts) fetchProducts();
            }).catch((error) => {
                MatomoService.pushEvent(currentSpace.name, 'placeholderError', assignment.person.name, error.code);
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
            MatomoService.pushEvent(currentSpace.name, 'cancelAssignment', assignment.person.name);
            if (fetchProducts) fetchProducts();
        }).catch((error) => {
            MatomoService.pushEvent(currentSpace.name, 'cancelAssignmentError', assignment.person.name, error.code);
            return Promise.reject(error);
        });
    }

    async function doArchivePerson(): Promise<void> {
        PeopleClient.archivePerson(currentSpace, assignment.person, viewingDate).then(() => {
            if (fetchProducts) fetchProducts();
            if (fetchPeople) fetchPeople();
        });
    }

    async function showArchivePersonModalAndCloseEditMenu(): Promise<void> {
        toggleEditMenu();
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: doArchivePerson,
            close: () => setModal(null),
            secondaryButton: undefined,
            content: (
                <>
                    <div>Archiving this person will remove them from all current assignments.</div>
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


    const getClasses = () => {
        const defaultClasses = 'personContainer notPlaceholder';
        if (isReadOnly) return `${defaultClasses} readOnlyAssignmentCard`;
        if (assignment.placeholder) return 'personContainer placeholder';
        return defaultClasses
    }

    const cssRoleColor = assignment.person.spaceRole?.color?.color ? assignment.person.spaceRole.color.color : 'transparent';
    const getBorder = (): string => {
        if (!isReadOnly && assignment.placeholder) return `2px solid ${cssRoleColor}`
        return '1px solid #EDEBEB';
    }

    return (
        <div
            className={getClasses()}
            data-testid={createDataTestId('assignmentCard', assignment.person.name)}
            ref={assignmentRef}
            style={{border: getBorder()}}
            onMouseDown={(e): void => {
                if (!isReadOnly && startDraggingAssignment) {
                    startDraggingAssignment(assignmentRef, assignment, e);
                }
            }}
        >
            {assignment.person.newPerson && assignment.person.newPersonDate && (
                <div className="newPersonBadge">
                    <NewBadge
                        newPersonDate={assignment.person.newPersonDate}
                        viewingDate={viewingDate}
                    />
                </div>
            )}
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
                onClick={toggleEditMenu}>
                {!isReadOnly && (
                    <i className="material-icons personEditIcon greyIcon" aria-hidden>
                        more_vert
                    </i>
                )}
            </button>
            {editMenuIsOpened && (
                <EditMenu
                    menuOptionList={getMenuOptionList()}
                    onClosed={onEditMenuClosed}
                    testId={createDataTestId('editMenu', assignment.person.name)}
                />
            )}
            {modal}
        </div>
    );
}

export default AssignmentCard;

