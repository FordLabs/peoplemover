/*
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

import {connect} from 'react-redux';
import {AvailableModals, closeModalAction} from '../Actions';
import Modal from '../../Modal/Modal';
import {Dispatch} from 'redux';
import React from 'react';
import ProductForm from '../../Products/ProductForm';
import PersonForm from '../../People/PersonForm';
import AssignmentForm from '../../Assignments/AssignmentForm';
import AssignmentExistsWarning from '../../Assignments/AssignmentExistsWarning';
import {GlobalStateProps} from '../Reducers';
import {CurrentModalState} from '../Reducers/currentModalReducer';
import MyTagsForm from '../../Tags/MyTagsForm';
import MyRolesForm from '../../Roles/MyRolesForm';
import InviteContributorConfirmationForm from '../../AccountDropdown/InviteContributorsConfirmationForm';
import EditContributorsForm from '../../AccountDropdown/EditContributorsForm';
import {emptyProduct, Product} from '../../Products/Product';
import {Space} from '../../Space/Space';
import moment from 'moment';
import SpaceForm from '../../SpaceDashboard/SpaceForm';

const getCurrentModal = (currentModal: CurrentModalState, products: Array<Product>, currentSpace: Space, viewingDate: Date): JSX.Element | null => {
    const {modal, item} = currentModal;

    switch (modal) {
        case AvailableModals.CREATE_PRODUCT:
            return <ProductForm editing={false} />;
        case AvailableModals.CREATE_PRODUCT_OF_PRODUCT_TAG: {
            const newProduct = {
                ...emptyProduct(currentSpace.id),
                startDate: moment(viewingDate).format('YYYY-MM-DD'),
                productTags: [item],
            };
            return <ProductForm editing={false}
                product={newProduct}/>;
        }
        case AvailableModals.CREATE_PRODUCT_OF_LOCATION: {
            const newProduct = {
                ...emptyProduct(currentSpace.id),
                startDate: moment(viewingDate).format('YYYY-MM-DD'),
                spaceLocation: {...item},
            };
            return <ProductForm editing={false}
                product={newProduct}/>;
        }
        case AvailableModals.EDIT_PRODUCT:
            return <ProductForm editing={true}
                product={item} />;
        case AvailableModals.CREATE_PERSON:
            return <PersonForm editing={false}
                products={products}
                initiallySelectedProduct={item ? item.initiallySelectedProduct : undefined}
                initialPersonName={item ? item.initialPersonName : ''}/>;
        case AvailableModals.EDIT_PERSON:
            return <PersonForm editing={true}
                assignment={item}
                products={products}/>;
        case AvailableModals.CREATE_ASSIGNMENT:
            return <AssignmentForm
                products={products}
                initiallySelectedProduct={item}/>;
        case AvailableModals.ASSIGNMENT_EXISTS_WARNING:
            return <AssignmentExistsWarning/>;
        case AvailableModals.MY_TAGS:
            return <MyTagsForm/>;
        case AvailableModals.MY_ROLES_MODAL:
            return <MyRolesForm/>;
        case AvailableModals.CREATE_SPACE:
            return <SpaceForm/>;
        case AvailableModals.EDIT_SPACE:
            return <SpaceForm space={item}/>;
        case AvailableModals.EDIT_CONTRIBUTORS:
            return <EditContributorsForm/>;
        case AvailableModals.CONTRIBUTORS_CONFIRMATION:
            return <InviteContributorConfirmationForm />;
        default:
            return null;
    }
};

const getCurrentTitle = (currentModal: CurrentModalState): string => {
    const {modal} = currentModal;

    switch (modal) {
        case AvailableModals.CREATE_PRODUCT:
            return 'Create New Product';
        case AvailableModals.EDIT_PRODUCT:
            return 'Edit Product';
        case AvailableModals.CREATE_PERSON:
            return 'Create New Person';
        case AvailableModals.EDIT_PERSON:
            return 'Edit Person';
        case AvailableModals.CREATE_ASSIGNMENT:
            return 'Assign a Person';
        case AvailableModals.ASSIGNMENT_EXISTS_WARNING:
            return 'Uh-oh';
        case AvailableModals.MY_TAGS:
            return 'My Tags';
        case AvailableModals.MY_ROLES_MODAL:
            return 'My Roles';
        case AvailableModals.CREATE_SPACE:
            return 'Create New Space';
        case AvailableModals.EDIT_SPACE:
            return 'Edit Space';
        case AvailableModals.EDIT_CONTRIBUTORS:
            return 'Share Access';
        case AvailableModals.CONTRIBUTORS_CONFIRMATION:
            return 'Your team member now has access!';
        default:
            return '';
    }
};

const mapStateToProps = (state: GlobalStateProps) => ({
    modalForm: getCurrentModal(state.currentModal, state.products, state.currentSpace, state.viewingDate),
    title: getCurrentTitle(state.currentModal),
    viewingDate: state.viewingDate,
});

const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
