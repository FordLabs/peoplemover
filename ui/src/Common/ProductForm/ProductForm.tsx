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

import React, {ChangeEvent, FormEvent, useState} from 'react';
import {JSX} from '@babel/types';
import moment from 'moment';
import ProductClient from 'Services/Api/ProductClient';
import {emptyProduct} from 'Services/ProductService';
import ConfirmationModal, {ConfirmationModalProps} from 'Modal/ConfirmationModal/ConfirmationModal';
import {Tag} from 'Types/Tag';
import ProductFormLocationField from './ProductFormFields/ProductFormLocationField';
import ProductFormStartDateField from './ProductFormFields/ProductFormStartDateField';
import ProductFormEndDateField from './ProductFormFields/ProductFormEndDateField';
import FormNotesTextArea from 'Common/FormNotesTextArea/FormNotesTextArea';
import FormButton from 'Common/FormButton/FormButton';
import 'react-datepicker/dist/react-datepicker.css';
import './ProductForm.scss';
import {MetadataReactSelectProps} from 'Common/SelectWithCreateOption/SelectWithCreateOption';
import ProductTagClient from 'Services/Api/ProductTagClient';
import FormTagsField from 'Common/FormTagsField/FormTagsField';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {ModalContentsState} from 'State/ModalContentsState';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {Product} from 'Types/Product';

interface Props {
    editing: boolean;
    product?: Product;
}

function ProductForm({ editing, product }: Props): JSX.Element {
    const viewingDate = useRecoilValue(ViewingDateState);
    const setModalContents = useSetRecoilState(ModalContentsState);
    const currentSpace = useRecoilValue(CurrentSpaceState);

    const [currentProduct, setCurrentProduct] = useState<Product>(initializeProduct(viewingDate));
    const [selectedProductTags, setSelectedProductTags] = useState<Array<Tag>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

    const duplicateProductNameWarningMessage = 'A product with this name already exists. Please enter a different name.';
    const emptyProductNameWarningMessage = 'Please enter a product name.';
    const [nameWarningMessage, setNameWarningMessage] = useState<string>('');

    const closeModal = () => setModalContents(null);

    function initializeProduct(startDate = new Date()): Product {
        const returnProduct = {
            ...emptyProduct(currentSpace.uuid),
            ...product,
        }
        if(returnProduct.startDate === '') {
            returnProduct.startDate = moment(startDate).format('YYYY-MM-DD');
        }
        return returnProduct;
    }

    function handleSubmit(event: FormEvent): void {
        event.preventDefault();

        setNameWarningMessage('');

        if (!currentSpace.uuid) {
            console.error('No current space uuid');
            return;
        }

        if (currentProduct.name.trim() === '') {
            setNameWarningMessage(emptyProductNameWarningMessage);
            return;
        }

        const productToSend = {
            ...currentProduct,
            name: currentProduct.name.trim(),
            url: currentProduct.url?.trim(),
            notes: currentProduct.notes?.trim(),
            tags: selectedProductTags
        };

        if (editing) {
            ProductClient.editProduct(currentSpace, productToSend)
                .then(closeModal)
                .catch(error => {
                    if (error.response.status === 409) {
                        setNameWarningMessage(duplicateProductNameWarningMessage);
                    }
                });

        } else {
            ProductClient.createProduct(currentSpace, productToSend)
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
        return moment(product.endDate).isBefore(moment(viewingDate));
    }

    function displayDeleteProductModal(): void {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: deleteProduct,
            close: () => {
                setConfirmDeleteModal(null);
            },
            secondaryButton: determineIfProductIsArchived() ? undefined : (
                <FormButton
                    buttonStyle="secondary"
                    testId="confirmationModalArchive"
                    onClick={archiveProduct}>
                    Archive
                </FormButton>),
            content: (
                <>
                    <div>Deleting this product will permanently remove it from this space.</div>
                    {determineIfProductIsArchived() ? <></> : <div><br/>You can also choose to archive this product to be able to access it later.</div>}
                </>
            ),
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

    function notesChanged(notes: string): void {
        updateProductField('notes', notes);
    }

    return currentSpace.uuid ? (
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
                    {nameWarningMessage && (
                        <span data-testid="productNameWarningMessage" className="productNameWarning">
                            {nameWarningMessage}
                        </span>
                    )}
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="url">Product Page URL</label>
                    <input className="formInput formTextInput"
                        data-testid="productFormUrlField"
                        type="text"
                        name="url"
                        id="url"
                        value={currentProduct.url}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => updateProductField('url', e.target.value)}
                        placeholder="e.g. https://www.fordlabs.com"/>
                </div>
                <ProductFormLocationField
                    currentProductState={{currentProduct, setCurrentProduct}}
                    loadingState={{isLoading, setIsLoading}}
                />
                <FormTagsField
                    currentTagsState={{currentTags: currentProduct.tags}}
                    loadingState={{isLoading, setIsLoading}}
                    selectedTagsState={{selectedTags: selectedProductTags, setSelectedTags: setSelectedProductTags}}
                    tagClient={ProductTagClient}
                    tagsMetadata={MetadataReactSelectProps.PRODUCT_TAGS}
                />
                <ProductFormStartDateField
                    currentProduct={currentProduct}
                    updateProductField={updateProductField}
                />
                <ProductFormEndDateField
                    currentProduct={currentProduct}
                    updateProductField={updateProductField}
                />
                <FormNotesTextArea
                    note={currentProduct.notes}
                    onChange={notesChanged}
                />
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
            </form>
            {editing && (
                <button className={'deleteButtonContainer alignSelfCenter deleteLinkColor'}
                    data-testid="deleteProduct"
                    onClick={displayDeleteProductModal}
                >
                    <i className="material-icons" aria-hidden>delete</i>
                    <div className="trashCanSpacer"/>
                    <span className="obliterateLink">Delete Product</span>
                </button>)}
            {confirmDeleteModal}
        </div>
    ) : <></>;
}

export default ProductForm;

