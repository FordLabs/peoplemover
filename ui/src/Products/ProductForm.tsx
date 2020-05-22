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

import React, {ChangeEvent, CSSProperties, useEffect, useState} from 'react';
import ProductClient from './ProductClient';

import '../Modal/Form.scss';
import './ProductForm.scss';

import LocationClient from '../Locations/LocationClient';
import {closeModalAction, setAllGroupedTagFilterOptions} from '../Redux/Actions';
import {connect} from 'react-redux';
import {JSX} from '@babel/types';
import {emptyProduct, Product} from './Product';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {CreateNewText, CustomIndicator, CustomOption, reactSelectStyles} from '../ReusableComponents/ReactSelectStyles';
import Creatable from 'react-select/creatable';
import {ProductTag} from '../ProductTag/ProductTag';
import ProductTagClient from '../ProductTag/ProductTagClient';
import {AxiosResponse} from 'axios';
import {SpaceLocation} from '../Locations/SpaceLocation';
import {FilterOption, Option} from '../CommonTypes/Option';
import {TraitAddRequest} from '../Traits/TraitAddRequest';
import {GlobalStateProps} from '../Redux/Reducers';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {Trait} from '../Traits/Trait';
import {StylesConfig} from 'react-select';
import {Dispatch} from 'redux';

interface ProductFormProps {
    editing: boolean;
    product?: Product;
    spaceId: number;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
    closeModal(): void;
}

function ProductForm({
    editing,
    product,
    spaceId,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
    closeModal,
}: ProductFormProps): JSX.Element {

    const customStyles: StylesConfig = {
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

    const [currentProduct, setCurrentProduct] = useState<Product>(initializeProduct());

    const [availableLocations, setAvailableLocations] = useState<SpaceLocation[]>([]);
    const [availableProductTags, setAvailableProductTags] = useState<Array<ProductTag>>([]);

    const [selectedProductTags, setSelectedProductTags] = useState<Array<ProductTag>>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

    const [duplicateProductNameWarning, setDuplicateProductNameWarning] = useState<boolean>(false);
    const [notesFieldLength, setNotesFieldLength] = useState<number>(product && product.notes ? product.notes.length : 0);
    const [typedInProductTag, setTypedInProductTag] = useState<string>('');

    const [typedInLocation, setTypedInLocation] = useState<string>('');

    useEffect(() => {

        LocationClient.get().then(result => {
            setAvailableLocations(result.data);
        });
        ProductTagClient.get().then(result => setAvailableProductTags(result.data));

        setSelectedProductTags(currentProduct.productTags);

    }, []);

    function initializeProduct(): Product {
        if (product == null) {
            return emptyProduct(spaceId);
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
        const archivedProduct = {...currentProduct, archived: true};
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

    function updateSelectedProductTags(productTags: Array<ProductTag>): void {
        if (productTags.length > 0) {
            setSelectedProductTags([...productTags]);
        } else {
            setSelectedProductTags([]);
        }
    }

    function optionToProductTag(options: Array<Option>): Array<ProductTag> {
        if (options) {
            return options.map(option => {
                return {
                    id: Number.parseInt(option.value, 10),
                    name: option.label,
                    spaceId,
                };
            });
        } else {
            return [];
        }
    }

    function optionToSpaceLocation(option: Option): SpaceLocation {
        return {
            id: Number.parseInt(option.value, 10),
            name: option.label,
            spaceId,
        };
    }

    function createLocationOption(location: SpaceLocation): Option {
        return {
            label: location.name,
            value: location.id!.toString(),
        };
    }

    function createTagOption(label: string, value: number): Option {
        return {
            label: label,
            value: value.toString(),
        };
    }

    function locationOptions(): Option[] {
        return availableLocations.map(location => createLocationOption(location));
    }

    function handleCreateProductTag(inputValue: string): void {
        setIsLoading(true);
        const productTag: TraitAddRequest = {
            name: inputValue,
        };
        ProductTagClient.add(productTag).then((response: AxiosResponse) => {
            const newProductTag: ProductTag = response.data;
            setAvailableProductTags(productTags => [...productTags, {
                id: newProductTag.id,
                name: newProductTag.name,
            }] as Array<ProductTag>);
            addGroupedTagFilterOptions(1, newProductTag as Trait);
            updateSelectedProductTags([...selectedProductTags, newProductTag]);
            setIsLoading(false);
        });
    }

    function handleCreateLocationTag(inputValue: string): void {
        setIsLoading(true);

        const location: TraitAddRequest = {
            name: inputValue,
        };
        LocationClient.add(location).then((result: AxiosResponse) => {
            const newLocation: SpaceLocation = result.data;
            setAvailableLocations([...availableLocations, newLocation]);
            addGroupedTagFilterOptions(0, newLocation as Trait);
            setCurrentProduct({
                ...currentProduct,
                spaceLocation: newLocation,
            });
            setIsLoading(false);
        });
    }

    function addGroupedTagFilterOptions(tagFilterIndex: number, trait: Trait): void {
        const addedFilterOption: FilterOption = {
            label: trait.name,
            value: trait.id.toString(),
            selected: false,
        };
        const updatedTagFilterOptions: AllGroupedTagFilterOptions =  {
            ...allGroupedTagFilterOptions[tagFilterIndex],
            options: [
                ...allGroupedTagFilterOptions[tagFilterIndex].options,
                addedFilterOption,
            ],
        };

        let groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
        if (tagFilterIndex === 0) {
            groupedTagFilterOptions = [
                updatedTagFilterOptions,
                allGroupedTagFilterOptions[1],
            ];
        } else {
            groupedTagFilterOptions = [
                allGroupedTagFilterOptions[0],
                updatedTagFilterOptions,
            ];
        }
        setAllGroupedTagFilterOptions(groupedTagFilterOptions);
    }

    function locationOptionValue(): Option | undefined {
        if (currentProduct.spaceLocation && currentProduct.spaceLocation.name !== '') {
            return createLocationOption(currentProduct.spaceLocation);
        }

        return undefined;
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
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="location">Location</label>
                    <Creatable
                        name="location"
                        inputId="location"
                        onInputChange={(e: string): void => setTypedInLocation(e)}
                        onChange={(e): void  => updateProductField('spaceLocation', optionToSpaceLocation(e as Option))}
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        onCreateOption={handleCreateLocationTag}
                        options={locationOptions()}
                        styles={customStyles}
                        components={{DropdownIndicator: CustomIndicator, Option: CustomOption}}
                        formatCreateLabel={(): JSX.Element => CreateNewText(`Create "${typedInLocation}"`)}
                        placeholder="Select or create location"
                        hideSelectedOptions={true}
                        isClearable={false}
                        value={locationOptionValue()}
                    />
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="productTags">Product Tags</label>
                    <Creatable
                        isMulti={true}
                        name="productTags"
                        inputId="productTags"
                        onInputChange={(e: string): void => setTypedInProductTag(e)}
                        onChange={(e): void => updateSelectedProductTags(optionToProductTag(e as Option[]))}
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        onCreateOption={handleCreateProductTag}
                        options={availableProductTags.map((productTag: ProductTag) => createTagOption(productTag.name, productTag.id))}
                        styles={customStyles}
                        value={selectedProductTags.map(productTag => createTagOption(productTag.name, productTag.id))}
                        components={{DropdownIndicator: CustomIndicator, Option: CustomOption}}
                        formatCreateLabel={(): JSX.Element => CreateNewText(`Create "${typedInProductTag}"`)}
                        placeholder="Select or create product tags"
                        hideSelectedOptions={true}
                        isClearable={false}
                    />
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="start">Start Date</label>
                    <input className="formInput formTextInput"
                        type="date"
                        name="start"
                        id="start"
                        value={currentProduct.startDate ? currentProduct.startDate : ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void  => updateProductField('startDate', e.target.value)}/>
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="end">Next Phase Date</label>
                    <input className="formInput formTextInput"
                        type="date"
                        name="end"
                        id="end"
                        value={currentProduct.endDate ? currentProduct.endDate : ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void  => updateProductField('endDate', e.target.value)}/>
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="dorf">Dorf</label>
                    <input className="formInput formTextInput"
                        type="text"
                        name="dorf"
                        id="dorf"
                        value={currentProduct.dorf}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void  => updateProductField('dorf', e.target.value)}/>
                </div>
                {editing && (
                    <div className="formItem inlineLabelContainer">
                        <input className="formInput checkbox"
                            type="checkbox"
                            name="archived"
                            id="archived"
                            checked={currentProduct.archived}
                            onChange={(e: ChangeEvent<HTMLInputElement>): void  => updateProductField('archived', e.target.checked)}/>
                        <label className="formItemLabel nomargin"
                            htmlFor="archived">Archived</label>
                    </div>
                )}
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="notes">Notes</label>
                    <textarea
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
                    <button className="formButton cancelFormButton" onClick={closeModal}>Cancel</button>
                    <input className="formButton"
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
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptions(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductForm);
