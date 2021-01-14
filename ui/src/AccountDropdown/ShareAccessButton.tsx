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

import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import React from 'react';
import {Dispatch} from 'redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {connect} from 'react-redux';

interface Props {
    setCurrentModal(modalState: CurrentModalState): void;
}

function ShareAccessButton({ setCurrentModal }: Props): JSX.Element {
    const openEditContributorsModal = (): void => setCurrentModal({modal: AvailableModals.EDIT_CONTRIBUTORS});
    const showButton = window.runConfig.invite_users_to_space_enabled;
    const onkeydown = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') openEditContributorsModal();
    };

    return showButton ? (
        <button
            className="accountDropdownOption"
            role="menuitem"
            data-testid="shareAccess"
            onClick={openEditContributorsModal}
            onKeyDown={onkeydown}>
            Share Access
        </button>
    ) : <></>;
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(ShareAccessButton);
/* eslint-enable */