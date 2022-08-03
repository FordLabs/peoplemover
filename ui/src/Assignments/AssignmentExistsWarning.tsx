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
import {useSetRecoilState} from 'recoil';
import {ModalContentsState} from '../State/ModalContentsState';

import './AssignmentExistsWarning.scss';

function AssignmentExistsWarning(): JSX.Element {
    const setModalContents = useSetRecoilState(ModalContentsState);

    return (
        <>
            <div className="warningText">
                This person is already assigned to this product.
            </div>
            <div>
                <button
                    className="formButton warningOkayButton"
                    onClick={() => setModalContents(null)}>
                    Okay
                </button>
            </div>
        </>
    );
}

export default AssignmentExistsWarning;