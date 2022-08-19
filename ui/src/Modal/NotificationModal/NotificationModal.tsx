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

import React from 'react';
import FormButton from 'Common/FormButton/FormButton';
import ModalCardBanner from 'Modal/ModalCardBanner/ModalCardBanner';

export interface NotificationModalProps {
    close(): void;
    closeButtonLabel?: string;
    title?: string;
    content: JSX.Element;
    containerClassname?: string;
}

function NotificationModal({
    close,
    closeButtonLabel = 'Ok',
    title = 'Confirmed',
    content,
    containerClassname = '',
}: NotificationModalProps): JSX.Element {
    const CancelButton = (): JSX.Element => (
        <FormButton
            buttonStyle="primary"
            testId="confirmationModalCancel"
            onClick={close}
        >
            {closeButtonLabel}
        </FormButton>
    );

    return (
        <div className="modalBackground" data-testid="notificationModal">
            <div
                className={
                    containerClassname
                        ? 'modalContents ' + containerClassname
                        : 'modalContents'
                }
            >
                <div className="modalCard">
                    <ModalCardBanner title={title} onCloseBtnClick={close} />
                    <div className="confirmationModalContent">{content}</div>
                    <div
                        className={`yesNoButtons confirmationControlButtons confirmationModalControls`}
                    >
                        <CancelButton />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotificationModal;
