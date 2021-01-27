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

interface Props {
    title: string;
    onCloseBtnClick: () => void;
    isExpanded?: boolean;
}

const ModalCardBanner = ({title, onCloseBtnClick, isExpanded = true}: Props): JSX.Element => {
    return (
        <div className="modalTitleAndCloseButtonContainer">
            <div className="modalTitle">
                {title}
            </div>
            <i data-testid="modalCardBannerArrowIcon"
                className="material-icons expandedCardArrow">
                {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </i>
            {isExpanded &&
                <button className="material-icons closeButton"
                    onClick={onCloseBtnClick}
                    data-testid="modalCloseButton">
                    close
                </button>
            }
        </div>
    );
};

export default ModalCardBanner;
