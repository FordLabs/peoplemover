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

import React, {FormEvent, useEffect, useState} from 'react';
import SpaceClient from 'Space/SpaceClient';
import {connect} from 'react-redux';
import FormButton from '../ModalFormComponents/FormButton';
import {GlobalStateProps} from '../Redux/Reducers';
import {Space} from '../Space/Space';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';
import NotificationModal, {NotificationModalProps} from 'Modal/NotificationModal/NotificationModal';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {CurrentUserState} from 'State/CurrentUserState';
import useFetchUserSpaces from 'Hooks/useFetchUserSpaces/useFetchUserSpaces';
import {ModalContentsState} from 'State/ModalContentsState';

import './TransferOwnershipForm.scss';


function TransferOwnershipForm(): JSX.Element {
    const currentUser = useRecoilValue(CurrentUserState);
    const currentSpace = useRecoilValue(CurrentSpaceState);
    const setModalContents = useSetRecoilState(ModalContentsState);

    const { fetchUserSpaces } = useFetchUserSpaces();

    const [selectedUser, setSelectedUser] = useState<UserSpaceMapping | null>(null);
    const [usersList, setUsersList] = useState<UserSpaceMapping[]>([]);
    const [me, setMe] = useState<UserSpaceMapping>();
    const [submitted, setSubmitted] = useState<boolean>(false);

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

    const closeModal = () => setModalContents(null);

    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        const currentOwner = me;
        const newOwner = selectedUser;
        if (!currentOwner || !newOwner) return;
        SpaceClient.changeOwner(currentSpace, currentOwner, newOwner).then(() => {
            SpaceClient.removeUser(currentSpace, currentOwner).then(() => {
                fetchUserSpaces().catch();
                setSubmitted(true);
            });
        });
    };

    const renderOption = (person: UserSpaceMapping): JSX.Element => {
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <label key={person.id} className={'transferOwnershipFormRadioControl'}
            data-testid={'transferOwnershipFormRadioControl-' + person.userId}>
            <i className={'material-icons'} aria-hidden>account_circle</i>
            <span className={'personRadioUserId'}>{person.userId.toLowerCase()}</span>
            <input type={'radio'} name={'newOwner'} value={person.userId} checked={selectedUser ? selectedUser.id === person.id : false} onChange={() => {setSelectedUser(person)}}/>
        </label>;
    };

    const notificationModalProps = {
        content:<span>{'Ownership has been transferred to ' + selectedUser?.userId +
        ' and you have been removed from the space ' +
        currentSpace.name +
        '.'}</span>,
        title: 'Confirmed',
        close: closeModal
    } as NotificationModalProps;

    if (submitted) return (<NotificationModal {...notificationModalProps}/>);

    else return (
        <form className="transferOwnershipForm form" onSubmit={handleSubmit}>
            <>
                <div className={'transferOwnershipFormPrompt'}>
                        Please choose who you would like to be the new owner of {currentSpace.name}
                </div>
                <div className={'transferOwnershipFormRadioContainer'}>
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

export default TransferOwnershipForm;

