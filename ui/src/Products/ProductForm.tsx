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

import React, {ChangeEvent, CSSProperties, useState} from 'react';
import {GlobalStateProps} from '../Redux/Reducers';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {closeModalAction, setAllGroupedTagFilterOptions} from '../Redux/Actions';
import {JSX} from '@babel/types';
import {StylesConfig} from 'react-select';
import moment from 'moment';
import ProductClient from './ProductClient';
import {emptyProduct, Product} from './Product';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {reactSelectStyles} from '../ReusableComponents/ReactSelectStyles';
import {ProductTag} from '../ProductTag/ProductTag';
import {FilterOption} from '../CommonTypes/Option';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {Trait} from '../Traits/Trait';
import {Space} from '../SpaceDashboard/Space';
import ProductFormLocationField from './ProductFormLocationField';
import ProductFormProductTagsField from './ProductFormProductTagsField';
import ProductFormStartDateField from './ProductFormStartDateField';
import ProductFormEndDateField from './ProductFormEndDateField';

import 'react-datepicker/dist/react-datepicker.css';
import '../Modal/Form.scss';
import './ProductForm.scss';

export const customStyles: StylesConfig = {
    ...reactSelectStyles,
    valueContainer: (provided: CSSProperties) => ({
        ...provided,
        padding: '0px 3px',
    }),
    multiValue: (provided: CSSProperties) => ({
        ...provided,
        alignItems: 'center',
        backgroundColor: '#F2E7F3',
        fontFamily: 'Helvetica, sans-serif',
        borderRadius: '6px',
        height: '22px',
        marginRight: '3px',
    }),
};

interface ProductFormProps {
    editing: boolean;
    product?: Product;
    spaceId: number;
    viewingDate: string;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
    closeModal(): void;
}

function ProductForm({
    editing,
    product,
    spaceId,
    viewingDate,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
    closeModal,
}: ProductFormProps): JSX.Element {
    const [currentProduct, setCurrentProduct] = useState<Product>(initializeProduct());
    const [selectedProductTags, setSelectedProductTags] = useState<Array<ProductTag>>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

    const [duplicateProductNameWarning, setDuplicateProductNameWarning] = useState<boolean>(false);
    const [notesFieldLength, setNotesFieldLength] = useState<number>(product && product.notes ? product.notes.length : 0);

    function initializeProduct(): Product {
        if (product == null) {
            return {...emptyProduct(spaceId), startDate: viewingDate};
        }
        return product;
    }

    // Put the selected product tags on the updated product and use the 'editProduct' endpoint
    function handleSubmit(): void {
        currentProduct.productTags = selectedProductTags;

        if (editing) {
            ProductClient.editProduct(currentProduct)
                .then(closeModal)
                .catch(error => {
                    if (error.response.status === 409) {
                        setDuplicateProductNameWarning(true);
                    }
                });

        } else {
            ProductClient.createProduct(currentProduct)
                .then(() => setDuplicateProductNameWarning(false))
                .then(closeModal)
                .catch(error => {
                    if (error.response.status === 409) {
                        setDuplicateProductNameWarning(true);
                    }
                });
        }
    }

    async function deleteProduct(): Promise<void> {
        return ProductClient.deleteProduct(currentProduct).then(closeModal);
    }

    function archiveProduct(): Promise<void> {
        const archivedProduct = {...currentProduct, endDate: moment(viewingDate).subtract(1, 'day').format('YYYY-MM-DD')};
        return ProductClient.editProduct(archivedProduct).then(closeModal);
    }

    function displayDeleteProductModal(): void {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: deleteProduct,
            canArchive: true,
            close: () => {
                setConfirmDeleteModal(null);
            },
            archiveCallback: archiveProduct,
            isArchived: currentProduct.archived,
            warningMessage: 'Deleting this product will permanently remove it from this board.',
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    }

    function updateProductField(fieldName: string, fieldValue: any): void {
        const updatedProduct: Product = {...currentProduct, [fieldName]: fieldValue};
        setCurrentProduct(updatedProduct);
    }

    function addGroupedTagFilterOptions(tagFilterIndex: number, trait: Trait): void {
        const addedFilterOption: FilterOption = {
            label: trait.name,
            value: trait.id.toString() + '_' + trait.name,
            selected: false,
        };
        const updatedTagFilterOptions: AllGroupedTagFilterOptions =  {
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

    function notesChanged(e: ChangeEvent<HTMLTextAreaElement>): void {
        updateProductField('notes', e.target.value);
        setNotesFieldLength(e.target.value.length);
    }

    return (
        <div className="formContainer">
            <form className="form" data-testid="productForm">
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="name">Name</label>
                    <input className="formInput formTextInput"
                        data-testid="productFormNameField"
                        type="text"
                        name="name"
                        id="name"
                        value={currentProduct.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => updateProductField('name', e.target.value)}
                        placeholder="e.g. Product 1"
                        autoFocus/>
                    {duplicateProductNameWarning &&
                    <span className="personNameWarning">A product with this name already exists. Please enter a different name.</span>}
                </div>
                <ProductFormLocationField
                    spaceId={spaceId}
                    currentProductState={{ currentProduct, setCurrentProduct }}
                    loadingState={{ isLoading, setIsLoading }}
                    addGroupedTagFilterOptions={addGroupedTagFilterOptions}
                />
                <ProductFormProductTagsField
                    spaceId={spaceId}
                    currentProductState={{ currentProduct }}
                    loadingState={{ isLoading, setIsLoading }}
                    selectedProductTagsState={{ selectedProductTags, setSelectedProductTags }}
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
                    <label className="formItemLabel" htmlFor="notes">Notes</label>
                    <textarea
                        data-testid="productFormNotesField"
                        className="formInput formTextInput notes"
                        id="notes"
                        name="notes"
                        value={currentProduct.notes}
                        onChange={notesChanged}
                        rows={4}
                        cols={25}>
                        {currentProduct.notes}
                    </textarea>
                    <span className="notesFieldText" data-testid="notesFieldText">
                        <span
                            className={notesFieldLength > 500 ? 'notesFieldTooLong' : ''}>
                            {notesFieldLength}</span>
                        &nbsp;(500 characters max)
                    </span>
                </div>
                <div className="yesNoButtons">
                    <input className="formButton cancelFormButton" onClick={closeModal} data-testid="productFormCancelButton" type="button" value="Cancel" />
                    <input className="formButton"
                        data-testid="productFormSubmitButton"
                        onClick={handleSubmit}
                        type="button"
                        disabled={notesFieldLength > 500}
                        value={editing ? 'Save' : 'Create'}/>
                </div>
                {editing && (<div className={'deleteButtonContainer alignSelfCenter deleteLinkColor'}>
                    <i className="fas fa-trash"/>
                    <div className="trashCanSpacer"/>
                    <a className="obliterateLink"
                        onClick={displayDeleteProductModal}>Delete Product</a>
                </div>)}
            </form>
            {confirmDeleteModal}
        </div>
    );
}
const mapStateToProps = (state: GlobalStateProps) => ({
    viewingDate: moment(state.viewingDate).format('YYYY-MM-DD'),
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptions(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductForm);
