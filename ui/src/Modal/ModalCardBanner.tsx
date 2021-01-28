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

import {JSX} from '@babel/types';
import React from 'react';

export const ModalTitle = ({ title }: { title: string }): JSX.Element =>
    <h1 className="modalTitle">{title}</h1>;

export const CloseModalButton = ({ onClick }: { onClick: () => void }): JSX.Element => (
    <button className="material-icons closeButton"
        onClick={onClick}
        aria-label="Close Modal"
        data-testid="modalCloseButton">
        close
    </button>
);

interface Props {
    title: string;
    onCloseBtnClick: () => void;
}

const ModalCardBanner = ({title, onCloseBtnClick}: Props): JSX.Element => {
    return (
        <div className="modalCardBanner">
            <ModalTitle title={title} />
            <CloseModalButton onClick={onCloseBtnClick} />
        </div>
    );
};

export default ModalCardBanner;
