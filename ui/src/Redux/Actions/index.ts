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
import {RoleTag} from '../../Roles/RoleTag.interface';
import RoleClient from '../../Roles/RoleClient';
import sortTagsAlphabetically from '../../Tags/sortTagsAlphabetically';
import PeopleClient from '../../People/PeopleClient';

export enum AvailableActions {
    SET_CURRENT_MODAL,
    CLOSE_MODAL,
    ADD_PERSON,
    EDIT_PERSON,
    SET_PEOPLE,
    REGISTER_PRODUCT_REF,
    UNREGISTER_PRODUCT_REF,
    SET_ALL_FILTER_OPTIONS,
    SET_CURRENT_SPACE,
    SET_PRODUCTS,
    SET_PRODUCT_TAGS,
    SET_PERSON_TAGS,
    SET_LOCATIONS,
    SET_ROLES,
    SET_USER_SPACES,
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

export const setRolesAction = (roles: Array<RoleTag>) => ({
    type: AvailableActions.SET_ROLES,
    roles,
});

export const setUserSpacesAction = (userSpaces: Array<Space>) => ({
    type: AvailableActions.SET_USER_SPACES,
    userSpaces,
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

export const fetchProductsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = (viewingDate: Date) =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return ProductClient.getProductsForDate(getState().currentSpace.uuid, viewingDate)
            .then(result => {
                const products: Array<Product> = result.data || [];
                dispatch(setProductsAction(products));
            });
    };

export const fetchPeopleAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () => (dispatch: Dispatch, getState: Function): Promise<void> => {
    return PeopleClient.getAllPeopleInSpace(getState().currentSpace.uuid).then(result => {
        const people: Array<Person> = result.data || [];
        dispatch(setPeopleAction(people));
    })
}

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

export const fetchLocationsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return LocationClient.get(getState().currentSpace.uuid,)
            .then(result => {
                const locations: Array<LocationTag> = result.data || [];
                sortTagsAlphabetically(locations);
                dispatch(setLocationsAction(locations));
            });
    };

export const fetchRolesAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return RoleClient.get(getState().currentSpace.uuid,)
            .then(result => {
                const roles: Array<RoleTag> = result.data || [];
                sortTagsAlphabetically(roles);
                dispatch(setRolesAction(roles));
            });
    };

export const setupSpaceAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = (space: Space) =>
    (dispatch: Dispatch): Promise<void> => {
        dispatch(setCurrentSpaceAction(space));
        return getFilterOptionsForSpace(space.uuid!).then((filterOptions: Array<AllGroupedTagFilterOptions>) => {
            dispatch(setAllGroupedTagFilterOptionsAction(filterOptions));
        });
    };
