/*
 * Copyright (c) 2020 Ford Motor Company
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

import React, {ChangeEvent, FormEvent, useState} from 'react';
import SpaceClient from '../Space/SpaceClient';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {AvailableModals, closeModalAction, setCurrentModalAction, setCurrentSpaceAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import FormButton from '../ModalFormComponents/FormButton';

import './EditContributorsForm.scss';
import {GlobalStateProps} from '../Redux/Reducers';
import {Space} from '../Space/Space';
import ReactSwitch from 'react-switch';

interface Props {
    currentSpace: Space;

    closeModal(): void;

    setCurrentModal(modalState: CurrentModalState): void;
    setCurrentSpace(space: Space): void;
}

function EditContributorsForm({currentSpace, closeModal, setCurrentModal, setCurrentSpace}: Props): JSX.Element {
    const [invitedUserEmails, setInvitedUserEmails] = useState<string[]>([]);
    const [enableInviteButton, setEnableInviteButton] = useState<boolean>(false);
    const [enableReadOnly, setEnableReadOnly] = useState<boolean>(currentSpace.todayViewIsPublic);
    const linkToSpace: string = window.location.href;
    const [copiedLink, setCopiedLink] = useState<boolean>(false);

    const copyLink = async (event: React.MouseEvent): Promise<void> => {
        event.preventDefault();
        await navigator.clipboard.writeText(linkToSpace);
        setCopiedLink(true);

        setTimeout(() => {setCopiedLink(false);}, 3000);
    };

    const inviteUsers = async (event: FormEvent): Promise<void> => {
        event.preventDefault();

        await SpaceClient.inviteUsersToSpace(currentSpace, invitedUserEmails)
            .catch(console.error)
            .finally(() => {
                setCurrentModal({modal: AvailableModals.CONTRIBUTORS_CONFIRMATION});
            });
    };

    const parseEmails = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        const emails: string[] = event.target.value.split(',').map((email: string) => email.trim());
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

    const toggleReadOnlyEnabled = async (checked: boolean): Promise<void> => {
        setEnableReadOnly(checked);
        await SpaceClient.editSpace(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            currentSpace.uuid!,
            {...currentSpace, todayViewIsPublic:checked},
            currentSpace.name
        ).then((editedSpaceResponse) => setCurrentSpace(editedSpaceResponse.data));
    };

    return (
        <form className="editContributorsContainer form"
            onSubmit={(event): Promise<void> => inviteUsers(event)}>
            <div className="inviteViewersLabel">
                <span>People with this link can view only</span>
                <div className="inviteContributorsConfirmationShareLinkContainer">
                    <div className="inviteContributorsConfirmationLink" data-testid="inviteContributorsConfirmationLink">
                        {linkToSpace}
                    </div>
                    <button className="inviteContributorsConfirmationCopyButton"
                        data-testid="inviteContributorsConfirmationCopyButton"
                        onClick={copyLink}>
                        {copiedLink ? 'Copied!' : 'Copy link'}
                    </button>
                </div>
            </div>
            <label className={'enableReadOnlyLabel'}>
                <span>View only access is {enableReadOnly ? 'enabled' : 'disabled'}</span>
                <ReactSwitch data-testid="editContributorsToggleReadOnlySwitch"
                    onChange={toggleReadOnlyEnabled}
                    checked={enableReadOnly}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    width={27} height={13}
                />
            </label>
            <h2 className="editTitle">Invite others to edit</h2>
            <label className="inviteContributorsLabel">
                <span>People with this permission can edit</span>
                <textarea
                    placeholder="email1@ford.com, email2@ford.com"
                    onChange={parseEmails}
                    data-testid="emailTextArea"/>
            </label>

            <div className="editContributorsButtonContainer">
                <FormButton
                    buttonStyle="secondary"
                    className="editContributorsCancelButton"
                    onClick={closeModal}>
                    Cancel
                </FormButton>
                <FormButton
                    type="submit"
                    buttonStyle="primary"
                    disabled={!enableInviteButton}
                    testId="shareAccessInviteButton">
                    Invite
                </FormButton>
            </div>
        </form>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    setCurrentSpace: (space: Space) => dispatch(setCurrentSpaceAction(space)),
});

const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps, mapDispatchToProps)(EditContributorsForm);
/* eslint-enable */
