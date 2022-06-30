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

import {combineReducers} from 'redux';
import currentModalReducer, {CurrentModalState} from './currentModalReducer';
import productRefsReducer from './productRefsReducer';
import {ProductCardRefAndProductPair} from '../../Products/ProductDnDHelper';
import allGroupedTagFilterOptionsReducer from './allGroupedTagOptionsReducer';
import currentSpaceReducer from './currentSpaceReducer';
import productTagsReducer from './productTagsReducer';
import personTagsReducer from './personTagsReducer';
import locationsReducer from './locationsReducer';
import {Space} from '../../Space/Space';
import {Tag} from '../../Tags/Tag';
import {LocationTag} from '../../Locations/LocationTag.interface';
import {AllGroupedTagFilterOptions} from '../../SortingAndFiltering/FilterLibraries';
import {RoleTag} from '../../Roles/RoleTag.interface';
import rolesReducer from './rolesReducer';

export default combineReducers({
    currentModal: currentModalReducer,
    productRefs: productRefsReducer,
    allGroupedTagFilterOptions: allGroupedTagFilterOptionsReducer,
    currentSpace: currentSpaceReducer,
    productTags: productTagsReducer,
    personTags: personTagsReducer,
    locations: locationsReducer,
    roles: rolesReducer,
});

export interface GlobalStateProps {
    currentModal: CurrentModalState;
    productRefs: Array<ProductCardRefAndProductPair>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    currentSpace: Space;
    productTags: Array<Tag>;
    personTags: Array<Tag>;
    locations: Array<LocationTag>;
    roles: Array<RoleTag>;
}


