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

import React from 'react';
import ModalCardBanner from '../ModalCardBanner/ModalCardBanner';
import FormButton, { ButtonStyle } from 'Common/FormButton/FormButton';

import './ConfirmationModal.scss';

export interface ConfirmationModalProps {
    submit(item?: unknown): void | Promise<void>;
    close(): void;
    submitButtonLabel?: string;
    closeButtonLabel?: string;
    title?: string;
    content: JSX.Element;
    secondaryButton?: JSX.Element;
    containerClassname?: string;
    primaryButtonStyle?: string;
}

function ConfirmationModal({
    submit,
    close,
    submitButtonLabel = 'Delete',
    closeButtonLabel = 'Cancel',
    title = 'Are you sure?',
    content,
    secondaryButton,
    containerClassname = '',
    primaryButtonStyle = 'primary',
}: ConfirmationModalProps): JSX.Element {
    const SubmitButton = (): JSX.Element => (
        <FormButton
            className="confirmationModalDelete"
            onClick={submit}
            buttonStyle={primaryButtonStyle as ButtonStyle}
            testId="confirmDeleteButton"
        >
            {submitButtonLabel}
        </FormButton>
    );

    const CancelButton = (): JSX.Element => (
        <FormButton
            buttonStyle="secondary"
            testId="confirmationModalCancel"
            onClick={close}
        >
            {closeButtonLabel}
        </FormButton>
    );

    return (
        <div className="modalBackground">
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
                        className={`yesNoButtons confirmationControlButtons confirmationModalControls ${
                            secondaryButton ? 'secondaryButtonContainer' : ''
                        }`}
                    >
                        <div
                            className={`cancelAndArchiveContainer ${
                                secondaryButton
                                    ? 'secondaryButtonContainer'
                                    : ''
                            }`}
                        >
                            <CancelButton />
                            {secondaryButton}
                        </div>
                        <SubmitButton />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
