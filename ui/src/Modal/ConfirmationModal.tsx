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

import React from 'react';
import '../Application/Styleguide/Styleguide.scss';
import './Form.scss';
import './Modal.scss';

export interface ConfirmationModalProps {
    submit(itemToDelete?: unknown): void | Promise<void>;

    archiveCallback?(): void;

    close(): void;

    canArchive?: boolean;
    isArchived?: boolean;
    confirmClose?: boolean;
    warningMessage: string;
    submitButtonLabel?: string;
}

function ConfirmationModal({
    submit,
    archiveCallback,
    close,
    canArchive,
    confirmClose,
    isArchived,
    warningMessage,
    submitButtonLabel,
}: ConfirmationModalProps): JSX.Element {

    return (
        <div className="modalContainer">
            <div className="modalDialogContainer">
                <div className="modalPopupContainer">

                    <div className="modalTitleAndCloseButtonContainer">
                        <div className="modalTitleSpacer"/>
                        <div className="modalTitle">Are you sure?</div>
                        <div className="fa fa-times fa-lg closeButton" onClick={close}/>
                    </div>

                    <div className="confirmationModalContent">

                        <div>{warningMessage}</div>

                        {(canArchive && !isArchived) && <div>
                            <br/>
                            You can also choose to archive this product to be able to access it later.
                        </div>}
                        {(confirmClose) && <div>
                            <br/>
                            Are you sure you want to close the window?
                        </div>}

                    </div>

                    <div className={`yesNoButtons confirmationControlButtons confirmationModalControls${canArchive ? ' archiveable' : ''}`}>

                        <button className="formButton cancelFormButton" data-testid="confirmationModalCancel"
                            onClick={close}>Cancel</button>

                        <div className={`archiveAndDeleteContainer${canArchive && !isArchived ? ' archiveable' : ''}`}>
                            {canArchive && !isArchived && (<button
                                className="formButton confirmationModalDelete"
                                data-testid="confirmationModalArchive"
                                onClick={archiveCallback}>Archive</button>)}

                            <button className="formButton confirmationModalDelete"
                                onClick={submit}
                                data-testid="confirmDeleteButton">{submitButtonLabel ? submitButtonLabel : 'Delete'}
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
