/*
 *
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

import {AvailableActions} from '../Actions';
import {Location} from '../../Locations/Location.interface';
import sortTagsAlphabetically from '../../Tags/sortTagsAlphabetically';

const locationsReducer = (state: Array<Location> = [], action: {type: AvailableActions; locations: Array<Location>} ): Array<Location> => {
    if (action.type === AvailableActions.SET_LOCATIONS) {
        const locations = [...action.locations];
        sortTagsAlphabetically(locations);
        return locations;
    } else {
        return state;
    }
};

export default locationsReducer;
