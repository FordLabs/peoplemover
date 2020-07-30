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

import {combineReducers} from 'redux';
import currentModalReducer, {CurrentModalState} from './currentModalReducer';
import peopleReducer from './peopleReducer';
import isUnassignedDrawerOpenReducer from './isUnassignedDrawerOpenReducer';
import {Person} from '../../People/Person';
import {EditMenuToOpen} from '../../ReusableComponents/EditMenuToOpen';
import productRefsReducer from './productRefsReducer';
import {ProductCardRefAndProductPair} from '../../Products/ProductDnDHelper';
import productSortByReducer from './productSortByReducer';
import {AllGroupedTagFilterOptions} from '../../ReusableComponents/ProductFilter';
import allGroupedTagFilterOptionsReducer from './allGroupedTagOptionsReducer';
import currentSpaceReducer from './currentSpaceReducer';
import {Space} from '../../SpaceDashboard/Space';
import {viewingDateReducer} from './viewingDateReducer';
import productsReducer from './productsReducer';
import {Product} from '../../Products/Product';
import productTagsReducer from './productTagsReducer';
import {ProductTag} from "../../ProductTag/ProductTag";

export default combineReducers({
    currentModal: currentModalReducer,
    people: peopleReducer,
    isUnassignedDrawerOpen: isUnassignedDrawerOpenReducer,
    productRefs: productRefsReducer,
    productSortBy: productSortByReducer,
    allGroupedTagFilterOptions: allGroupedTagFilterOptionsReducer,
    currentSpace: currentSpaceReducer,
    viewingDate: viewingDateReducer,
    products: productsReducer,
    productTags: productTagsReducer,
});

export interface GlobalStateProps {
    currentModal: CurrentModalState;
    people: Array<Person>;
    isUnassignedDrawerOpen: boolean;
    whichEditMenuOpen: EditMenuToOpen;
    productRefs: Array<ProductCardRefAndProductPair>;
    productSortBy: string;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    currentSpace: Space;
    viewingDate: Date;
    products: Array<Product>;
    productTags: Array<ProductTag>;
}
