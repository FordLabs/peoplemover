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
import {connect} from 'react-redux';
import {closeModalAction} from '../Redux/Actions';
import {Dispatch} from 'redux';

import './AssignmentExistsWarning.scss';

export interface Props {
    closeModal(): void;
}

function AssignmentExistsWarning(props: Props): JSX.Element {
    return (
        <>
            <div className="warningText">
                This person is already assigned to this product.
            </div>
            <div>
                <button
                    className="formButton warningOkayButton"
                    onClick={props.closeModal}>
                    Okay
                </button>
            </div>
        </>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(null, mapDispatchToProps)(AssignmentExistsWarning);
/* eslint-enable */