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

import React, {FormEvent, useCallback, useEffect, useState} from 'react';
import AssignmentClient from 'Services/Api/AssignmentClient';
import RoleClient from 'Services/Api/RoleClient';
import PeopleClient from 'Services/Api/PeopleClient';
import {AxiosResponse} from 'axios';
import {emptyPerson, isArchived} from 'Services/PersonService';
import {isActiveProduct, isUnassignedProduct} from 'Products/ProductService';
import SelectWithNoCreateOption, {
    MetadataMultiSelectProps,
} from 'Common/SelectWithNoCreateOption/SelectWithNoCreateOption';
import ConfirmationModal, {ConfirmationModalProps} from 'Modal/ConfirmationModal/ConfirmationModal';
import {Option} from 'Types/Option';
import {JSX} from '@babel/types';
import {ProductPlaceholderPair} from 'Types/CreateAssignmentRequest';
import moment from 'moment';
import FormNotesTextArea from 'Common/FormNotesTextArea/FormNotesTextArea';
import FormButton from 'Common/FormButton/FormButton';
import SelectWithCreateOption, {MetadataReactSelectProps} from 'Common/SelectWithCreateOption/SelectWithCreateOption';
import FormTagsField from 'Common/FormTagsField/FormTagsField';
import PersonTagClient from 'Services/Api/PersonTagClient';
import {RoleTag, Tag} from 'Types/Tag';
import ToolTip from 'Common/ToolTips/ToolTip';
import {AssignmentHistory} from 'Assignments/History/AssignmentHistory';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {IsUnassignedDrawerOpenState} from 'State/IsUnassignedDrawerOpenState';
import {ProductsState} from 'State/ProductsState';
import {PeopleState} from 'State/PeopleState';
import useFetchRoles from 'Hooks/useFetchRoles/useFetchRoles';
import {ModalContentsState} from 'State/ModalContentsState';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {RoleTagRequest} from 'Types/TagRequest';
import {Product} from 'Types/Product';
import {Person} from 'Types/Person';
import {Assignment} from 'Types/Assignment';

import './PersonForm.scss';

interface Props {
    isEditPersonForm: boolean
    initiallySelectedProduct?: Product;
    initialPersonName?: string;
    personEdited?: Person;
}

function PersonForm({ isEditPersonForm, initiallySelectedProduct, initialPersonName, personEdited }: Props): JSX.Element {
    const products = useRecoilValue(ProductsState);
    const viewingDate = useRecoilValue(ViewingDateState);
    const currentSpace = useRecoilValue(CurrentSpaceState);
    const setIsUnassignedDrawerOpen = useSetRecoilState(IsUnassignedDrawerOpenState);
    const setPeople = useSetRecoilState(PeopleState);
    const setModalContents = useSetRecoilState(ModalContentsState);

    const spaceUuid = currentSpace.uuid || '';
    const { fetchRoles, roles } = useFetchRoles(spaceUuid);

    const { ROLE_TAGS } = MetadataReactSelectProps;
    const { PERSON_ASSIGN_TO } = MetadataMultiSelectProps;
    const { ARCHIVED_PERSON_ASSIGN_TO } = MetadataMultiSelectProps;
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isPersonNameInvalid, setIsPersonNameInvalid] = useState<boolean>(false);
    const [person, setPerson] = useState<Person>(emptyPerson());
    const [selectedProducts, setSelectedProducts] = useState<Array<Product>>([]);
    const [selectedPersonTags, setSelectedPersonTags] = useState<Array<Tag>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasAssignmentChanged, setHasAssignmentChanged] = useState<boolean>(false);
    const [hasNewPersonChanged, setHasNewPersonChanged] = useState<boolean>(false);
    const [initialNewPersonFlag, setInitialNewPersonFlag] = useState<boolean>(false);

    const alphabetize = (products: Array<Product>): void => {
        products.sort((product1: Product, product2: Product) => {
            return product1.name.toLowerCase().localeCompare(product2.name.toLowerCase());
        });
    };

    const getUnassignedProductId = useCallback((): number => {
        const unassignedProduct: Product | undefined = products.find((product: Product) => product.name === 'unassigned');
        if (unassignedProduct && unassignedProduct.id) return unassignedProduct.id;
        return -1;
    }, [products]);

    const createProductsFromAssignments = useCallback((assignments: Assignment[]): Product[] => {
        const allProductIdsFromAssignments = assignments.map(a => a.productId);
        return products.filter(p => allProductIdsFromAssignments.includes(p.id)).filter(product => product.id !== getUnassignedProductId());
    }, [getUnassignedProductId, products]);

    const populatedEntirePersonForm = useCallback((personToPopulate: Person): void => {
        setPerson({...personToPopulate});
        setSelectedPersonTags(personToPopulate.tags);

        AssignmentClient.getAssignmentsUsingPersonIdAndDate(spaceUuid, personToPopulate.id, viewingDate)
            .then((response) => {
                const assignments: Array<Assignment> = response.data;
                setSelectedProducts(createProductsFromAssignments(assignments));
            });
    }, [createProductsFromAssignments, spaceUuid, viewingDate]);

    useEffect(() => {
        if (isEditPersonForm && personEdited) {
            populatedEntirePersonForm(personEdited);
            setInitialNewPersonFlag(personEdited.newPerson);
        } else {
            if (initialPersonName) {
                setPerson((updatingPerson: Person) => ({...updatingPerson, name: initialPersonName}));
            }

            if (initiallySelectedProduct) setSelectedProducts([initiallySelectedProduct]);
        }
    }, [initialPersonName, initiallySelectedProduct, isEditPersonForm, personEdited, populatedEntirePersonForm, viewingDate]);

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

            if (hasNewPersonChanged) {
                if (person.newPerson) {
                    person.newPersonDate = viewingDate;
                } else {
                    person.newPersonDate = undefined;
                }
            }

            const personToSend = {
                ...person,
                name: person.name.trim(),
                customField1: person.customField1?.trim(),
                notes:  person.notes?.trim(),
                tags: selectedPersonTags
            };

            if (isEditPersonForm) {
                const response = await PeopleClient.updatePerson(currentSpace, personToSend);
                const updatedPerson: Person = response.data;
                setPeople(currentPeople => currentPeople.map((p) => {
                    return (p.id === updatedPerson.id) ? updatedPerson : p;
                }))

                if (hasAssignmentChanged) {
                    await AssignmentClient.createAssignmentForDate(
                        moment(viewingDate).format('YYYY-MM-DD'),
                        getSelectedProductPairs(),
                        currentSpace,
                        updatedPerson
                    );
                }

            } else {
                const response = await PeopleClient.createPersonForSpace(currentSpace, personToSend);
                const newPerson: Person = response.data;
                setPeople(currentPeople => [...currentPeople, newPerson])
                await AssignmentClient.createAssignmentForDate(
                    moment(viewingDate).format('YYYY-MM-DD'),
                    getSelectedProductPairs(),
                    currentSpace,
                    newPerson
                );
            }
            closeModal();
        }
    };

    const closeModal = () => setModalContents(null);

    const removePerson = (): void => {
        const assignmentId = personEdited && personEdited.id;
        if (assignmentId) {
            PeopleClient.removePerson(spaceUuid, assignmentId).then(closeModal);
        }
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
        setHasAssignmentChanged(true);
        setSelectedProducts(updatedProducts.filter(product => product != null));
        updatePersonField('archiveDate', undefined);
    };

    const updatePersonField = (fieldName: string, fieldValue: string | boolean | RoleTag | Date | undefined): void => {
        setPerson((updatingPerson: Person) => ({...updatingPerson, [fieldName]: fieldValue}));
    };

    const updateSpaceRole = (input: string): void => {
        const roleMatch: RoleTag | undefined = roles.find((role: RoleTag) => role.name === input);
        updatePersonField('spaceRole', roleMatch);
    };

    const createOption = (role: RoleTag): Option => {
        return ({
            label: role.name,
            value: role.name,
            color: role.color?.color,
        });
    };

    const handleCreateRole = (inputValue: string): void => {
        setIsLoading(true);
        const roleAddRequest: RoleTagRequest = {name: inputValue};
        RoleClient.add(roleAddRequest, currentSpace).then((response: AxiosResponse) => {
            const newRole: RoleTag = response.data;
            fetchRoles();
            updatePersonField('spaceRole', newRole);
            setIsLoading(false);
        });
    };

    const displayRemovePersonModal = (): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: removePerson,
            close: () => {
                setConfirmDeleteModal(null);
            },
            content: <div>Removing this person will remove all instances of them from your entire space.</div>,
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    };

    const getAssignToOptions = (): Array<Option> => {
        const filteredProducts: Array<Product> = products
            .filter(product => isActiveProduct(product, viewingDate) && !isUnassignedProduct(product));
        alphabetize(filteredProducts);
        return filteredProducts.map(selectable => {return {value: selectable.name, label: selectable.name};});
    };

    const toolTipContent = (): JSX.Element => {
        return <span className="toolTipContent">Create tags based on your people. Example, skills, education, employee status, etc. Anything on which you would like to filter.</span>;
    };

    const getAssignmentHistoryContent = (): JSX.Element => {
        return (personEdited ? (<AssignmentHistory person={personEdited}/>) : <></>);
    };

    return (
        <div className="formContainer">
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
                        onChange={(event): void => {
                            updatePersonField('name', event.target.value);
                        }}
                        autoComplete="off"
                        placeholder="e.g. Jane Smith"
                    />
                    {isPersonNameInvalid && <span className="personNameWarning">Please enter a person name.</span>}
                    <div className="isNewContainer">
                        <input className="checkbox"
                            data-testid="personFormIsNewCheckbox"
                            id="isNew"
                            type="checkbox"
                            checked={person.newPerson}
                            onChange={(): void => {
                                const newPersonFlag = !person.newPerson;
                                updatePersonField('newPerson', newPersonFlag);
                                if (newPersonFlag === initialNewPersonFlag) {
                                    setHasNewPersonChanged(false);
                                } else {
                                    setHasNewPersonChanged(true);
                                }
                            }}
                        />
                        <label className="formInputLabel" htmlFor="isNew">Mark as New</label>
                    </div>
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="cdsid">CDSID</label>
                    <input className="formInput formTextInput"
                        data-testid="personFormCustomField1"
                        type="text"
                        name="cdsid"
                        id="cdsid"
                        value={person.customField1 || ''}
                        onChange={(event): void => {
                            updatePersonField('customField1', event.target.value);
                        }}
                        autoComplete="off"
                        placeholder="e.g. jsmith12"
                    />
                </div>
                <SelectWithCreateOption
                    metadata={ROLE_TAGS}
                    useColorBadge
                    value={person.spaceRole && person.spaceRole.name !== '' ? createOption(person.spaceRole) : undefined}
                    options={roles.map(role => createOption(role))}
                    onChange={(e): void => updateSpaceRole(e ? (e as Option).value : '')}
                    onSave={handleCreateRole}
                    isLoading={isLoading}
                />
                <SelectWithNoCreateOption
                    metadata={isArchived(person, viewingDate) ? ARCHIVED_PERSON_ASSIGN_TO : PERSON_ASSIGN_TO}
                    values={selectedProducts.map(x => {return {value:x.name, label:x.name};})}
                    options={getAssignToOptions()}
                    onChange={changeProductName}
                />
                {isEditPersonForm && <div className="formItem">{getAssignmentHistoryContent()}</div>}
                <FormTagsField
                    tagsMetadata={MetadataReactSelectProps.PERSON_TAGS}
                    tagClient={PersonTagClient}
                    currentTagsState={{currentTags: person.tags}}
                    selectedTagsState={{selectedTags: selectedPersonTags, setSelectedTags: setSelectedPersonTags}}
                    loadingState={{isLoading, setIsLoading}}
                    toolTip={<ToolTip toolTipLabel="What's this?" contentElement={toolTipContent()}/>}
                />
                <div className="formItem">
                    <FormNotesTextArea
                        notes={person.notes}
                        callBack={(notes): void => {
                            updatePersonField('notes', notes);
                        }}
                    />
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
                        {isEditPersonForm ? 'Save' : 'Add'}
                    </FormButton>
                </div>
            </form>

            {isEditPersonForm && (
                <button className="deleteButtonContainer alignSelfCenter deleteLinkColor"
                    data-testid="deletePersonButton"
                    onClick={displayRemovePersonModal}
                >
                    <i className="material-icons" aria-hidden>delete</i>
                    <div className="trashCanSpacer"/>
                    <span className="obliterateLink">
                            Delete
                    </span>
                </button>
            )}
            {confirmDeleteModal}
        </div>
    );
}

export default PersonForm;
