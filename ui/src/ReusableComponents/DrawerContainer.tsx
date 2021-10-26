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
import '../Assignments/PersonDrawer.scss';
import '../Assignments/UnassignedDrawer.scss';
import './DrawerContainer.scss';

interface DrawerContainerProps {
    numberForCountBadge?: number;
    drawerIcon: string;
    containerTitle: string;
    containee: JSX.Element;
    isDrawerOpen: boolean;
    setIsDrawerOpen(isOpen: boolean): void;
    testId?: string;
}

function DrawerContainer({
    numberForCountBadge,
    drawerIcon,
    containerTitle,
    containee,
    isDrawerOpen,
    setIsDrawerOpen,
    testId,
}: DrawerContainerProps): JSX.Element {
    function canRenderCountBadge(): boolean {
        if (numberForCountBadge) {
            return numberForCountBadge > 0;
        }
        return false;
    }

    return (
        <div className={ `drawerContainer ${isDrawerOpen ? 'drawerBottomBorder' : ''}`} data-testid={testId}>
            <button className={`drawerHeader ${isDrawerOpen ? '' : 'drawerBottomBorder'}`}
                onClick={(): void => setIsDrawerOpen(!isDrawerOpen)}
                data-testid={testId + 'Caret'}>

                {canRenderCountBadge() && <div className="countBadge" data-testid={testId + 'CountBadge'}>{numberForCountBadge}</div>}

                <div className="drawerContainerTitleAndIcon">
                    <i className="material-icons" aria-hidden>{drawerIcon}</i>
                    <span className="accordionText">{containerTitle}</span>
                </div>
                <i className="material-icons greyIcon drawerArrow"
                    data-testid={`calendar_${isDrawerOpen ? 'up-arrow' : 'down-arrow'}`}>
                    {isDrawerOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
                </i>
            </button>
            {isDrawerOpen && (
                <React.Fragment>{containee}</React.Fragment>
            )}
        </div>
    );
}

export default DrawerContainer;
