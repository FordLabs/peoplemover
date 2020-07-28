/*
  * Copyright (c) 2019 Ford Motor Company
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
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';

interface NewProductButtonProps {
  setCurrentModal(modalState: CurrentModalState): void;
}

function NewProductButton({setCurrentModal}: NewProductButtonProps): JSX.Element {
    return (
        <div className="newProduct productCardContainer"
            onClick={() => setCurrentModal({modal: AvailableModals.CREATE_PRODUCT})}
            data-cy="newProductButton">
            <div className="fa fa-plus greyIcon addProductIcon fa-sm"/>
            <h2 className="newProductText">New Product</h2>
        </div>
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(NewProductButton);