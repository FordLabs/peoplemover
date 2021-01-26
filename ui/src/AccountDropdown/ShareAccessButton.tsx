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
    focusOnRender?: boolean;
}

function ShareAccessButton({ setCurrentModal, focusOnRender = false }: Props): JSX.Element {
    const openEditContributorsModal = (): void => setCurrentModal({modal: AvailableModals.SHARE_SPACE_ACCESS});
    const showButton = window.runConfig.invite_users_to_space_enabled;

    return showButton ? (
        <button
            autoFocus={focusOnRender}
            className="accountDropdownOption"
            role="menuitem"
            data-testid="shareAccess"
            onClick={openEditContributorsModal}
        >
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
