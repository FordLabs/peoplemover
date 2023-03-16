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

import {Space} from "../../Types/Space";
import {useSetRecoilState} from "recoil";
import {ModalContentsState} from "../../State/ModalContentsState";
import useFetchUserSpaces from "../../Hooks/useFetchUserSpaces/useFetchUserSpaces";
import {useState} from "react";
import ConfirmationModal, {ConfirmationModalProps} from "../../Modal/ConfirmationModal/ConfirmationModal";
import React from "react";
import NotificationModal, {NotificationModalProps} from "../../Modal/NotificationModal/NotificationModal";
import SpaceClient from "../../Services/Api/SpaceClient";

interface Props {
    space: Space;
}

function DuplicateSpaceForm({ space }: Props): JSX.Element {
    const setModalContents = useSetRecoilState(ModalContentsState);

    const { fetchUserSpaces } = useFetchUserSpaces();

    const [submitted, setSubmitted] = useState<boolean>(false);

    const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

    const closeModal = () => setModalContents(null);

    const notificationModalProps = {
        content: <span>{space.name + ' has been duplicated'}</span>,
        title: 'Confirmed',
        close: closeModal
    } as NotificationModalProps;

    const props = {
        containerClassname: 'leaveSpaceModal',
        content: <>
            <div>
                Duplicating this space will create a copy of the space and everything in it
            </div>
            { errorOccurred &&
                <div className='errorText'>
                    {space.name} already has a duplicate
                </div>
            }
        </>,
        submitButtonLabel: 'Duplicate',
        primaryButtonStyle: 'redalert',
        submit(): void | Promise<void> {
            SpaceClient.duplicateSpaceByUuid(space.uuid!).then(() => {
                fetchUserSpaces().catch().finally(closeModal);
                setSubmitted(true);
            })
                .catch(() => {
                    setErrorOccurred(true);
                });
        },
        close() {
            closeModal();
        },
    } as ConfirmationModalProps;

    if (submitted) {
        return (<NotificationModal {...notificationModalProps}/>);
    } else {
        return (<ConfirmationModal {...props}/>)
    }
}

export default DuplicateSpaceForm;