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

import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import SpaceClient from '../Space/SpaceClient';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {AvailableModals, closeModalAction, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import FormButton from '../ModalFormComponents/FormButton';
import {GlobalStateProps} from '../Redux/Reducers';
import {Space} from '../Space/Space';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';

import './InviteEditorsFormSection.scss';
import UserAccessList from '../ReusableComponents/UserAccessList';

interface Props {
    collapsed?: boolean;
    currentSpace: Space;
    currentUser: string;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
}

const getUsers = (currentSpace: Space, setUsersList: (usersList: UserSpaceMapping[]) => void): void => {
    if (currentSpace.uuid) {
        SpaceClient.getUsersForSpace(currentSpace.uuid).then((users) => setUsersList(users));
    }
};

function InviteEditorsFormSection({collapsed, currentSpace, currentUser, closeModal, setCurrentModal}: Props): JSX.Element {
    const isExpanded = !collapsed;
    const [invitedUserEmails, setInvitedUserEmails] = useState<string[]>([]);
    const [enableInviteButton, setEnableInviteButton] = useState<boolean>(false);
    const [usersList, setUsersList] = useState<UserSpaceMapping[]>([]);

    useEffect(() => {
        getUsers(currentSpace, setUsersList);
    }, [currentSpace, setUsersList]);

    const inviteUsers = async (event: FormEvent): Promise<void> => {
        event.preventDefault();

        await SpaceClient.inviteUsersToSpace(currentSpace, invitedUserEmails)
            .catch(console.error)
            .finally(() => {
                setCurrentModal({modal: AvailableModals.GRANT_EDIT_ACCESS_CONFIRMATION});
            });
    };

    const parseEmails = (event: ChangeEvent<HTMLInputElement>): void => {
        const emails: string[] = event.target.value.split(',').map((email: string) => email.trim());
        setEnableInviteButton(validateEmail(emails[0]));
        setInvitedUserEmails(emails);
    };

    const validateEmail = (email: string): boolean => {
        // eslint-disable-next-line no-useless-escape
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    function UserPermission({user}: { user: UserSpaceMapping }): JSX.Element {
        if (window.location.hash === '#perm') {
            if (user.permission !== 'owner') {
                const spaceOwner = usersList.filter(user => user.permission === 'owner')[0];
                const isUserOwner = spaceOwner.userId === currentUser;
                return <UserAccessList currentSpace={currentSpace} user={user} onChange={(): void => {getUsers(currentSpace, setUsersList);}} owner={spaceOwner} isUserOwner={isUserOwner}/>;
            } else {
                return <span className="userPermission" data-testid="userIdPermission">{user.permission}</span>;
            }
        } else {
            return <></>;
        }
    }


    return (
        <form className="inviteEditorsForm form" onSubmit={inviteUsers}>
            <label htmlFor="emailTextarea" className="inviteEditorsLabel">
                People with this permission can edit
            </label>
            {isExpanded && (
                <>
                    <input
                        id="emailTextarea"
                        className="emailTextarea"
                        placeholder="cdsid@ford.com, cdsid@ford.com"
                        onChange={parseEmails}
                        data-testid="inviteEditorsFormEmailTextarea"
                        hidden={collapsed}
                    />
                    <div>
                        <ul className="userList">
                            {usersList.map((user, index) => {
                                return (
                                    <li className="userListItem" key={index} data-testid={`userListItem__${user.userId}`}>
                                        <i className="material-icons editorIcon" aria-hidden>account_circle</i>
                                        <span className="userName" data-testid="userIdName">{user.userId}</span>
                                        <UserPermission user={user}></UserPermission>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="buttonsContainer" hidden={collapsed}>
                        <FormButton
                            buttonStyle="secondary"
                            className="cancelButton"
                            onClick={closeModal}>
                            Cancel
                        </FormButton>
                        <FormButton
                            type="submit"
                            buttonStyle="primary"
                            testId="inviteEditorsFormSubmitButton"
                            disabled={!enableInviteButton}>
                            Invite
                        </FormButton>
                    </div>
                </>
            )}
        </form>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    currentUser: state.currentUser,
});

export default connect(mapStateToProps, mapDispatchToProps)(InviteEditorsFormSection);
/* eslint-enable */
