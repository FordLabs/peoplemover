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

import React, {FormEvent, useState} from 'react';
import AssignmentClient from '../Assignments/AssignmentClient';
import MultiSelect from '../ReusableComponents/MultiSelect';
import {connect} from 'react-redux';
import {
    AvailableModals,
    closeModalAction,
    setCurrentModalAction,
} from '../Redux/Actions';
import {Person} from '../People/Person';
import {GlobalStateProps} from '../Redux/Reducers';
import {Product} from '../Products/Product';
import Creatable from 'react-select/creatable';
import {
    CreateNewText,
    CustomIndicator,
    CustomOption,
    reactSelectStyles,
} from '../ReusableComponents/ReactSelectStyles';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import './AssignmentForm.scss';
import {Option} from '../CommonTypes/Option';
import {Dispatch} from 'redux';
import {ProductPlaceholderPair} from './CreateAssignmentRequest';
import {Assignment} from './Assignment';
import moment from 'moment';
import FormButton from '../ModalFormComponents/FormButton';

interface AssignmentFormProps {
    products: Array<Product>;
    initiallySelectedProduct: Product;
    people: Array<Person>;
    viewingDate: Date;

    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
}

function AssignmentForm({
    products,
    initiallySelectedProduct,
    people,
    viewingDate,
    closeModal,
    setCurrentModal,
}: AssignmentFormProps): JSX.Element {
    const defaultPerson: Person = {id: -1, name: ''} as Person;
    const [typedInName, setTypedInName] = useState<string>(defaultPerson.name);
    const [selectedPerson, setSelectedPerson] = useState<Person>(defaultPerson);
    const [selectedProducts, setSelectedProducts] = useState<Array<Product>>(getSelectedProduct());
    const [placeholder, setPlaceholder] = useState<boolean>(false);

    function getSelectedProductPairs(): ProductPlaceholderPair[] {
        return selectedProducts.map((product) => {
            return {
                productId: product.id,
                placeholder: placeholder,
            } as ProductPlaceholderPair;
        });
    }

    function getExistingProductPairsForPerson(): ProductPlaceholderPair[] {
        const assignmentsForPerson: Assignment[] = [];

        products.forEach((product) => {
            product.assignments.forEach(assignmentForProduct => {
                if (assignmentForProduct.person.id === selectedPerson.id ) {
                    assignmentsForPerson.push(assignmentForProduct);
                }
            });
        });

        return assignmentsForPerson?.map(assignmentForPerson => {
            return {
                productId: assignmentForPerson.productId,
                placeholder: assignmentForPerson.placeholder,
            };
        });
    }

    function getProductPairsForPerson(): ProductPlaceholderPair[] {
        let allProductPairs: ProductPlaceholderPair [] = [];

        const selectedProductPairs: ProductPlaceholderPair[] = getSelectedProductPairs();
        const selectedProductIds: number[] = Array.from(selectedProductPairs.map(selectedProductPairs => {
            return selectedProductPairs.productId;
        }));

        const existingProductPairs = getExistingProductPairsForPerson();
        const existingProductPairsExcludingSelectedProductPairs = existingProductPairs.filter(existingProductPair => !selectedProductIds.includes(existingProductPair.productId));

        allProductPairs.push(...selectedProductPairs);
        allProductPairs.push(...existingProductPairsExcludingSelectedProductPairs);

        return allProductPairs;
    }

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();

        if (canClickSubmit()) {
            await AssignmentClient.createAssignmentForDate({
                requestedDate: moment(viewingDate).format('YYYY-MM-DD'),
                person: selectedPerson,
                products: getProductPairsForPerson(),
            });

            closeModal();
        }
    }

    function canClickSubmit(): boolean {
        const numSelectedProducts = selectedProducts.length;
        const selectedPersonId = selectedPerson.id;
        return selectedPersonId >= 0 && numSelectedProducts >= 1;
    }

    function getSelectedProduct(): Array<Product> {
        if (initiallySelectedProduct == null) {
            const selectedProduct = getUnassignedProduct();
            return selectedProduct ? [selectedProduct] : [];
        }

        return [initiallySelectedProduct];
    }

    function getUnassignedProduct(): Product | null {
        const unassignedProduct = getProductFromProductListWithName('unassigned', products);
        return unassignedProduct || null;
    }

    function getProductFromProductListWithName(name: string, productsList: Array<Product>): Product | null {
        const product = productsList.find((product: Product) => product.name === name);
        return product || null;
    }

    function changeProductAssignments(selectedProductNames: Array<Option>): void {
        if (selectedProductNames == null) return;
        const updatedProducts: Array<Product> = [];
        selectedProductNames.forEach(ev => {
            const product = getProductFromProductListWithName(ev.value, products);
            if (product) updatedProducts.push(product);
        });
        setSelectedProducts(updatedProducts);
    }

    function createOption(name: string, id: number): Option {
        return ({
            label: name,
            value: id.toString() + '_' + name,
        });
    }

    function findPerson(personId: string | null): void {
        if (!personId) {
            setSelectedPerson(defaultPerson);
        } else {
            const foundPerson: Person | undefined = people.find(person => person.id === parseInt(personId, 10));
            if (foundPerson) {
                setSelectedPerson(foundPerson);
            } else {
                openCreatePersonModal(personId);
            }
        }
    }

    function openCreatePersonModal(personName: string): void {
        const item = {
            initiallySelectedProduct,
            initialPersonName: personName,
        };
        setCurrentModal({modal: AvailableModals.CREATE_PERSON, item});
    }

    function getColorFromLabel(personId: string): string {
        const matchingPerson = people.find(person => person.id === parseInt(personId, 10));
        if (matchingPerson && matchingPerson.spaceRole && matchingPerson.spaceRole.color) {
            return matchingPerson.spaceRole.color.color;
        }
        return '';
    }

    function getSelectables(): Array<Product> {
        return products.filter(product => !product.archived && product.name !== 'unassigned');
    }

    return (
        <div className="formContainer">
            <form className="form"
                data-testid="assignmentForm"
                onSubmit={(event): Promise<void> => handleSubmit(event)}>
                <div className="person-select-container">
                    <label className="formItemLabel" htmlFor="person">Name</label>
                    <Creatable
                        isClearable
                        name="person"
                        inputId="person"
                        onInputChange={(e: string): void => setTypedInName(e)}
                        onChange={(e): void => findPerson(e ? (e as Option).value : null)}
                        options={people.map(person => createOption(person.name, person.id))}
                        styles={reactSelectStyles}
                        value={selectedPerson.name ? createOption(selectedPerson.name, selectedPerson.id) : null}
                        components={{Option: CustomOption, DropdownIndicator: CustomIndicator}}
                        formatCreateLabel={(): JSX.Element => CreateNewText(`Create "${typedInName}"`)}
                        placeholder="Add a person"
                        hideSelectedOptions={true}
                        {...{getColorFromLabel}}
                    />
                </div>
                <div className="formItem inlineLabelContainer">
                    <input className="formInput checkbox"
                        id="placeholder"
                        type="checkbox"
                        checked={placeholder}
                        onChange={(): void => setPlaceholder(!placeholder)}
                    />
                    <label className="formInputLabel" htmlFor="placeholder">Mark as Placeholder</label>
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="product">Assign to</label>
                    <MultiSelect
                        name="product"
                        initiallySelected={selectedProducts}
                        selectables={getSelectables()}
                        placeholder="Select a product"
                        changeSelections={changeProductAssignments}
                        disabled={false}/>
                </div>
                <div className="yesNoButtons">
                    <FormButton
                        buttonStyle="secondary"
                        onClick={closeModal}>
                        Cancel
                    </FormButton>
                    <FormButton
                        type="submit"
                        testId="assignButton"
                        disabled={!canClickSubmit()}>
                        Assign
                    </FormButton>
                </div>
            </form>
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    people: state.people,
    viewingDate: state.viewingDate,
});

const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentForm);
/* eslint-enable */
