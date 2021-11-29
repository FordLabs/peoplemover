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

import {connect} from 'react-redux';
import {closeModalAction} from '../Actions';
import Modal from '../../Modal/Modal';
import {Dispatch} from 'redux';
import React from 'react';
import moment from 'moment';
import ProductForm from '../../Products/ProductForm';
import PersonForm from '../../People/PersonForm';
import AssignmentForm from '../../Assignments/AssignmentForm';
import AssignmentExistsWarning from '../../Assignments/AssignmentExistsWarning';
import {GlobalStateProps} from '../Reducers';
import {CurrentModalState} from '../Reducers/currentModalReducer';
import MyTagsForm from '../../Tags/MyTagsForm';
import MyRolesForm from '../../Roles/MyRolesForm';
import {emptyProduct, Product} from '../../Products/Product';
import {Space} from '../../Space/Space';
import SpaceForm from '../../SpaceDashboard/SpaceForm';
import GrantEditAccessConfirmationForm from '../../AccountDropdown/GrantEditAccessConfirmationForm';
import InviteEditorsFormSection from '../../AccountDropdown/InviteEditorsFormSection';
import ViewOnlyAccessFormSection from '../../AccountDropdown/ViewOnlyAccessFormSection';
import {FilterTypeListings} from '../../SortingAndFiltering/FilterLibraries';
import {AvailableModals} from '../../Modal/AvailableModals';
import DeleteSpaceForm from "../../SpaceDashboard/DeleteSpaceForm";
import TransferOwnershipForm from "../../SpaceDashboard/TransferOwnershipForm";

export interface ModalMetadataItem {
    title: string;
    form: JSX.Element;
}

const getCurrentModalMetadata = (currentModal: CurrentModalState, products: Array<Product>, currentSpace: Space, viewingDate: Date): Array<ModalMetadataItem> | null => {
    const {modal, item} = currentModal;

    switch (modal) {
        case AvailableModals.CREATE_PRODUCT:
            return [{title:`Add New Product`, form: <ProductForm editing={false}/>}];
        case AvailableModals.CREATE_PRODUCT_OF_PRODUCT_TAG: {
            const newProduct = {
                ...emptyProduct(currentSpace.uuid),
                startDate: moment(viewingDate).format('YYYY-MM-DD'),
                productTags: [item],
            };
            return [{
                title: 'Add New Product',
                form: <ProductForm
                    editing={false}
                    product={newProduct}/>,
            }];
        }
        case AvailableModals.CREATE_PRODUCT_OF_LOCATION: {
            const newProduct = {
                ...emptyProduct(currentSpace.uuid),
                startDate: moment(viewingDate).format('YYYY-MM-DD'),
                spaceLocation: {...item},
            };
            return [{
                title: 'Add New Product',
                form: <ProductForm
                    editing={false}
                    product={newProduct}/>,
            }];
        }
        case AvailableModals.EDIT_PRODUCT:
            return [{
                title: 'Edit Product',
                form: <ProductForm
                    editing
                    product={item}/>,
            }];
        case AvailableModals.CREATE_PERSON:
            return [{
                title:`Add New Person`,
                form: <PersonForm
                    isEditPersonForm={false}
                    products={products}
                    initiallySelectedProduct={item ? item.initiallySelectedProduct : undefined}
                    initialPersonName={item ? item.initialPersonName : ''}/>,
            }];
        case AvailableModals.EDIT_PERSON:
            return [{
                title: 'Edit Person',
                form: <PersonForm
                    isEditPersonForm
                    personEdited={item}
                    products={products}/>,
            }];
        case AvailableModals.CREATE_ASSIGNMENT:
            return [{
                title: 'Assign a Person',
                form: <AssignmentForm
                    products={products}
                    initiallySelectedProduct={item}/>,
            }];
        case AvailableModals.ASSIGNMENT_EXISTS_WARNING:
            return [{title: 'Uh-oh', form: <AssignmentExistsWarning/>}];
        case AvailableModals.MY_LOCATION_TAGS:
            const location = FilterTypeListings.Location;
            return [{title: location.label, form: <MyTagsForm filterType={location}/> }];
        case AvailableModals.MY_PRODUCT_TAGS:
            const productTags = FilterTypeListings.ProductTag;
            return [{title: productTags.label, form: <MyTagsForm filterType={productTags}/> }];
        case AvailableModals.MY_PERSON_TAGS:
            const personTags = FilterTypeListings.PersonTag;
            return [{title: personTags.label, form: <MyTagsForm filterType={personTags}/> }];
        case AvailableModals.MY_ROLES_MODAL:
            return [{title: 'My Roles', form: <MyRolesForm/>}];
        case AvailableModals.CREATE_SPACE:
            return [{title: 'Create New Space', form: <SpaceForm/>}];
        case AvailableModals.EDIT_SPACE:
            return [{title: 'Edit Space', form: <SpaceForm space={item}/>}];
        case AvailableModals.SHARE_SPACE_ACCESS:
            return [
                {title: 'Invite others to view', form: <ViewOnlyAccessFormSection/>},
                {title: 'Invite others to edit', form: <InviteEditorsFormSection space={item}/>},
            ];
        case AvailableModals.TRANSFER_OWNERSHIP:
            return [
                {title: 'Transfer Ownership of Space', form: <TransferOwnershipForm space={item}/>},
            ];
        case AvailableModals.GRANT_EDIT_ACCESS_CONFIRMATION:
            return [{
                title: 'Your team member now has access!',
                form: <GrantEditAccessConfirmationForm />,
            }];
        case AvailableModals.DELETE_SPACE:
            return[{
                title: "Are you sure?",
                form: <DeleteSpaceForm space={item} spaceHasEditors={true}/>
            }];
        case AvailableModals.DELETE_SPACE_NO_EDITORS:
            return[{
                title:"Are you for real?",
                form: <DeleteSpaceForm space={item} spaceHasEditors={false}/>
            }]
        default:
            return null;
    }
};

const mapStateToProps = (state: GlobalStateProps) => ({
    modalMetadata: getCurrentModalMetadata(state.currentModal, state.products, state.currentSpace, state.viewingDate),
});

const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modal);

