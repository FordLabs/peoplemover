/*
 * Copyright (c) 2022 Ford Motor Company
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
import {setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {AvailableModals} from '../Modal/AvailableModals';
import {useRecoilValue} from 'recoil';
import {IsReadOnlyState} from '../State/IsReadOnlyState';

import './NewProductButton.scss';

interface Props {
  setCurrentModal(modalState: CurrentModalState): void;
  modalState?: CurrentModalState;
}

function NewProductButton({ modalState = {modal: AvailableModals.CREATE_PRODUCT}, setCurrentModal}: Props): JSX.Element {
    const isReadOnly = useRecoilValue(IsReadOnlyState);

    const openModal = (): void => setCurrentModal(modalState);

    return isReadOnly ? <></> : (
        <button
            className={`newProduct`}
            onClick={openModal}
            data-testid="newProductButton">
            <i className="material-icons greyIcon addProductIcon" aria-hidden>add</i>
            Add Product
        </button>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(NewProductButton);
/* eslint-enable */
