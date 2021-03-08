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
import FormButton from '../ModalFormComponents/FormButton';
import ModalCardBanner from './ModalCardBanner';

export interface ConfirmationModalProps {
    submit(itemToDelete?: unknown): void | Promise<void>;
    close(): void;
    submitButtonLabel?: string;
    content?: JSX.Element;
    secondaryButton?: JSX.Element;
}

function ConfirmationModal({
    submit,
    close,
    submitButtonLabel,
    content,
    secondaryButton,
}: ConfirmationModalProps): JSX.Element {
    const SubmitButton = (): JSX.Element => (
        <FormButton
            className="confirmationModalDelete"
            onClick={submit}
            buttonStyle="primary"
            testId="confirmDeleteButton">
            {submitButtonLabel ? submitButtonLabel : 'Delete'}
        </FormButton>
    );

    const CancelButton = (): JSX.Element => (
        <FormButton
            buttonStyle="secondary"
            testId="confirmationModalCancel"
            onClick={close}>
            Cancel
        </FormButton>
    );

    return (
        <div className="modalBackground">
            <div className="modalContents">
                <div className="modalCard">
                    <ModalCardBanner
                        title="Are you sure?"
                        onCloseBtnClick={close}
                    />
                    <div className="confirmationModalContent">
                        {content}
                    </div>
                    <div className={`yesNoButtons confirmationControlButtons confirmationModalControls ${secondaryButton ? 'secondaryButtonContainer' : ''}`}>
                        <div className={`cancelAndArchiveContainer ${secondaryButton ? 'secondaryButtonContainer' : ''}`}>
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
