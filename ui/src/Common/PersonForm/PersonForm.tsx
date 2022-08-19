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
import PeopleClient from 'Services/Api/PeopleClient';
import {emptyPerson} from 'Services/PersonService';
import {JSX} from '@babel/types';
import {ProductPlaceholderPair} from 'Types/CreateAssignmentRequest';
import moment from 'moment';
import FormNotesTextArea from 'Common/FormNotesTextArea/FormNotesTextArea';
import FormButton from 'Common/FormButton/FormButton';
import {RoleTag, Tag} from 'Types/Tag';
import {AssignmentHistory} from 'Common/PersonForm/AssignmentHistory/AssignmentHistory';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {IsUnassignedDrawerOpenState} from 'State/IsUnassignedDrawerOpenState';
import {ProductsState} from 'State/ProductsState';
import {PeopleState} from 'State/PeopleState';
import {ModalContentsState} from 'State/ModalContentsState';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {Product} from 'Types/Product';
import {Person} from 'Types/Person';
import {Assignment} from 'Types/Assignment';
import CDSIDInput from "./CDSIDInput/CDSIDInput";
import MarkAsNewCheckbox from "./MarkAsNewCheckbox/MarkAsNewCheckbox";
import NameInput from "./NameInput/NameInput";
import RoleTagsDropdown from "./RoleTagsDropdown/RoleTagsDropdown";
import AssignToProductDropdown from "./AssignToProductDropdown/AssignToProductDropdown";
import DeleteButton from "./DeleteButton/DeleteButton";
import PersonTagsDropdown from "./PersonTagsDropdown/PersonTagsDropdown";

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

    const [isPersonNameInvalid, setIsPersonNameInvalid] = useState<boolean>(false);
    const [person, setPerson] = useState<Person>(emptyPerson());
    const [selectedProducts, setSelectedProducts] = useState<Array<Product>>([]);
    const [selectedPersonTags, setSelectedPersonTags] = useState<Array<Tag>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasAssignmentChanged, setHasAssignmentChanged] = useState<boolean>(false);
    const [hasNewPersonChanged, setHasNewPersonChanged] = useState<boolean>(false);
    const [initialNewPersonFlag, setInitialNewPersonFlag] = useState<boolean>(false);

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

    const updatePersonField = (fieldName: string, fieldValue: string | boolean | RoleTag | Date | undefined): void => {
        setPerson((updatingPerson: Person) => ({...updatingPerson, [fieldName]: fieldValue}));
    };

    return (
        <div className="formContainer">
            <form className="form" data-testid="personForm" onSubmit={handleSubmit}>
                <div className="formItem">
                    <NameInput
                        value={person.name}
                        onChange={(event): void => updatePersonField('name', event.target.value)}
                        isPersonNameInvalid={isPersonNameInvalid}
                    />
                    <MarkAsNewCheckbox
                        isChecked={person.newPerson}
                        onChange={(): void => {
                            const newPersonFlag = !person.newPerson;
                            updatePersonField('newPerson', newPersonFlag);
                            setHasNewPersonChanged(!(newPersonFlag === initialNewPersonFlag));
                        }}
                    />
                </div>
                <CDSIDInput
                    value={person.customField1}
                    onChange={(event): void => {
                        updatePersonField('customField1', event.target.value);
                    }}
                />
                <RoleTagsDropdown
                    spaceRole={person?.spaceRole}
                    onChange={(role) => updatePersonField('spaceRole', role)}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                />
                <AssignToProductDropdown
                    person={person}
                    selectedProducts={selectedProducts}
                    onChange={(updatedProducts) => {
                        setHasAssignmentChanged(true);
                        setSelectedProducts(updatedProducts);
                    }}
                />
                {isEditPersonForm && personEdited && (
                    <div className="formItem">
                        <AssignmentHistory person={personEdited}/>
                    </div>
                )}
                <PersonTagsDropdown
                    value={person.tags}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    selectedPersonTags={selectedPersonTags}
                    setSelectedPersonTags={setSelectedPersonTags}
                />
                <div className="formItem">
                    <FormNotesTextArea
                        notes={person.notes}
                        callBack={(notes): void => updatePersonField('notes', notes)}
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
            {isEditPersonForm && <DeleteButton personEdited={personEdited} />}
        </div>
    );
}

export default PersonForm;
