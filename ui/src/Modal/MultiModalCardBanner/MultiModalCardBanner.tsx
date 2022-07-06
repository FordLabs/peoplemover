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
import {CloseModalButton, ModalTitle} from 'Modal/ModalCardBanner/ModalCardBanner';

import './MultiModalCardBanner.scss';

interface Props {
    title: string;
    onCloseBtnClick: () => void;
    onClick?: () => void;
    collapsed?: boolean;
}

const MultiModalCardBanner = ({title, onClick, onCloseBtnClick, collapsed = false}: Props): JSX.Element => {
    return (
        <div className="modalCardBanner multiModal">
            <button
                className="expand-collapse-toggle-button"
                data-testid="multiModalExpandCollapseButton"
                aria-label={collapsed ? 'Open ' + title + ' controls' : title}
                disabled={!collapsed}
                onClick={onClick}
            >
                <ModalTitle title={title} />
                <i data-testid="modalCardBannerArrowIcon"
                    className="material-icons focusedModalArrow"
                    aria-hidden
                >
                    {collapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </i>
            </button>
            {!collapsed && <CloseModalButton onClick={onCloseBtnClick} />}
        </div>
    );
};

export default MultiModalCardBanner;
