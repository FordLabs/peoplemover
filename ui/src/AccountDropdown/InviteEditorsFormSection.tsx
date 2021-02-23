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

interface Props {
    collapsed?: boolean;
    currentSpace: Space;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
}

function InviteEditorsFormSection({collapsed, currentSpace, closeModal, setCurrentModal}: Props): JSX.Element {
    const isExpanded = !collapsed;
    const [invitedUserEmails, setInvitedUserEmails] = useState<string[]>([]);
    const [enableInviteButton, setEnableInviteButton] = useState<boolean>(false);
    const [usersList, setUsersList] = useState<UserSpaceMapping[]>([]);

    useEffect(() => {
        if (currentSpace.uuid) {
            SpaceClient.getUsersForSpace(currentSpace.uuid).then((response) => {
                const users: UserSpaceMapping[] = response.data;
                users.sort(compareByPermissionThenByUserId);
                setUsersList(users);
            });
        }
    }, [currentSpace]);

    function compareByPermissionThenByUserId(a: UserSpaceMapping, b: UserSpaceMapping): number {
        let comparison = 0;
        if (a.permission === b.permission) {
            if (a.userId > b.userId) comparison = 1;
            else if (a.userId < b.userId) comparison = -1;
        } else {
            if (a.permission.toLowerCase() === 'owner') comparison = -1;
            else if (b.permission.toLowerCase() === 'owner') comparison = 1;
        }
        return comparison;
    }

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
                        placeholder="Enter CDSID of your editors"
                        onChange={parseEmails}
                        data-testid="inviteEditorsFormEmailTextarea"
                        hidden={collapsed}
                    />
                    <div>
                        <ul className="userList">
                            {usersList.map((user, index) => {
                                return (
                                    <li className="userListItem" key={index}>
                                        <i className="material-icons editorIcon" aria-hidden>account_circle</i>
                                        <span className="userName" data-testid="userIdName">{user.userId}</span>
                                        <span className="userPermission" data-testid="userIdPermission">{user.permission}</span>
                                        <span className="editorCaret">
                                            {(user.permission !== 'owner' &&
                                                <i className="material-icons" aria-hidden>arrow_drop_down</i>
                                            )}
                                        </span>
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
});

export default connect(mapStateToProps, mapDispatchToProps)(InviteEditorsFormSection);
/* eslint-enable */
