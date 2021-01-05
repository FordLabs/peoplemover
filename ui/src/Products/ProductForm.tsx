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

import React, {ChangeEvent, FormEvent, useState} from 'react';
import {GlobalStateProps} from '../Redux/Reducers';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {closeModalAction, setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {JSX} from '@babel/types';
import moment from 'moment';
import ProductClient from './ProductClient';
import {emptyProduct, Product} from './Product';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {ProductTag} from '../ProductTag/ProductTag';
import {FilterOption} from '../CommonTypes/Option';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {Tag} from '../Tags/Tag.interface';
import ProductFormLocationField from './ProductFormLocationField';
import ProductFormProductTagsField from './ProductFormProductTagsField';
import ProductFormStartDateField from './ProductFormStartDateField';
import ProductFormEndDateField from './ProductFormEndDateField';
import FormNotesTextArea from '../ModalFormComponents/FormNotesTextArea';
import {Space} from '../Space/Space';
import FormButton from '../ModalFormComponents/FormButton';

import 'react-datepicker/dist/react-datepicker.css';
import './ProductForm.scss';

interface ProductFormProps {
    editing: boolean;
    product?: Product;
    currentSpace: Space;
    viewingDate: string;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;

    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
    closeModal(): void;
}

function ProductForm({
    editing,
    product,
    currentSpace,
    viewingDate,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
    closeModal,
}: ProductFormProps): JSX.Element {
    const [currentProduct, setCurrentProduct] = useState<Product>(initializeProduct());
    const [selectedProductTags, setSelectedProductTags] = useState<Array<ProductTag>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

    const duplicateProductNameWarningMessage = 'A product with this name already exists. Please enter a different name.';
    const emptyProductNameWarningMessage = 'Please enter a product name.';
    const [nameWarningMessage, setNameWarningMessage] = useState<string>('');

    function initializeProduct(): Product {
        if (product == null) {
            return {...emptyProduct(currentSpace.id), startDate: viewingDate};
        }
        return product;
    }

    function handleSubmit(event: FormEvent): void {
        event.preventDefault();

        setNameWarningMessage('');

        currentProduct.productTags = selectedProductTags;
        if (!currentSpace.uuid) {
            console.error('No current space uuid');
            return;
        }

        if (currentProduct.name.trim() === '') {
            setNameWarningMessage(emptyProductNameWarningMessage);
            return;
        }

        if (editing) {
            ProductClient.editProduct(currentSpace, currentProduct)
                .then(closeModal)
                .catch(error => {
                    if (error.response.status === 409) {
                        setNameWarningMessage(duplicateProductNameWarningMessage);
                    }
                });

        } else {
            ProductClient.createProduct(currentSpace, currentProduct)
                .then(closeModal)
                .catch(error => {
                    if (error.response.status === 409) {
                        setNameWarningMessage(duplicateProductNameWarningMessage);
                    }
                });
        }
    }

    async function deleteProduct(): Promise<void> {
        if (!currentSpace.uuid) {
            console.error('No current space uuid');
            return Promise.resolve();
        }
        return ProductClient.deleteProduct(currentSpace, currentProduct).then(closeModal);
    }

    function archiveProduct(): Promise<void> {
        if (!currentSpace.uuid) {
            console.error('No current space uuid');
            return Promise.resolve();
        }
        const archivedProduct = {...currentProduct, endDate: moment(viewingDate).subtract(1, 'day').format('YYYY-MM-DD')};
        return ProductClient.editProduct(currentSpace, archivedProduct).then(closeModal);
    }

    function determineIfProductIsArchived(): boolean {
        if (!product?.endDate) return false;
        return product.endDate < moment(viewingDate).format('YYYY-MM-DD');
    }

    function displayDeleteProductModal(): void {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: deleteProduct,
            canArchive: true,
            close: () => {
                setConfirmDeleteModal(null);
            },
            archiveCallback: archiveProduct,
            isArchived: determineIfProductIsArchived(),
            warningMessage: 'Deleting this product will permanently remove it from this space.',
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    }

    function updateProductField(fieldName: string, fieldValue: string): void {
        const updatedProduct: Product = {
            ...currentProduct,
            [fieldName]: fieldValue,
        };
        setCurrentProduct(updatedProduct);
    }

    function addGroupedTagFilterOptions(tagFilterIndex: number, trait: Tag): void {
        const addedFilterOption: FilterOption = {
            label: trait.name,
            value: trait.id.toString() + '_' + trait.name,
            selected: false,
        };
        const updatedTagFilterOptions: AllGroupedTagFilterOptions = {
            ...allGroupedTagFilterOptions[tagFilterIndex],
            options: [
                ...allGroupedTagFilterOptions[tagFilterIndex].options,
                addedFilterOption,
            ],
        };

        let groupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [...allGroupedTagFilterOptions];
        groupedTagFilterOptions[tagFilterIndex] = updatedTagFilterOptions;
        setAllGroupedTagFilterOptions(groupedTagFilterOptions);
    }

    function notesChanged(notes: string): void {
        updateProductField('notes', notes);
    }

    function handleKeyDownForDisplayDeleteProductModal(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            displayDeleteProductModal();
        }
    }

    return currentSpace.id ? (
        <div className="formContainer">
            <form className="form"
                data-testid="productForm"
                onSubmit={(event): void => handleSubmit(event)}>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="name">Name</label>
                    <input className="formInput formTextInput"
                        data-testid="productFormNameField"
                        type="text"
                        name="name"
                        id="name"
                        value={currentProduct.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => updateProductField('name', e.target.value)}
                        placeholder="e.g. Product 1"/>
                    {nameWarningMessage &&
                        <span data-testid="productNameWarningMessage" className="productNameWarning">
                            {nameWarningMessage}
                        </span>
                    }
                </div>
                <ProductFormLocationField
                    spaceId={currentSpace.id}
                    currentProductState={{currentProduct, setCurrentProduct}}
                    loadingState={{isLoading, setIsLoading}}
                    addGroupedTagFilterOptions={addGroupedTagFilterOptions}
                />
                <ProductFormProductTagsField
                    spaceId={currentSpace.id}
                    currentProductState={{currentProduct}}
                    loadingState={{isLoading, setIsLoading}}
                    selectedProductTagsState={{selectedProductTags, setSelectedProductTags}}
                    addGroupedTagFilterOptions={addGroupedTagFilterOptions}
                />
                <ProductFormStartDateField
                    currentProduct={currentProduct}
                    updateProductField={updateProductField}
                />
                <ProductFormEndDateField
                    currentProduct={currentProduct}
                    updateProductField={updateProductField}
                />
                <div className="formItem">
                    <FormNotesTextArea
                        notes={currentProduct.notes}
                        callBack={notesChanged}
                    />
                </div>
                <div className="yesNoButtons">
                    <FormButton
                        onClick={closeModal}
                        buttonStyle="secondary"
                        testId="productFormCancelButton">
                        Cancel
                    </FormButton>
                    <FormButton
                        type="submit"
                        buttonStyle="primary"
                        testId="productFormSubmitButton">
                        {editing ? 'Save' : 'Add'}
                    </FormButton>
                </div>
                {editing && (
                    <div className={'deleteButtonContainer alignSelfCenter deleteLinkColor'}>
                        <i className="material-icons">delete</i>
                        <div className="trashCanSpacer"/>
                        <span className="obliterateLink"
                            data-testid="deleteProduct"
                            onClick={displayDeleteProductModal}
                            onKeyDown={(e): void => handleKeyDownForDisplayDeleteProductModal(e)}>Delete Product</span>
                    </div>)}
            </form>
            {confirmDeleteModal}
        </div>
    ) : <></>;
}

/* eslint-disable  */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: moment(state.viewingDate).format('YYYY-MM-DD'),
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductForm);
/* eslint-enable  */
