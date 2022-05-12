/*
 * Copyright (c) 2021 Ford Motor Company
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

import {AvailableActions} from '../Actions';
import {AvailableModals} from '../../Modal/AvailableModals';

export interface CurrentModalState {
    modal: AvailableModals | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item?: any;
}

const initialState: CurrentModalState = {
    modal: null,
    item: null,
};

const currentModalReducer = (
    state: CurrentModalState = initialState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: { type: AvailableActions; modal: AvailableModals; item?: any }
): CurrentModalState => {
    switch (action.type) {
        case AvailableActions.SET_CURRENT_MODAL:
            return {
                modal: action.modal,
                item: action.item,
            };
        case AvailableActions.CLOSE_MODAL:
            return {...state, modal: null};
        default:
            return state;
    }
};

export default currentModalReducer;
