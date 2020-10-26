/*
 *
 *  * Copyright (c) 2020 Ford Motor Company
 *  * All rights reserved.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  * http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import {AvailableActions} from '../Actions';
import {EditMenuToOpen} from '../../ReusableComponents/EditMenuToOpen';

const whichEditMenuOpenReducer = (state: EditMenuToOpen | null = null, action: {type: AvailableActions; menu: EditMenuToOpen} ): EditMenuToOpen | null => {
    if (action.type === AvailableActions.SET_WHICH_EDIT_MENU_OPEN) {
        return action.menu;
    } else {
        return state;
    }
};

export default whichEditMenuOpenReducer;