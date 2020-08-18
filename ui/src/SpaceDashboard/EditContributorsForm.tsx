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
import {closeModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import './EditContributorsForm.scss';


import {useLocation} from 'react-router-dom';


interface EditContributorsFormProps {
    closeModal(): void;
}

function EditContributorsForm({
    closeModal,
}: EditContributorsFormProps): JSX.Element {

    const pathname = useLocation().pathname;

    const [spaceName, setSpaceName] = useState<string>('');
    const [invitedUserEmails, setInvitedUserEmails] = useState<string[]>([]);

    useEffect(() => {
        setSpaceName(pathname.substring(1, pathname.length));
    }, [pathname]);

    async function inviteUsers(): Promise<void> {
        await SpaceClient.inviteUsersToSpace(spaceName, invitedUserEmails);

        closeModal();
    }

    function parseEmails(event: ChangeEvent<HTMLTextAreaElement>): void {
        const emails: string[] = event.target.value.split(',');
        setInvitedUserEmails(emails);
    }

    return <div className={'editContributorsContainer'}>
        <div className={'inviteContributorsLabel'}>Invite others to collaborate</div>
        <textarea placeholder={'Enter Emails'} onChange={parseEmails} data-testid={'emailTextArea'}/>
        <div className={'editContributorsButtonContainer'}>
            <button className={'editContributorsCancelButton'} onClick={closeModal}>Cancel</button>
            <button className={'editContributorsSaveButton'} onClick={inviteUsers}>Invite</button>
        </div>
    </div>;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(null, mapDispatchToProps)(EditContributorsForm);
