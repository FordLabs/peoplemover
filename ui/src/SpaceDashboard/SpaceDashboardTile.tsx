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

import {Space} from '../Space/Space';
import * as React from 'react';
import moment, {now} from 'moment';
import './SpaceDashboardTile.scss';
import {useRef, useState} from 'react';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {Dispatch} from 'redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {connect} from 'react-redux';

interface SpaceDashboardTileProps {
    space: Space;
    onClick: (space: Space) => void;

    setCurrentModal(modalState: CurrentModalState): void;
}

function SpaceDashboardTile({space, onClick: openSpace, setCurrentModal}: SpaceDashboardTileProps): JSX.Element {
    const spaceHtmlElementId = space.name.replace(' ', '-');
    const spaceEllipsisButtonId = `ellipsis-button-${spaceHtmlElementId}`;
    const dropdownElement = useRef<HTMLDivElement>(null);

    const [dropdownFlag, setDropdownFlag] = useState<boolean>(false);

    let timestamp: string;
    const nowStamp = now();
    const lastModifiedMoment = moment(space.lastModifiedDate);
    if (lastModifiedMoment.isSame(nowStamp, 'day')) {
        timestamp = lastModifiedMoment.format('[today at] h:mm a');
    } else {
        timestamp = lastModifiedMoment.format('dddd, MMMM D, YYYY [at] h:mm a');
    }

    const toggleDropdownVisibility = (visible: boolean): void => {
        setDropdownFlag(visible);
        if (visible) {
            dropdownElement.current?.focus();
        }
    };

    function handleDropdownClick(): void {
        toggleDropdownVisibility(!dropdownFlag);
    }

    function openEditModal(): void {
        return setCurrentModal({modal: AvailableModals.EDIT_SPACE, item: space});
    }

    const ActionsDropdown = (): JSX.Element => {
        return (
            <div
                role="menu"
                className="ellipsisDropdownContainer"
                aria-labelledby={spaceEllipsisButtonId}
                ref={dropdownElement}
                tabIndex={0}
            >
                <button
                    data-testid="editSpace"
                    className="dropdownOptions"
                    onClick={openEditModal}
                    role="menuitem">
                    <i className="material-icons">edit</i>
                    Edit
                </button>
            </div>
        );
    };

    const ActionsEllipsis = (): JSX.Element => {
        return (
            <div className="ellipsisButtonContainer">
                <button
                    id={spaceEllipsisButtonId}
                    aria-haspopup={true}
                    aria-expanded={false}
                    data-testid="ellipsisButton"
                    className="ellipsisButton"
                    aria-label={`Open Menu for Space ${space.name}`}
                    onClick={handleDropdownClick}>
                    <i className="material-icons" aria-hidden>more_vert</i>
                </button>
                {dropdownFlag && <ActionsDropdown/>}
            </div>
        );
    };

    return (
        <div className="spaceTileContainer">
            <button className="spaceTile"
                data-testid="spaceDashboardTile"
                onClick={(): void => openSpace(space)}
            >
                <div className="spaceMetadata">
                    <div className="spaceName">{space.name}</div>
                    <div className="lastModifiedText">Last modified {timestamp}</div>
                </div>
            </button>
            <ActionsEllipsis/>
        </div>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(SpaceDashboardTile);
/* eslint-enable */
