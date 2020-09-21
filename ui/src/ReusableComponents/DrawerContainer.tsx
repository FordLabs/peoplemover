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
        <div className={isDrawerOpen ? 'drawerContainer drawerBottomBorder' : 'drawerContainer'} data-testid={testId}>
            <div className={isDrawerOpen ? 'drawerHeader' : 'drawerHeader drawerBottomBorder'}
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                data-testid="drawerCaret">

                {canRenderCountBadge() && <div className="countBadge" data-testid="countBadge">{numberForCountBadge}</div>}

                <div className="unassignedTitleAndIcon">
                    <i className={drawerIcon}/>
                    <span className="accordionText">{containerTitle}</span>
                </div>
                <i className={isDrawerOpen ? 'fas fa-caret-up drawerCaret' : 'fas fa-caret-down drawerCaret'}/>
            </div>
            {isDrawerOpen && (
                <React.Fragment>{containee}</React.Fragment>
            )}
        </div>
    );
}

export default DrawerContainer;