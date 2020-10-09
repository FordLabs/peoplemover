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

import React, {useState} from 'react';
import {Dispatch} from 'redux';
import {closeModalAction} from '../Redux/Actions';
import FormButton from '../ModalFormComponents/FormButton';
import {connect} from 'react-redux';

import './InviteContributorsConfirmationModal.scss';

interface Props {
    closeModal(): void;
}

const InviteContributorConfirmationForm = ({ closeModal }: Props): JSX.Element => {
    const linkToSpace: string = window.location.href;
    const [copiedLink, setCopiedLink] = useState<boolean>(false);

    const copyLink = async (event: React.MouseEvent): Promise<void> => {
        event.preventDefault();
        await navigator.clipboard.writeText(linkToSpace);
        setCopiedLink(true);

        setTimeout(() => {setCopiedLink(false);}, 3000);
    };

    return (
        <form className="inviteContributorsConfirmationContainer">
            <div className="inviteContributorsConfirmationLabel">
                Share this link with your collaborators.
            </div>
            <div className="inviteContributorsConfirmationShareLinkContainer">
                <div className="inviteContributorsConfirmationLink" data-testid="invite_contributors_confirmation_link">
                    {linkToSpace}
                </div>
                <button className="inviteContributorsConfirmationCopyButton"
                    data-testid="invite_contributors_confirmation_copy_button"
                    onClick={copyLink}>
                    {copiedLink ? 'Copied!' : 'Copy link'}
                </button>
            </div>
            <FormButton
                buttonStyle="primary"
                onClick={closeModal}
                testId="invite_contributor_done_button">
                Done
            </FormButton>
        </form>
    );
};

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(null, mapDispatchToProps)(InviteContributorConfirmationForm);
/* eslint-enable */
