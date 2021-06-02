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

import {Person} from '../../People/Person';
import {CurrentModalState} from '../Reducers/currentModalReducer';
import {ProductCardRefAndProductPair} from '../../Products/ProductDnDHelper';
import {Action, ActionCreator, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {Space} from '../../Space/Space';
import {Product} from '../../Products/Product';
import ProductClient from '../../Products/ProductClient';
import {Tag} from '../../Tags/Tag';
import ProductTagClient from '../../Tags/ProductTag/ProductTagClient';
import {LocationTag} from '../../Locations/LocationTag.interface';
import LocationClient from '../../Locations/LocationClient';
import SpaceClient from '../../Space/SpaceClient';
import {AllGroupedTagFilterOptions, getFilterOptionsForSpace} from '../../SortingAndFiltering/FilterLibraries';
import PersonTagClient from '../../Tags/PersonTag/PersonTagClient';

export enum AvailableActions {
    SET_CURRENT_MODAL,
    CLOSE_MODAL,
    SET_IS_UNASSIGNED_DRAWER_OPEN,
    ADD_PERSON,
    EDIT_PERSON,
    SET_PEOPLE,
    REGISTER_PRODUCT_REF,
    UNREGISTER_PRODUCT_REF,
    SET_ALL_FILTER_OPTIONS,
    SET_CURRENT_SPACE,
    SET_VIEWING_DATE,
    SET_PRODUCTS,
    SET_PRODUCT_TAGS,
    SET_PERSON_TAGS,
    SET_LOCATIONS,
    SET_PRODUCT_SORT_BY,
    SET_USER_SPACES,
    SET_IS_READ_ONLY,
    SET_IS_DRAGGING,
    SET_CURRENT_USER,
    GOT_FLAGS
}

export const setCurrentModalAction = (modalState: CurrentModalState) => ({
    type: AvailableActions.SET_CURRENT_MODAL,
    modal: modalState.modal,
    item: modalState.item,
});

export const closeModalAction = () => ({
    type: AvailableActions.CLOSE_MODAL,
});

export const setIsUnassignedDrawerOpenAction = (open: boolean) => ({
    type: AvailableActions.SET_IS_UNASSIGNED_DRAWER_OPEN,
    open,
});

export const addPersonAction = (person: Person) => ({
    type: AvailableActions.ADD_PERSON,
    people: [person],
});

export const editPersonAction = (person: Person) => ({
    type: AvailableActions.EDIT_PERSON,
    people: [person],
});

export const setPeopleAction = (people: Array<Person>) => ({
    type: AvailableActions.SET_PEOPLE,
    people,
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

export const setCurrentUserAction = (currentUser: string) => ({
    type: AvailableActions.SET_CURRENT_USER,
    currentUser,
});

export const setViewingDateAction = (date: Date) => ({
    type: AvailableActions.SET_VIEWING_DATE,
    date,
});

export const setProductsAction = (products: Array<Product>) => ({
    type: AvailableActions.SET_PRODUCTS,
    products,
});

export const setProductTagsAction = (productTags: Array<Tag>) => ({
    type: AvailableActions.SET_PRODUCT_TAGS,
    productTags,
});

export const setPersonTagsAction = (personTags: Array<Tag>) => ({
    type: AvailableActions.SET_PERSON_TAGS,
    personTags,
});

export const setLocationsAction = (locations: Array<LocationTag>) => ({
    type: AvailableActions.SET_LOCATIONS,
    locations,
});

export const setProductSortByAction = (productSortBy: string) => ({
    type: AvailableActions.SET_PRODUCT_SORT_BY,
    productSortBy,
});

export const setUserSpacesAction = (userSpaces: Array<Space>) => ({
    type: AvailableActions.SET_USER_SPACES,
    userSpaces,
});

export const setIsReadOnlyAction = (isReadOnly: boolean) => ({
    type: AvailableActions.SET_IS_READ_ONLY,
    isReadOnly,
});

export const setIsDragging = (isDragging: boolean) => ({
    type: AvailableActions.SET_IS_DRAGGING,
    isDragging,
});

export const fetchUserSpacesAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch): Promise<void> => {
        return SpaceClient.getSpacesForUser()
            .then(result => {
                const spaces: Array<Space> = result.data || [];
                dispatch(setUserSpacesAction(spaces));
            });
    };

export const fetchProductsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return ProductClient.getProductsForDate(
            getState().currentSpace.uuid,
            getState().viewingDate
        ).then(result => {
            const products: Array<Product> = result.data || [];
            dispatch(setProductsAction(products));

            const savedSort = localStorage.getItem('sortBy');
            const sort = savedSort !== null && savedSort !== undefined ? savedSort : 'name';
            dispatch(setProductSortByAction(sort));
        });
    };

export const fetchProductTagsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return ProductTagClient.get(getState().currentSpace.uuid!,)
            .then(result => {
                let productTags: Array<Tag> = result.data || [];
                productTags = productTags.sort((a, b) => {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) {
                        return -1;
                    }
                    if (a.name.toLowerCase() > b.name.toLowerCase()) {
                        return 1;
                    }
                    return 0;
                });
                dispatch(setProductTagsAction(productTags));
            });
    };


export const fetchPersonTagsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return PersonTagClient.get(getState().currentSpace.uuid!,)
            .then(result => {
                let personTags: Array<Tag> = result.data || [];
                personTags = personTags.sort((a, b) => {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) {
                        return -1;
                    }
                    if (a.name.toLowerCase() > b.name.toLowerCase()) {
                        return 1;
                    }
                    return 0;
                });
                dispatch(setPersonTagsAction(personTags));
            });
    };

export const fetchLocationsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return LocationClient.get(getState().currentSpace.uuid,)
            .then(result => {
                let locations: Array<LocationTag> = result.data || [];
                locations = locations.sort((a, b) => {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) {
                        return -1;
                    }
                    if (a.name.toLowerCase() > b.name.toLowerCase()) {
                        return 1;
                    }
                    return 0;
                });
                dispatch(setLocationsAction(locations));
            });
    };

export const setupSpaceAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = (
    space: Space
) => (
    dispatch: Dispatch,
): Promise<void> => {
    dispatch(setCurrentSpaceAction(space));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return getFilterOptionsForSpace(space.uuid!).then((filterOptions: Array<AllGroupedTagFilterOptions>) => {
        dispatch(setAllGroupedTagFilterOptionsAction(filterOptions));
    });
};
