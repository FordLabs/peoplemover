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

import {ProductCardRefAndProductPair} from '../../Products/ProductDnDHelper';
import {Action, ActionCreator, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {Space} from '../../Space/Space';
import {AllGroupedTagFilterOptions, getFilterOptionsForSpace} from '../../SortingAndFiltering/FilterLibraries';

export enum AvailableActions {
    REGISTER_PRODUCT_REF,
    UNREGISTER_PRODUCT_REF,
    SET_ALL_FILTER_OPTIONS
}

export const registerProductRefAction = (productRef: ProductCardRefAndProductPair) => ({
    type: AvailableActions.REGISTER_PRODUCT_REF,
    productRef,
});

export const unregisterProductRefAction = (productRef: ProductCardRefAndProductPair) => ({
    type: AvailableActions.UNREGISTER_PRODUCT_REF,
    productRef,
});

export const setAllGroupedTagFilterOptionsAction = (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) => ({
    type: AvailableActions.SET_ALL_FILTER_OPTIONS,
    allGroupedTagFilterOptions: allGroupedTagFilterOptions,
});

export const setupSpaceAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = (space: Space) =>
    (dispatch: Dispatch): Promise<void> => {
        // dispatch(setCurrentSpaceAction(space));

        // @todo MAKE SURE THIS GETS handled
        return getFilterOptionsForSpace(space.uuid!).then((filterOptions: Array<AllGroupedTagFilterOptions>) => {
            dispatch(setAllGroupedTagFilterOptionsAction(filterOptions));
        });
    };
