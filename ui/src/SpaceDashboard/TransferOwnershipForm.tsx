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

import React, {FormEvent, useEffect, useState} from 'react';
import SpaceClient from '../Space/SpaceClient';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {closeModalAction, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import FormButton from '../ModalFormComponents/FormButton';
import {GlobalStateProps} from '../Redux/Reducers';
import {Space} from '../Space/Space';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';
import './TransferOwnershipForm.scss';

interface TransferOwnershipFormProps {
    currentSpace: Space;
    currentUser: string;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
}

interface TransferOwnershipFormOwnProps {
    space?: Space;
}

function TransferOwnershipForm({currentSpace, currentUser, closeModal, setCurrentModal}: TransferOwnershipFormProps, {space}: TransferOwnershipFormOwnProps): JSX.Element {
    const [selectedUser, setSelectedUser] = useState<UserSpaceMapping | null>(null);
    const [usersList, setUsersList] = useState<UserSpaceMapping[]>([]);
    const [me, setMe] = useState<UserSpaceMapping>();



    useEffect(() => {
        const getUsers = (currentSpace: Space, setUsersList: (usersList: UserSpaceMapping[]) => void): void => {
            if (currentSpace.uuid) {
                SpaceClient.getUsersForSpace(currentSpace.uuid).then((users) => {
                    setUsersList(users.filter(u => u.permission === 'editor'));
                    setMe(users.find(u => u.userId.toUpperCase() === currentUser.toUpperCase()));
                });
            }
        };
        getUsers(currentSpace, setUsersList);
    }, [currentSpace, setUsersList, currentUser]);


    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        const currentOwner = me;
        const newOwner = selectedUser;
        if (!currentOwner || !newOwner) return;
        SpaceClient.changeOwner(currentSpace, currentOwner, newOwner).then(() => {
            SpaceClient.removeUser(currentSpace, currentOwner).then(() => {
                closeModal();
            });
        });
    };

    const renderOption = (person: UserSpaceMapping): JSX.Element => {
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <div key={person.id} className={'transferOwnershipFormRadioControl'} onClick={(): void => setSelectedUser(person)}>
            <i className={'material-icons'} aria-hidden>account-circle</i>
            <span>{person.userId}</span>
            <input type={'radio'} name={'newOwner'} value={person.userId} checked={selectedUser ? selectedUser.id === person.id : false}/>
        </div>;
    };

    return (
        <form className="transferOwnershipForm form" onSubmit={handleSubmit}>
            <>
                <div className={'transferOwnershipFormPrompt'}>
                        Please choose who you would like to be the new owner of {currentSpace.name}
                </div>
                <div>
                    {usersList.map((user) => renderOption(user))}
                </div>
                <div className="buttonsContainer">
                    <FormButton
                        buttonStyle="secondary"
                        className="cancelButton"
                        onClick={closeModal}>
                            Cancel
                    </FormButton>
                    <FormButton
                        type="submit"
                        buttonStyle="primary"
                        testId="transferOwnershipFormSubmitButton"
                        disabled={!selectedUser}
                    >
                            Transfer ownership
                    </FormButton>
                </div>
            </>
        </form>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

const mapStateToProps = (state: GlobalStateProps, ownProps?: TransferOwnershipFormOwnProps) => ({
    currentSpace: ownProps?.space || state.currentSpace,
    currentUser: state.currentUser,
});

export default connect(mapStateToProps, mapDispatchToProps)(TransferOwnershipForm);
/* eslint-enable */
