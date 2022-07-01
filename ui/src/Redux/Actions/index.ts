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

import {CurrentModalState} from '../Reducers/currentModalReducer';
import {ProductCardRefAndProductPair} from '../../Products/ProductDnDHelper';
import {Action, ActionCreator, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {Space} from '../../Space/Space';
import {Tag} from '../../Tags/Tag';
import ProductTagClient from '../../Tags/ProductTag/ProductTagClient';
import {AllGroupedTagFilterOptions, getFilterOptionsForSpace} from '../../SortingAndFiltering/FilterLibraries';
import PersonTagClient from '../../Tags/PersonTag/PersonTagClient';
import sortTagsAlphabetically from '../../Tags/sortTagsAlphabetically';

export enum AvailableActions {
    SET_CURRENT_MODAL,
    CLOSE_MODAL,
    REGISTER_PRODUCT_REF,
    UNREGISTER_PRODUCT_REF,
    SET_ALL_FILTER_OPTIONS,
    SET_CURRENT_SPACE,
    SET_PRODUCT_TAGS,
    SET_PERSON_TAGS,
}

export const setCurrentModalAction = (modalState: CurrentModalState) => ({
    type: AvailableActions.SET_CURRENT_MODAL,
    modal: modalState.modal,
    item: modalState.item,
});

export const closeModalAction = () => ({
    type: AvailableActions.CLOSE_MODAL,
});

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

export const setCurrentSpaceAction = (space: Space) => ({
    type: AvailableActions.SET_CURRENT_SPACE,
    space,
});

export const setProductTagsAction = (productTags: Array<Tag>) => ({
    type: AvailableActions.SET_PRODUCT_TAGS,
    productTags,
});

export const setPersonTagsAction = (personTags: Array<Tag>) => ({
    type: AvailableActions.SET_PERSON_TAGS,
    personTags,
});

export const fetchProductTagsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return ProductTagClient.get(getState().currentSpace.uuid!,)
            .then(result => {
                const productTags: Array<Tag> = result.data || [];
                sortTagsAlphabetically(productTags);
                dispatch(setProductTagsAction(productTags));
            });
    };


export const fetchPersonTagsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return PersonTagClient.get(getState().currentSpace.uuid!,)
            .then(result => {
                const personTags: Array<Tag> = result.data || [];
                sortTagsAlphabetically(personTags);
                dispatch(setPersonTagsAction(personTags));
            });
    };

export const setupSpaceAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = (space: Space) =>
    (dispatch: Dispatch): Promise<void> => {
        dispatch(setCurrentSpaceAction(space));
        return getFilterOptionsForSpace(space.uuid!).then((filterOptions: Array<AllGroupedTagFilterOptions>) => {
            dispatch(setAllGroupedTagFilterOptionsAction(filterOptions));
        });
    };
