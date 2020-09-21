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

import React, {ChangeEvent, FormEvent, useState} from 'react';
import AssignmentClient from '../Assignments/AssignmentClient';
import RoleClient from '../Roles/RoleClient';
import PeopleClient from './PeopleClient';
import Creatable from 'react-select/creatable';
import {connect} from 'react-redux';
import {addPersonAction, closeModalAction, editPersonAction, setIsUnassignedDrawerOpenAction} from '../Redux/Actions';
import {GlobalStateProps} from '../Redux/Reducers';
import {AxiosResponse} from 'axios';
import {emptyPerson, Person} from './Person';
import {SpaceRole} from '../Roles/Role';
import {Product} from '../Products/Product';
import {
    CreateNewText,
    CustomControl,
    CustomIndicator,
    CustomOption,
    reactSelectStyles,
} from '../ReusableComponents/ReactSelectStyles';
import MultiSelect from '../ReusableComponents/MultiSelect';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {Option} from '../CommonTypes/Option';
import {Assignment} from '../Assignments/Assignment';
import {RoleAddRequest} from '../Roles/RoleAddRequest';
import {JSX} from '@babel/types';
import {Dispatch} from 'redux';
import {ProductPlaceholderPair} from '../Assignments/CreateAssignmentRequest';
import {Space} from '../SpaceDashboard/Space';
import moment from 'moment';
import FormNotesTextArea from '../ModalFormComponents/FormNotesTextArea';
import FormButton from '../ModalFormComponents/FormButton';
import {useOnLoad} from '../ReusableComponents/UseOnLoad';

import './PersonForm.scss';

interface PersonFormProps {
    editing: boolean;
    products: Array<Product>;
    initiallySelectedProduct?: Product;
    initialPersonName?: string;
    assignment?: Assignment;
    people: Array<Person>;
    currentSpace: Space;
    viewingDate: Date;

    closeModal(): void;
    addPerson(person: Person): void;
    editPerson(person: Person): void;
    setIsUnassignedDrawerOpen(isUnassignedDrawerOpen: boolean): void;
}

function PersonForm({
    editing,
    products,
    initiallySelectedProduct,
    initialPersonName,
    people,
    currentSpace,
    viewingDate,
    assignment,
    closeModal,
    addPerson,
    editPerson,
    setIsUnassignedDrawerOpen,
}: PersonFormProps): JSX.Element {
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isPersonNameInvalid, setIsPersonNameInvalid] = useState<boolean>(false);
    const [person, setPerson] = useState<Person>(emptyPerson());
    const [selectedProducts, setSelectedProducts] = useState<Array<Product>>([]);
    const [roles, setRoles] = useState<Array<SpaceRole>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [typedInRole, setTypedInRole] = useState<string>('');

    const alphabetize = (roles: Array<SpaceRole | Product>): Array<SpaceRole | Product> => {
        return roles.sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
        });
    };

    const getSpaceIdFromPersonName = (name: string): number => {
        const person: Person | undefined = people.find(x => x.name === name);
        if (person && person.spaceId) return person.spaceId;
        return -1;
    };

    useOnLoad(() => {
        const setup = async (): Promise<void> => {
            if (currentSpace.uuid) {
                const rolesResponse: AxiosResponse = await RoleClient.get(currentSpace.uuid);
                setRoles(alphabetize(rolesResponse.data));
            }

            if (editing && assignment) {
                const personFromAssignment: Person = {
                    id: assignment.person.id,
                    name: assignment.person.name,
                    spaceRole: assignment.person.spaceRole,
                    notes: assignment.person.notes,
                    newPerson: assignment.person.newPerson,
                    spaceId: getSpaceIdFromPersonName(assignment.person.name),
                };
                setPerson(personFromAssignment);
                const assignmentsResponse: AxiosResponse = await AssignmentClient.getAssignmentsUsingPersonIdAndDate(assignment.person.id, viewingDate);
                const assignments: Array<Assignment> = assignmentsResponse.data;
                setSelectedProducts(createProductsFromAssignments(assignments));
            } else {
                if (initialPersonName) {
                    setPerson((updatingPerson: Person) => ({...updatingPerson, name: initialPersonName}));
                }
                if (initiallySelectedProduct) {
                    setSelectedProducts([initiallySelectedProduct]);
                }
            }
        };

        setup().then();
    });

    const getUnassignedProductId = (): number => {
        const unassignedProduct: Product | undefined = products.find((product: Product) => product.name === 'unassigned');
        if (unassignedProduct && unassignedProduct.id) return unassignedProduct.id;
        return -1;
    };

    const createProductsFromAssignments = (assignments: Array<Assignment>): Array<Product> => {
        const allProductIdsFromAssignments = assignments.map(a => a.productId);
        return products.filter(p => allProductIdsFromAssignments.includes(p.id)).filter(product => product.id !== getUnassignedProductId());
    };

    const getSelectedProductPairs = (): ProductPlaceholderPair[] => {
        return selectedProducts.map((product) => {
            const placeholderForProduct = product.assignments.find(
                (assignmentForProduct) => assignmentForProduct.person.id === person.id
            )?.placeholder;
            return {
                productId: product.id,
                placeholder: placeholderForProduct || false,
            } as ProductPlaceholderPair;
        });

    };

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();

        if (person.name.trim() === '') {
            setIsPersonNameInvalid(true);
        } else {
            setIsPersonNameInvalid(false);
            if (selectedProducts.length === 0) {
                setIsUnassignedDrawerOpen(true);
            }
            if (editing && assignment) {
                const response = await PeopleClient.updatePerson(person);
                await AssignmentClient.createAssignmentForDate({
                    requestedDate: moment(viewingDate).format('YYYY-MM-DD'),
                    person: assignment.person,
                    products: getSelectedProductPairs(),
                });
                const updatedPerson: Person = response.data;
                editPerson(updatedPerson);
            } else {
                const response = await PeopleClient.createPersonForSpace(person);
                const newPerson: Person = response.data;
                addPerson(newPerson);
                await AssignmentClient.createAssignmentForDate(
                    {
                        requestedDate: moment(viewingDate).format('YYYY-MM-DD'),
                        person: newPerson,
                        products: getSelectedProductPairs(),
                    }
                );
            }
            closeModal();
        }
    };

    const removePerson = (): void => {
        const assignmentId = assignment && assignment.person.id;
        if (assignmentId) {
            PeopleClient.removePerson(assignmentId).then(closeModal);
        }
    };

    const getPersonFromListWithName = (name: string): Person | null => {
        const person = people.find(x => x.name === name);
        return person || null;
    };

    const getItemFromListWithName = (name: string, productsList: Array<Product>): Product | null => {
        const product = productsList.find(x => x.name === name);
        return product || null;
    };

    const changeProductName = (events: Array<{ value: string }>): void => {
        const updatedProducts: Array<Product> = [];
        (events || []).forEach(ev => {
            if (ev.value !== 'unassigned') {
                const product = getItemFromListWithName(ev.value, products);
                if (product) updatedProducts.push(product);
            }
        });
        setSelectedProducts(updatedProducts.filter(product => product != null));
    };

    const updatePersonField = (fieldName: string, fieldValue: string | boolean | SpaceRole | undefined): void => {
        setPerson((updatingPerson: Person) => ({...updatingPerson, [fieldName]: fieldValue}));
    };

    const updateSpaceRole = (input: string): void => {
        const roleMatch: SpaceRole | undefined = roles.find((role: SpaceRole) => role.name === input);
        updatePersonField('spaceRole', roleMatch);
    };

    const changeName = (event: ChangeEvent<HTMLInputElement>): void => {
        const name = event.target.value;
        const otherPerson = getPersonFromListWithName(name);
        if (otherPerson !== null) {
            const updatedPerson: Person = {
                ...person,
                name,
                spaceRole: otherPerson.spaceRole,
                notes: otherPerson.notes,
            };
            setPerson(updatedPerson);
        } else {
            updatePersonField('name', name);
        }
    };

    const createOption = (label: string): Option => {
        return ({
            label,
            value: label,
        });
    };

    const handleCreateRole = (inputValue: string): void => {
        setIsLoading(true);
        if (currentSpace.uuid) {
            const roleAddRequest: RoleAddRequest = {name: inputValue};
            RoleClient.add(roleAddRequest, currentSpace.uuid).then((response: AxiosResponse) => {
                const newRole: SpaceRole = response.data;
                setRoles(roles => alphabetize([...roles, newRole]));
                updatePersonField('spaceRole', newRole);
                setIsLoading(false);
            });
        }
    };

    const displayRemovePersonModal = (): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: removePerson,
            close: () => {
                setConfirmDeleteModal(null);
            },
            warningMessage: 'Removing this person will remove all instances of them from your entire space.',
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    };

    // eslint-disable-next-line  jsx-a11y/accessible-emoji
    const peopleList = people.map((person, index) => <option key={index} value={person.name}>
        👤 {person.name}</option>);

    const getColorFromLabel = (label: string): string => {
        const matchingRole = roles.find(role => role.name === label);
        if (matchingRole && matchingRole.color) {
            return matchingRole.color.color;
        }
        return '';
    };

    const notesChanged = (notes: string): void => {
        updatePersonField('notes', notes);
    };

    const getSelectables = (): Array<Product> => {
        const filteredProducts: Array<Product> = products.filter(product => !product.archived && product.name !== 'unassigned');
        return alphabetize(filteredProducts) as Array<Product>;
    };

    return (
        <div className="formContainer">
            <datalist id="peopleList">
                {peopleList}
            </datalist>
            <form className="form"
                data-testid="personForm"
                onSubmit={(event): Promise<void> => handleSubmit(event)}>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="name">Name</label>
                    <input className="formInput formTextInput"
                        data-testid="personFormNameField"
                        type="text"
                        name="name"
                        id="name"
                        value={person.name}
                        onChange={changeName}
                        autoComplete="off"
                        placeholder={'e.g. Jane Smith'}
                        autoFocus/>
                    {isPersonNameInvalid && <span className="personNameWarning">Please enter a person name.</span>}
                    <div className="isNewContainer">
                        <input className="checkbox"
                            data-testid="personFormIsNewCheckbox"
                            id="isNew"
                            type="checkbox"
                            checked={person.newPerson}
                            onChange={(): void => {
                                updatePersonField('newPerson', !person.newPerson);
                            }}
                        />
                        <label className="formInputLabel" htmlFor="isNew">Mark as New</label>
                    </div>
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="role">Role</label>
                    <Creatable
                        isClearable
                        name="role"
                        inputId="role"
                        onInputChange={(e: string): void => setTypedInRole(e)}
                        onChange={(e): void => updateSpaceRole(e ? (e as Option).value : '')}
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        onCreateOption={handleCreateRole}
                        options={roles.map(role => createOption(role.name))}
                        styles={reactSelectStyles}
                        value={person.spaceRole && person.spaceRole.name !== '' ? createOption(person.spaceRole.name) : null}
                        components={{Option: CustomOption, DropdownIndicator: CustomIndicator, Control: CustomControl}}
                        formatCreateLabel={(): JSX.Element => CreateNewText(`Create "${typedInRole}"`)}
                        placeholder="Select or create a role"
                        hideSelectedOptions={true}
                        {...{getColorFromLabel}}
                    />
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="product">Assign to</label>
                    <MultiSelect
                        name="product"
                        initiallySelected={selectedProducts}
                        selectables={getSelectables()}
                        placeholder="unassigned"
                        changeSelections={changeProductName}
                        disabled={false}
                    />
                </div>
                <div className="formItem">
                    <FormNotesTextArea notes={person.notes} callBack={notesChanged}/>
                </div>
                <div className="yesNoButtons">
                    <FormButton
                        buttonStyle="secondary"
                        onClick={closeModal}>
                        Cancel
                    </FormButton>
                    <FormButton
                        testId="personFormSubmitButton"
                        buttonStyle="primary"
                        type="submit">
                        {editing ? 'Save' : 'Create'}
                    </FormButton>
                </div>
                {editing && (
                    <div className={'deleteButtonContainer alignSelfCenter deleteLinkColor'}>
                        <i className="fas fa-trash"/>
                        <div className="trashCanSpacer"/>
                        <span className="obliterateLink" onClick={displayRemovePersonModal}>Delete</span>
                    </div>
                )}
            </form>
            {confirmDeleteModal}
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    people: state.people,
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    addPerson: (person: Person) => dispatch(addPersonAction(person)),
    editPerson: (person: Person) => dispatch(editPersonAction(person)),
    setIsUnassignedDrawerOpen: (open: boolean) => dispatch(setIsUnassignedDrawerOpenAction(open)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonForm);
/* eslint-enable */
