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
import {useState} from 'react';
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
    const [dropdownFlag, setDropdownFlag] = useState<boolean>(false);

    let timestamp: string;
    const nowStamp = now();
    const lastModifiedMoment = moment(space.lastModifiedDate);
    if (lastModifiedMoment.isSame(nowStamp, 'day')) {
        timestamp = lastModifiedMoment.format('[today at] h:mm a');
    } else {
        timestamp = lastModifiedMoment.format('dddd, MMMM D, YYYY [at] h:mm a');
    }

    function showsDropdown(): boolean {
        if (dropdownFlag) {
            hidesDropdown();
        } else {
            setDropdownFlag(!dropdownFlag);
            document.addEventListener('click', hidesDropdown, false);
        }
        return dropdownFlag;
    }

    function handleDropdownClick(event: React.MouseEvent<HTMLButtonElement>): boolean {
        event.stopPropagation();
        return showsDropdown();
    }

    function hidesDropdown(): boolean {
        setDropdownFlag(false);
        document.removeEventListener('click', hidesDropdown);
        return dropdownFlag;
    }

    function openEditModal(): void {
        return setCurrentModal({modal: AvailableModals.EDIT_SPACE, item: space});
    }

    const ActionsDropdown = (): JSX.Element => {
        return (
            <div className="ellipsisDropdownContainer">
                <button
                    data-testid="editSpace"
                    className="dropdownOptions"
                    onClick={openEditModal}>
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
                    data-testid="ellipsisButton"
                    className="ellipsisButton"
                    aria-label={`Open Menu for Space ${space.name}`}
                    onClick={handleDropdownClick}>
                    <i className="material-icons">more_vert</i>
                    {dropdownFlag && <ActionsDropdown />}
                </button>
            </div>
        );
    };

    return (
        <button className="spaceTile"
            data-testid="spaceDashboardTile"
            onClick={(): void => openSpace(space)}>
            <div className="spaceMetadata">
                <div className="spaceName">{space.name}</div>
                <div className="lastModifiedText">Last modified {timestamp}</div>
            </div>
            <ActionsEllipsis />
        </button>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(SpaceDashboardTile);
/* eslint-enable */
