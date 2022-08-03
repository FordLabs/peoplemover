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

import React, {useState} from 'react';
import {Space} from 'Types/Space';
import ConfirmationModal, {ConfirmationModalProps} from 'Modal/ConfirmationModal/ConfirmationModal';
import SpaceClient from 'Services/Api/SpaceClient';
import FormButton from 'Common/FormButton/FormButton';
import NotificationModal, {NotificationModalProps} from 'Modal/NotificationModal/NotificationModal';
import useFetchUserSpaces from 'Hooks/useFetchUserSpaces/useFetchUserSpaces';
import TransferOwnershipForm from '../TransferOwnershipForm/TransferOwnershipForm';
import {useSetRecoilState} from 'recoil';
import {ModalContentsState} from 'State/ModalContentsState';

import './DeleteSpaceForm.scss';

interface Props {
    space: Space;
    spaceHasEditors?: boolean;
}

function DeleteSpaceForm({ space, spaceHasEditors }: Props): JSX.Element {
    const setModalContents = useSetRecoilState(ModalContentsState);

    const { fetchUserSpaces } = useFetchUserSpaces();

    const [submitted, setSubmitted] = useState<boolean>(false);

    const closeModal = () => setModalContents(null);

    const notificationModalProps = {
        content: <span>{space.name + ' has been deleted from PeopleMover.'
        }</span>,
        title: 'Confirmed',
        close: closeModal,
    } as NotificationModalProps;

    const propsWithEditors = {
        title: 'Are you sure?',
        containerClassname: 'leaveSpaceModal',
        content: <>
            <div>As owner of this space, deleting it will permanently remove it from all users&apos; dashboards. This
                action cannot be undone.
            </div>
            <br/>
            <div>If you&apos;d like to leave without deleting the space, please transfer ownership to a new owner.</div>
        </>,
        submitButtonLabel: 'Transfer Ownership',
        secondaryButton: (
            <FormButton
                buttonStyle="redalert"
                testId="confirmationModalLeaveAndDeleteSpace"
                onClick={(): void => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    SpaceClient.deleteSpaceByUuid(space.uuid!).then(() => {
                        fetchUserSpaces().catch().finally(closeModal);
                        setSubmitted(true);
                    });
                }}>
                Delete space
            </FormButton>),
        submit(): void | Promise<void> {
            setModalContents({
                title: 'Transfer Ownership of Space',
                component: <TransferOwnershipForm spaceToTransfer={space}/>
            });
        },
        close() {
            closeModal();
        },
    } as ConfirmationModalProps;

    const propsWithoutEditors = {
        title: 'Are you sure?',
        containerClassname: 'leaveSpaceModal',
        content: <>
            <div>Deleting this space will permanently remove it from PeopleMover.</div>
            <br/>
            <div>Are you sure you want to delete it?</div>
        </>,
        submitButtonLabel: 'Delete Space',
        primaryButtonStyle: 'redalert',
        submit(): void | Promise<void> {
            SpaceClient.deleteSpaceByUuid(space.uuid!).then(() => {
                fetchUserSpaces();
                setSubmitted(true);
            });
        },
        close() {
            closeModal();
        },
    } as ConfirmationModalProps;

    if (submitted) {
        return (<NotificationModal {...notificationModalProps}/>);
    } else if (spaceHasEditors === undefined || spaceHasEditors) {
        return (<ConfirmationModal {...propsWithEditors}/>);
    } else {
        return (<ConfirmationModal {...propsWithoutEditors}/>);
    }

}

export default DeleteSpaceForm;
