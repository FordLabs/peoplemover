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

import React, {ChangeEvent, useEffect, useState} from 'react';
import SpaceClient from './SpaceClient';
import {Dispatch} from 'redux';
import {useLocation} from 'react-router-dom';
import {connect} from 'react-redux';
import {AvailableModals, closeModalAction, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';

import './EditContributorsForm.scss';

interface Props {
    closeModal(): void;

    setCurrentModal(modalState: CurrentModalState): void;
}

function EditContributorsForm({closeModal, setCurrentModal}: Props): JSX.Element {
    const pathname = useLocation().pathname;

    const [spaceUuid, setSpaceUuid] = useState<string>('');
    const [invitedUserEmails, setInvitedUserEmails] = useState<string[]>([]);
    const [enableInviteButton, setEnableInviteButton] = useState<boolean>(false);


    useEffect(() => {
        setSpaceUuid(pathname.substring(1, pathname.length));
    }, [pathname]);

    const inviteUsers = async (): Promise<void> => {
        await SpaceClient.inviteUsersToSpace(spaceUuid, invitedUserEmails)
            .catch(console.error)
            .finally(() => {
                setCurrentModal({modal: AvailableModals.CONTRIBUTORS_CONFIRMATION});
            });
    };

    const parseEmails = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        const emails: string[] = event.target.value.split(',');
        if (validateEmail(emails[0])) {
            setEnableInviteButton(true);
        } else {
            setEnableInviteButton(false);
        }
        setInvitedUserEmails(emails);
    };

    const validateEmail = (email: string): boolean => {
        // eslint-disable-next-line no-useless-escape
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    return (
        <div className="editContributorsContainer">
            <div className="inviteContributorsLabel">Invite others to collaborate</div>
            <textarea placeholder="email1@ford.com, email2@ford.com" onChange={parseEmails} data-testid="emailTextArea"/>
            <div className="editContributorsButtonContainer">
                <button className="editContributorsCancelButton" onClick={closeModal}>Cancel</button>
                <button className="editContributorsSaveButton" onClick={inviteUsers} disabled={!enableInviteButton}>Invite</button>
            </div>
        </div>
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(EditContributorsForm);
