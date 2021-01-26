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

import React, {useEffect, useState} from 'react';
import {JSX} from '@babel/types';
import ConfirmationModal, {ConfirmationModalProps} from './ConfirmationModal';
import FocusRing from '../FocusRing';
import {ModalMetadataItem} from '../Redux/Containers/CurrentModal';

interface ModalProps {
    modalMetadata: Array<ModalMetadataItem> | null;
    closeModal(): void;
}

function Modal({ modalMetadata, closeModal }: ModalProps): JSX.Element | null {
    const [shouldShowConfirmCloseModal, setShouldShowConfirmCloseModal] = useState<boolean>(false);
    const [confirmCloseModal, setConfirmCloseModal] = useState<JSX.Element | null>(null);
    const [expandedSectionIndex, setExpandedSectionIndex] = useState<number>(0);

    useEffect(() => {
        let bodyOverflowState = 'unset';
        if (modalMetadata !== null) bodyOverflowState = 'hidden';
        document.body.style.overflow = bodyOverflowState;
    }, [modalMetadata]);

    useEffect(() => {
        if (modalMetadata && modalMetadata.length === 1) {
            setExpandedSectionIndex(0);
        }
    }, [modalMetadata]);

    function showCloseModalWarning(): void {
        const propsForCloseConfirmationModal: ConfirmationModalProps = {
            submit: () => {
                closeModal();
                setConfirmCloseModal(null);
            },
            close: () => {
                setConfirmCloseModal(null);
            },
            confirmClose: true,
            warningMessage: 'You have unsaved changes. Closing the window will result in the changes being discarded.',
            submitButtonLabel: 'Close',
        };
        const confirmConfirmationModal: JSX.Element = ConfirmationModal(propsForCloseConfirmationModal);
        setConfirmCloseModal(confirmConfirmationModal);
    }

    function exitModal(): void {
        if (shouldShowConfirmCloseModal) {
            showCloseModalWarning();
        } else {
            closeModal();
        }
    }

    const modalBackgroundOnKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === 'Escape') exitModal();
    };

    const onModalCardClick = (e: React.MouseEvent, index: number): void => {
        e.stopPropagation();
        FocusRing.turnOffWhenClicking();

        const hasMoreThanOneModalCard = modalMetadata && modalMetadata.length > 1;
        if (hasMoreThanOneModalCard) {
            console.log('Modal Card Click')
            setExpandedSectionIndex(index);
        }
    };

    const onModalCardKeydown = (e: React.KeyboardEvent): void => {
        e.stopPropagation();
        FocusRing.turnOnWhenTabbing(e);
    };

    return modalMetadata && modalMetadata.length !== 0 ? (
        <div
            className="modalBackground"
            data-testid="modalContainer"
            onClick={exitModal}
            onKeyDown={modalBackgroundOnKeyDown}>
            <div className="modalContents">
                {modalMetadata.map((item: ModalMetadataItem, index) => {
                    const isExpanded = expandedSectionIndex === index;
                    const isCollapsed = !isExpanded;
                    const customModalForm = React.cloneElement(
                        item.form,
                        {
                            collapsed: isCollapsed,
                            setShouldShowConfirmCloseModal: setShouldShowConfirmCloseModal,
                        }
                    );
                    return (
                        <div
                            key={item.title}
                            className="modalCard"
                            data-testid="modalCard"
                            onClick={(e: React.MouseEvent): void => onModalCardClick(e, index)}
                            onKeyDown={onModalCardKeydown}
                            aria-expanded={isExpanded}
                            hidden={isCollapsed}
                        >
                            <input type="text" aria-hidden={true} className="hiddenInputField"/>
                            <div className="modalTitleAndCloseButtonContainer">
                                <div className="modalTitle">
                                    {item.title}
                                </div>
                                <button className="material-icons closeButton"
                                    onClick={exitModal}
                                    data-testid="modalCloseButton">
                                    close
                                </button>
                            </div>
                            {customModalForm ? customModalForm : item.form}
                            {confirmCloseModal}
                        </div>
                    );
                })}
            </div>
        </div>
    ) : null;
}

export default Modal;
