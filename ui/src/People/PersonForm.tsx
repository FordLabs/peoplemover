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
import RoleClient from '../Roles/RoleClient';
import PeopleClient from './PeopleClient';
import {connect} from 'react-redux';
import {
    addPersonAction,
    closeModalAction,
    editPersonAction,
    fetchRolesAction,
    setAllGroupedTagFilterOptionsAction,
    setIsUnassignedDrawerOpenAction,
} from '../Redux/Actions';
import {GlobalStateProps} from '../Redux/Reducers';
import {AxiosResponse} from 'axios';
import {emptyPerson, isArchived, Person} from './Person';
import {RoleTag} from '../Roles/RoleTag.interface';
import {isActiveProduct, isUnassignedProduct, Product} from '../Products/Product';
import SelectWithNoCreateOption, {MetadataMultiSelectProps} from '../ModalFormComponents/SelectWithNoCreateOption';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {Option} from '../CommonTypes/Option';
import {Assignment} from '../Assignments/Assignment';
import {RoleAddRequest} from '../Roles/RoleAddRequest.interface';
import {JSX} from '@babel/types';
import {ProductPlaceholderPair} from '../Assignments/CreateAssignmentRequest';
import {Space} from '../Space/Space';
import moment from 'moment';
import FormNotesTextArea from '../ModalFormComponents/FormNotesTextArea';
import FormButton from '../ModalFormComponents/FormButton';
import {useOnLoad} from '../ReusableComponents/UseOnLoad';
import SelectWithCreateOption, {MetadataReactSelectProps} from '../ModalFormComponents/SelectWithCreateOption';
import './PersonForm.scss';
import FormTagsField from '../ReusableComponents/FormTagsField';
import {TagInterface} from '../Tags/Tag.interface';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';
import {Tag} from '../Tags/Tag';
import {
    addGroupedTagFilterOptions,
    AllGroupedTagFilterOptions,
    FilterTypeListings,
} from '../SortingAndFiltering/FilterLibraries';
import ToolTip from '../ReusableComponents/ToolTip';
import MatomoEvents from '../Matomo/MatomoEvents';
import {AssignmentHistory} from '../Assignments/History/AssignmentHistory';

interface PersonFormProps {
    isEditPersonForm: boolean;
    products: Array<Product>;
    initiallySelectedProduct?: Product;
    initialPersonName?: string;
    personEdited?: Person;
    currentSpace: Space;
    viewingDate: Date;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    roles: Array<RoleTag>;

    closeModal(): void;
    addPerson(person: Person): void;
    editPerson(person: Person): void;
    setIsUnassignedDrawerOpen(isUnassignedDrawerOpen: boolean): void;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
    fetchRoles(): Array<RoleTag>;
}

function PersonForm({
    isEditPersonForm,
    products,
    initiallySelectedProduct,
    initialPersonName,
    currentSpace,
    viewingDate,
    personEdited,
    closeModal,
    addPerson,
    editPerson,
    setIsUnassignedDrawerOpen,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
    roles,
    fetchRoles,
}: PersonFormProps): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spaceUuid = currentSpace.uuid!;
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
    const [initialNewPersonDuration, setInitialNewPersonDuration] = useState<number>(0);

    const alphabetize = (products: Array<Product>): void => {
        products.sort((product1: Product, product2: Product) => {
            return product1.name.toLowerCase().localeCompare(product2.name.toLowerCase());
        });
    };

    const populatedEntirePersonForm = (personToPopulate: Person): void => {
        setPerson({...personToPopulate});
        setSelectedPersonTags(personToPopulate.tags);

        AssignmentClient.getAssignmentsUsingPersonIdAndDate(spaceUuid, personToPopulate.id, viewingDate)
            .then((response) => {
                const assignments: Array<Assignment> = response.data;
                setSelectedProducts(createProductsFromAssignments(assignments));
            });
    };

    useOnLoad(() => {
        if (isEditPersonForm && personEdited) {
            populatedEntirePersonForm(personEdited);
            setInitialNewPersonFlag(personEdited.newPerson);
            if (personEdited.newPersonDate !== null) {
                const viewingDateMoment = moment(viewingDate).startOf('day');
                const checkedDateMoment = moment(personEdited.newPersonDate).startOf('day');
                setInitialNewPersonDuration(moment.duration(viewingDateMoment.diff(checkedDateMoment)).asDays());
            }
        } else {
            if (initialPersonName) {
                setPerson(
                    (updatingPerson: Person) => ({...updatingPerson, name: initialPersonName})
                );
            }

            if (initiallySelectedProduct) setSelectedProducts([initiallySelectedProduct]);
        }
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

    const getAddedPersonTag = (): string[] => {
        let result: string[] = [];
        if (person.tags !== selectedPersonTags) {
            result = selectedPersonTags.filter(tag => {
                return !person.tags.includes(tag);
            }).map(tag => {
                return tag.name;
            });
        }
        return result;
    };

    const handleMatomoEventsForNewPersonCheckboxChange = (): void  => {
        if (hasNewPersonChanged) {
            if (person.newPerson) {
                MatomoEvents.pushEvent(currentSpace.name, 'newPersonChecked', person.name);
            } else {
                MatomoEvents.pushEvent(currentSpace.name, 'newPersonUnchecked', person.name + ', ' + initialNewPersonDuration + ' day(s)');
            }
            setHasNewPersonChanged(false);
        }
    };

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();

        if (person.name.trim() === '') {
            setIsPersonNameInvalid(true);
        } else {
            setIsPersonNameInvalid(false);

            let personTagModified = getAddedPersonTag();

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

            let personToSend = {...person};
            personToSend.name = personToSend.name.trim();
            personToSend.customField1 = personToSend.customField1?.trim();
            personToSend.notes = personToSend.notes?.trim();
            personToSend.tags = selectedPersonTags;

            if (isEditPersonForm) {
                const response = await PeopleClient.updatePerson(currentSpace, personToSend, personTagModified);
                const updatedPerson: Person = response.data;
                editPerson(updatedPerson);
                if (hasAssignmentChanged) {
                    await AssignmentClient.createAssignmentForDate(
                        moment(viewingDate).format('YYYY-MM-DD'),
                        getSelectedProductPairs(),
                        currentSpace,
                        updatedPerson
                    );
                }

            } else {
                const response = await PeopleClient.createPersonForSpace(currentSpace, personToSend, personTagModified);
                const newPerson: Person = response.data;
                addPerson(newPerson);
                await AssignmentClient.createAssignmentForDate(
                    moment(viewingDate).format('YYYY-MM-DD'),
                    getSelectedProductPairs(),
                    currentSpace,
                    newPerson
                );
            }
            handleMatomoEventsForNewPersonCheckboxChange();
            closeModal();
        }
    };

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
        const roleAddRequest: RoleAddRequest = {name: inputValue};
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
                {isEditPersonForm && <div className="formItem">
                    <>{getAssignmentHistoryContent()}</>
                </div>}
                <FormTagsField
                    tagsMetadata={MetadataReactSelectProps.PERSON_TAGS}
                    tagClient={PersonTagClient}
                    currentTagsState={{currentTags: person.tags}}
                    selectedTagsState={{selectedTags: selectedPersonTags, setSelectedTags: setSelectedPersonTags}}
                    loadingState={{isLoading, setIsLoading}}
                    addGroupedTagFilterOptions={(trait: TagInterface): void => {addGroupedTagFilterOptions(FilterTypeListings.PersonTag.index, trait, allGroupedTagFilterOptions, setAllGroupedTagFilterOptions);}}
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

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
    roles: state.roles,
});

const mapDispatchToProps = (dispatch: any) => ({
    closeModal: () => dispatch(closeModalAction()),
    addPerson: (person: Person) => dispatch(addPersonAction(person)),
    editPerson: (person: Person) => dispatch(editPersonAction(person)),
    setIsUnassignedDrawerOpen: (open: boolean) => dispatch(setIsUnassignedDrawerOpenAction(open)),
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
    fetchRoles: () => dispatch(fetchRolesAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonForm);
/* eslint-enable */
