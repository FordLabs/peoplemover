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

import {Space} from './Space';
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


    function showsDropdown(e: React.MouseEvent<HTMLButtonElement>): boolean {
        e.stopPropagation();
        if (dropdownFlag) {
            hidesDropdown();
        } else {
            setDropdownFlag(!dropdownFlag);
            document.addEventListener('click', hidesDropdown, false);
        }
        return dropdownFlag;
    }

    function hidesDropdown(): boolean {
        setDropdownFlag(false);
        document.removeEventListener('click', hidesDropdown);
        return dropdownFlag;
    }

    function handleKeyDownForOpenSpace(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            openSpace(space);
        }
    }

    function handleKeyDownForOpenEditModal(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            openSpace(space);
        }
    }

    return (
        <div className="space"
            onClick={(): void => openSpace(space)}
            onKeyDown={(e): void => handleKeyDownForOpenSpace(e)}>
            <div className="space-metadata">
                <div className="space-name">{space.name}</div>
                <div className="last-modified-text">Last modified {timestamp}</div>
            </div>
            <div className="button-container">
                <button data-testid="ellipsis-button" className="ellipsis-button" onClick={(e): boolean => showsDropdown(e)}>
                    <i className="fas fa-ellipsis-v icon"/>

                    {dropdownFlag && <div className={'ellipsis-dropdown-container'}>
                        <div data-testid="edit-space"
                            className="dropdown-options"
                            onClick={openEditModal}
                            onKeyDown={(e): void => handleKeyDownForOpenEditModal(e)}>
                            <i className="fas fa-pen"/>Edit
                        </div>
                    </div>
                    }
                </button>
            </div>
        </div>
    );

    function openEditModal(): void {
        return setCurrentModal({modal: AvailableModals.EDIT_SPACE, item: space});
    }
}


const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(SpaceDashboardTile);
