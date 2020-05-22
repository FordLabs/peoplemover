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

import React, {useState} from 'react';
import AssignmentClient from '../Assignments/AssignmentClient';
import MultiSelect from '../ReusableComponents/MultiSelect';
import {connect} from 'react-redux';
import {
    AvailableModals,
    closeModalAction,
    setCurrentModalAction,
    setIsUnassignedDrawerOpenAction,
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

interface AssignmentFormProps {
    products: Array<Product>;
    initiallySelectedProduct: Product;
    people: Array<Person>;

    closeModal(): void;

    setIsUnassignedDrawerOpen(isUnassignedDrawerOpen: boolean): void;

    setCurrentModal(modalState: CurrentModalState): void;
}

function AssignmentForm({
    products,
    initiallySelectedProduct,
    people,
    setIsUnassignedDrawerOpen,
    closeModal,
    setCurrentModal,
}: AssignmentFormProps): JSX.Element {
    const defaultPerson: Person = {id: -1, name: ''} as Person;
    const [typedInName, setTypedInName] = useState<string>(defaultPerson.name);
    const [selectedPerson, setSelectedPerson] = useState<Person>(defaultPerson);
    const [selectedProducts, setSelectedProducts] = useState<Array<Product>>(getSelectedProduct());
    const [placeholder, setPlaceholder] = useState<boolean>(false);

    function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit().then();
        }
    }

    async function handleSubmit(): Promise<void> {
        if (canClickSubmit()) {
            if (getProductFromProductListWithName('unassigned', selectedProducts)) {
                setIsUnassignedDrawerOpen(true);
            }
            const productIds: Array<number> = selectedProducts.map(product => product.id);
            const placeholders: Array<boolean> = selectedProducts.map(() => placeholder);
            await AssignmentClient.createAssignmentsUsingIds(selectedPerson.id, productIds, placeholders);
            closeModal();
        }
    }

    function canClickSubmit(): boolean {
        const numSelectedProducts = selectedProducts.length;
        const selectedPersonId = selectedPerson.id;
        return selectedPersonId >= 0 && numSelectedProducts >= 1;
    }

    function getSelectedProduct(): Array<Product> {
        return initiallySelectedProduct == null ?
            [getUnassignedProduct()] : [initiallySelectedProduct];
    }

    function getUnassignedProduct(): Product {
        return getProductFromProductListWithName('unassigned', products);
    }

    function getProductFromProductListWithName(name: string, productsList: Array<Product>): Product {
        const product = productsList.find((product: Product) => product.name === name);
        return product!;
    }

    function changeProductAssignments(selectedProductNames: Array<Option>): void {
        if (selectedProductNames == null) {
            return;
        }
        const updatedProducts: Array<Product> = [];
        selectedProductNames.forEach(ev => {
            updatedProducts.push(getProductFromProductListWithName(ev.value, products));
        });
        setSelectedProducts(updatedProducts);
    }

    function createOption(name: string, id: number): Option {
        return ({
            label: name,
            value: id.toString(),
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
            <form className="form" onKeyDown={handleKeyDown} data-testid="assignmentForm">

                <div className={'person-select-container'}>
                    <label className="formItemLabel" htmlFor="person">Name</label>
                    <Creatable
                        isClearable
                        name={'person'}
                        inputId="person"
                        onInputChange={(e: string) => setTypedInName(e)}
                        onChange={(e: any): void => findPerson(e ? e.value : null)}
                        options={people.map(person => createOption(person.name, person.id))}
                        styles={reactSelectStyles}
                        value={selectedPerson.name ? createOption(selectedPerson.name, selectedPerson.id) : null}
                        components={{Option: CustomOption, DropdownIndicator: CustomIndicator}}
                        formatCreateLabel={(): JSX.Element => CreateNewText(`Create "${typedInName}"`)}
                        placeholder="Select or create a person"
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
                        name={'product'}
                        initiallySelected={selectedProducts}
                        selectables={getSelectables()}
                        placeholder={'Select a product'}
                        changeSelections={changeProductAssignments}
                        disabled={false}/>
                </div>
                <div className="yesNoButtons">
                    <button className="formButton cancelFormButton" onClick={closeModal}>Cancel</button>
                    <input
                        className="formButton"
                        onClick={handleSubmit}
                        disabled={!canClickSubmit()}
                        type="button"
                        data-testid="assignButton"
                        value={'Assign'}/>
                </div>
            </form>
        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    people: state.people,
});

const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setIsUnassignedDrawerOpen: (open: boolean) => dispatch(setIsUnassignedDrawerOpenAction(open)),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentForm);