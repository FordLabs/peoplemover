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

import {ModalMetadataItem} from '../Redux/Containers/CurrentModal';
import {JSX} from '@babel/types';
import React from 'react';

export type ArrowIconDirection = 'up' | 'down';

interface Props {
    item: ModalMetadataItem;
    onCloseBtnClick: () => void;
    showArrowIcon?: boolean;
    arrowIconDirection?: ArrowIconDirection;
}

const ModalCardBanner = ({item, onCloseBtnClick, showArrowIcon, arrowIconDirection}: Props): JSX.Element => {
    return (
        <div className="modalTitleAndCloseButtonContainer">
            <div className="modalTitle">
                {item.title}
            </div>
            {showArrowIcon && (
                <i data-testid="modalCardBannerArrowIcon"
                    className="material-icons expandedCardArrow">
                    {arrowIconDirection === 'up' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </i>
            )}
            <button className="material-icons closeButton"
                onClick={onCloseBtnClick}
                data-testid="modalCloseButton">
                close
            </button>
        </div>
    );
};

export default ModalCardBanner;