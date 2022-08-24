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

import React, {useState} from "react";
import ConfirmationModal, {ConfirmationModalProps} from "Modal/ConfirmationModal/ConfirmationModal";
import {JSX} from "@babel/types";
import PeopleClient from "Services/Api/PeopleClient";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {UUIDForCurrentSpaceSelector} from "State/CurrentSpaceState";
import {ModalContentsState} from "State/ModalContentsState";
import {Person} from "Types/Person";

interface Props {
    personEdited?: Person;
}

function DeleteButton({ personEdited }: Props) {
    const spaceUuid = useRecoilValue(UUIDForCurrentSpaceSelector);
    const setModalContents = useSetRecoilState(ModalContentsState);
    const closeModal = () => setModalContents(null);

    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

    const removePerson = (): void => {
        const assignmentId = personEdited && personEdited.id;
        if (assignmentId) {
            PeopleClient.removePerson(spaceUuid, assignmentId).then(closeModal);
        }
    };

    const displayRemovePersonModal = (): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: removePerson,
            close: () => setConfirmDeleteModal(null),
            content: <div>Removing this person will remove all instances of them from your entire space.</div>,
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    };

    return (
        <>
            <button
                className="deleteButtonContainer alignSelfCenter deleteLinkColor"
                data-testid="deletePersonButton"
                onClick={displayRemovePersonModal}
            >
                <i className="material-icons" aria-hidden>delete</i>
                <div className="trashCanSpacer"/>
                <span className="obliterateLink">Delete</span>
            </button>
            {confirmDeleteModal}
        </>
    )
}

export default DeleteButton;