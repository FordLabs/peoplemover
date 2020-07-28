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

import {Person} from '../../People/Person';
import {EditMenuToOpen} from '../../ReusableComponents/EditMenuToOpen';
import {CurrentModalState} from '../Reducers/currentModalReducer';
import {ProductCardRefAndProductPair} from '../../Products/ProductDnDHelper';
import {Action, ActionCreator, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {AllGroupedTagFilterOptions} from '../../ReusableComponents/ProductFilter';
import {Space} from '../../SpaceDashboard/Space';
import {Product} from '../../Products/Product';
import ProductClient from '../../Products/ProductClient';
import {ProductTag} from '../../ProductTag/ProductTag';
import ProductTagClient from '../../ProductTag/ProductTagClient';

export enum AvailableActions {
    SET_CURRENT_MODAL,
    CLOSE_MODAL,
    SET_IS_UNASSIGNED_DRAWER_OPEN,
    SET_WHICH_EDIT_MENU_OPEN,
    ADD_PERSON,
    EDIT_PERSON,
    SET_PEOPLE,
    REGISTER_PRODUCT_REF,
    UNREGISTER_PRODUCT_REF,
    SET_GROUPED_TAG_FILTER_OPTIONS,
    SET_CURRENT_SPACE,
    SET_VIEWING_DATE,
    SET_PRODUCTS,
    SET_PRODUCT_TAGS,
    SET_PRODUCT_SORT_BY,
}

export enum AvailableModals {
    CREATE_PRODUCT,
    EDIT_PRODUCT,
    CREATE_PERSON,
    EDIT_PERSON,
    CREATE_ASSIGNMENT,
    ASSIGNMENT_EXISTS_WARNING,
    MY_TAGS,
    MY_ROLES_MODAL,
    CREATE_SPACE,
    EDIT_CONTRIBUTORS,
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

export const setWhichEditMenuOpenAction = (menu: EditMenuToOpen) => ({
    type: AvailableActions.SET_WHICH_EDIT_MENU_OPEN,
    menu,
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

export const setAllGroupedTagFilterOptions = (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) => ({
    type: AvailableActions.SET_GROUPED_TAG_FILTER_OPTIONS,
    allGroupedTagFilterOptions: allGroupedTagFilterOptions,
});

export const setCurrentSpaceAction = (space: Space) => ({
    type: AvailableActions.SET_CURRENT_SPACE,
    space,
});

export const setViewingDateAction = (date: Date) => ({
    type: AvailableActions.SET_VIEWING_DATE,
    date,
});

export const setProductsAction = (products: Array<Product>) => ({
    type: AvailableActions.SET_PRODUCTS,
    products,
});

export const setProductTagsAction = (productTags: Array<ProductTag>) => ({
    type: AvailableActions.SET_PRODUCT_TAGS,
    productTags,
});

export const setProductSortByAction = (productSortBy: string) => ({
    type: AvailableActions.SET_PRODUCT_SORT_BY,
    productSortBy,
});

export const fetchProductsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return ProductClient.getProductsForDate(
            getState().currentSpace.id,
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
        return ProductTagClient.get(getState().currentSpace.name,)
            .then(result => {
                const productTags: Array<ProductTag> = result.data || [];
                dispatch(setProductTagsAction(productTags));
            });
    };
