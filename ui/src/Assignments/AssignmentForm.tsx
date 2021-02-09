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

import React, {FormEvent, useState} from 'react';
import AssignmentClient from '../Assignments/AssignmentClient';
import SelectWithNoCreateOption, {MetadataMultiSelectProps} from '../ModalFormComponents/SelectWithNoCreateOption';
import {connect} from 'react-redux';
import {
    AvailableModals,
    closeModalAction,
    setCurrentModalAction,
} from '../Redux/Actions';
import {Person} from '../People/Person';
import {GlobalStateProps} from '../Redux/Reducers';
import {Product} from '../Products/Product';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import './AssignmentForm.scss';
import {Option} from '../CommonTypes/Option';
import {Dispatch} from 'redux';
import {ProductPlaceholderPair} from './CreateAssignmentRequest';
import {Assignment} from './Assignment';
import moment from 'moment';
import FormButton from '../ModalFormComponents/FormButton';
import {Space} from '../Space/Space';
import SelectWithCreateOption, { MetadataReactSelectProps } from '../ModalFormComponents/SelectWithCreateOption';

interface AssignmentFormProps {
    products: Array<Product>;
    initiallySelectedProduct: Product;
    people: Array<Person>;
    currentSpace: Space;
    viewingDate: Date;

    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
}

function AssignmentForm({
    products,
    initiallySelectedProduct,
    people,
    currentSpace,
    viewingDate,
    closeModal,
    setCurrentModal,
}: AssignmentFormProps): JSX.Element {
    const { ASSIGNMENT_NAME } = MetadataReactSelectProps;
    const { ASSIGNMENT_ASSIGN_TO } = MetadataMultiSelectProps;
    const defaultPerson: Person = {id: -1, name: ''} as Person;
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
            await AssignmentClient.createAssignmentForDate(
                moment(viewingDate).format('YYYY-MM-DD'),
                getProductPairsForPerson(),
                currentSpace,
                selectedPerson
            );

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

    function createOption(person: Person): Option {
        return ({
            label: person.name,
            value: person.id.toString() + '_' + person.name,
            color: person.spaceRole?.color?.color,
        });
    }

    function findPerson(personId: string | null): void {
        if (!personId) {
            setSelectedPerson(defaultPerson);
        } else {
            const foundPerson: Person | undefined = people.find(person => person.id === parseInt(personId, 10));
            if (foundPerson) {
                setSelectedPerson(foundPerson);
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

    function getAssignToOptions(): Array<Option> {
        return products
            .filter(product => !product.archived && product.name !== 'unassigned')
            .map(selectable => {
                return {value: selectable.name, label: selectable.name};
            });
    }

    return (
        <div className="formContainer">
            <form className="form"
                data-testid="assignmentForm"
                onSubmit={(event): Promise<void> => handleSubmit(event)}>
                <SelectWithCreateOption
                    className="personSelectContainer"
                    metadata={ASSIGNMENT_NAME}
                    useColorBadge
                    value={selectedPerson.name ? createOption(selectedPerson) : undefined}
                    options={people.map(person => createOption(person))}
                    onChange={(e): void => findPerson(e ? (e as Option).value : null)}
                    onSave={openCreatePersonModal}
                />
                <div className="formItem inlineLabelContainer">
                    <input className="formInput checkbox"
                        id="placeholder"
                        type="checkbox"
                        checked={placeholder}
                        onChange={(): void => setPlaceholder(!placeholder)}
                    />
                    <label className="formInputLabel" htmlFor="placeholder">Mark as Placeholder</label>
                </div>
                <SelectWithNoCreateOption
                    metadata={ASSIGNMENT_ASSIGN_TO}
                    values={selectedProducts.map(x => {return {value:x.name, label:x.name};})}
                    options={getAssignToOptions()}
                    onChange={changeProductAssignments}
                />
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
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
});

const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentForm);
/* eslint-enable */
