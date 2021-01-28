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
import {CloseModalButton, ModalTitle} from './ModalCardBanner';

import './MultiModalCardBanner.scss';

interface Props {
    title: string;
    onCloseBtnClick: () => void;
    isExpanded?: boolean;
}

const MultiModalCardBanner = ({title, onCloseBtnClick, isExpanded = true}: Props): JSX.Element => {
    const HeaderWrapper = isExpanded ? 'div' : 'button';

    return (
        <div className="modalCardBanner multiModal">
            <HeaderWrapper
                className="expandCollapseToggleButton"
                data-testid="multiModalExpandCollapseButton"
                aria-label={isExpanded ? title : 'Open ' + title + ' controls'}
            >
                <ModalTitle title={title} />
                <i data-testid="modalCardBannerArrowIcon"
                    className="material-icons focusedModalArrow"
                    aria-hidden
                >
                    {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </i>
            </HeaderWrapper>
            {isExpanded && <CloseModalButton onClick={onCloseBtnClick} />}
        </div>
    );
};

export default MultiModalCardBanner;
