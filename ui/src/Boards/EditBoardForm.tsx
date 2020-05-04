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

import React, {ChangeEvent, useState} from 'react';
import '../Modal/Form.scss';
import BoardClient from './BoardClient';
import {closeModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {Dispatch} from 'redux';

interface EditBoardFormProps {
    boardName: string;
    boardId: number;
    isTheOnlyBoard: boolean;

    closeModal(): void;
}

function EditBoardForm(props: EditBoardFormProps): JSX.Element {

    const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);
    const [currentBoardName, setCurrentBoardName] = useState<string>(props.boardName);

    function updateBoardName(event: ChangeEvent<HTMLInputElement>): void {
        const incomingSandboxName = event.target.value;
        setCurrentBoardName(incomingSandboxName);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            editBoard();
        }
    }

    function editBoard(): void {
        BoardClient.updateBoard(props.boardId, currentBoardName).then(props.closeModal);
    }

    async function deleteBoard(): Promise<void> {
        return BoardClient.deleteBoard(props.boardId).then(props.closeModal);
    }

    function displayDeleteBoardModal(): void {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: deleteBoard,
            close: () => setConfirmDeleteModal(null),
            warningMessage: 'Deleting this board will permanently remove it from your PeopleMover workspace.',
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal as any);
    }

    return (
        <div className="formContainer">
            <form className="form" onKeyDown={handleKeyDown}>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="name">Name</label>
                    <input className="formInput formTextInput"
                        type="text"
                        name="name"
                        id="name"
                        value={currentBoardName}
                        onChange={updateBoardName}
                        autoFocus/>
                </div>
                <div className="yesNoButtons">
                    <button className="formButton cancelFormButton" onClick={props.closeModal}>Cancel</button>
                    <input className="formButton"
                        onClick={editBoard}
                        type="button"
                        value="Save"/>
                </div>
                {props.isTheOnlyBoard && (
                    <div className="deleteButtonContainer alignSelfCenter deleteLinkColor isDisabled"
                        data-testid="deleteButton">
                        <i className="fas fa-trash"/>
                        <div className="trashCanSpacer"/>
                        <a className="obliterateLink isDisabled">Delete Board</a>
                    </div>)}
                {!props.isTheOnlyBoard && (
                    <div className="deleteButtonContainer alignSelfCenter deleteLinkColor">
                        <i className="fas fa-trash"/>
                        <div className="trashCanSpacer"/>
                        <a className="obliterateLink"
                            onClick={displayDeleteBoardModal}>Delete Board</a>
                    </div>)}
            </form>
            {confirmDeleteModal}
        </div>
    );
}

const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(null, mapDispatchToProps)(EditBoardForm);