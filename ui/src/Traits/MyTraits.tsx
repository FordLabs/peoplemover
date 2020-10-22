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

import React, {useEffect, useState} from 'react';
import EditTraitSection from '../Traits/EditTraitSection';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {JSX} from '@babel/types';
import {TraitClient} from './TraitClient';
import {Trait} from './Trait';
import {SpaceRole} from '../Roles/Role';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptions} from '../Redux/Actions';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {FilterOption} from '../CommonTypes/Option';
import {Space} from '../Space/Space';
import PlusIcon from './plusIcon.png';
import {createDataTestId} from '../tests/TestUtils';

import '../Traits/MyTraits.scss';

export type TraitNameType = 'role' | 'product tag' | 'location'
export type TitleType = 'Location Tags' | 'Product Tags';
export type TraitType = 'product' | 'person'

interface MyTraitsProps {
    currentSpace: Space;
    title?: TitleType;
    traitClient: TraitClient;
    traitType: TraitType;
    colorSection: boolean;
    traitName: TraitNameType;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

enum TraitAction {
    ADD,
    EDIT,
    DELETE
}

function MyTraits({
    currentSpace,
    title,
    traitClient,
    colorSection,
    traitName,
    traitType,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
}: MyTraitsProps): JSX.Element {
    const [traits, setTraits] = useState<Array<Trait>>([]);
    const [showEditState, setShowEditState] = useState<boolean>(false);
    const [editSectionsOpen, setEditSectionsOpen] = useState<Array<boolean>>([]);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const traitNameClass = traitName.replace(' ', '_');

    useEffect(() => {
        async function setup(): Promise<void> {
            const response = await traitClient.get(currentSpace.uuid!!);
            const traitResponse: Array<Trait> = response.data;
            sortTraitsAlphabetically(traitResponse);
            setTraits(traitResponse);
            setEditSectionsOpen(new Array(traitResponse.length).fill(false));
        }

        setup().then();
    }, [currentSpace.uuid, traitClient]);

    function sortTraitsAlphabetically(traitsList: Array<Trait>): void {
        traitsList.sort( (trait1: Trait, trait2: Trait) => {
            return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
        });
    }

    function updateTraits(trait: Trait): void {
        setTraits(prevTraits => {
            const updating: boolean = prevTraits.some(prevTrait => prevTrait.id === trait.id);
            if (updating) {
                updateGroupedTagFilterOptions(traitName, trait, TraitAction.EDIT);
                const traits = prevTraits.map(prevTrait => prevTrait.id !== trait.id ? prevTrait : trait);
                sortTraitsAlphabetically(traits);
                return traits;
            } else {
                updateGroupedTagFilterOptions(traitName, trait, TraitAction.ADD);
                const traits = [...prevTraits, trait];
                sortTraitsAlphabetically(traits);
                return traits;
            }
        });
    }

    function toggleEditSection(index: number): void {
        const editSectionChanges: Array<boolean> = [...editSectionsOpen];
        editSectionChanges[index] = !editSectionChanges[index];
        setEditSectionsOpen(editSectionChanges);
    }

    async function deleteTrait(traitToDelete: Trait): Promise<void> {
        try {
            if (currentSpace.uuid) {
                await traitClient.delete(traitToDelete.id, currentSpace.uuid);
                setConfirmDeleteModal(null);
                setTraits(prevTraits => prevTraits.filter(trait => trait.id !== traitToDelete.id));
                updateGroupedTagFilterOptions(traitName, traitToDelete, TraitAction.DELETE);
            }
        } catch {
            return;
        }
    }

    function updateFilterValuesInGroupedTags(index: number, trait: Trait, action: TraitAction): Array<FilterOption> {
        let options: Array<FilterOption>;
        switch (action) {
            case TraitAction.ADD:
                options = [
                    ...allGroupedTagFilterOptions[index].options,
                    {label: trait.name, value: trait.id.toString() + '_' + trait.name, selected: false},
                ];
                break;
            case TraitAction.EDIT:
                options = allGroupedTagFilterOptions[index].options.map(val =>
                    !val.value.includes(trait.id.toString() + '_') ?
                        val :
                        {
                            label: trait.name,
                            value: trait.id.toString() + '_' + trait.name,
                            selected: val.selected,
                        }
                );
                break;
            case TraitAction.DELETE:
                options = allGroupedTagFilterOptions[index].options.filter(val => val.label !== trait.name);
                break;
            default:
                options = [];
        }
        return options;
    }

    function updateGroupedTagFilterOptions(traitName: string, trait: Trait, action: TraitAction ): void {
        const groupedFilterOptions = [...allGroupedTagFilterOptions];
        if (traitName === 'location') {
            groupedFilterOptions[0] = {
                ...allGroupedTagFilterOptions[0],
                options:  updateFilterValuesInGroupedTags(0,  trait, action),
            };
        } else if (traitName === 'product tag') {
            groupedFilterOptions[1] = {
                ...allGroupedTagFilterOptions[1],
                options: updateFilterValuesInGroupedTags(1,  trait, action),
            };
        } else if (traitName === 'role') {
            groupedFilterOptions[2] = {
                ...allGroupedTagFilterOptions[2],
                options:  updateFilterValuesInGroupedTags(2,  trait, action),
            };
        }
        setAllGroupedTagFilterOptions(groupedFilterOptions);
    }

    function showDeleteConfirmationModal(traitToDelete: Trait): void {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: () => deleteTrait(traitToDelete),
            close: () => setConfirmDeleteModal(null),
            warningMessage: `Deleting this ${traitName} will remove it from any ${traitType} that has been given this ${traitName}.`,
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    }

    function toTitleCase(phrase: string): string {
        return phrase
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function handleKeyDownForToggleEditSection(event: React.KeyboardEvent, index: number): void {
        if (event.key === 'Enter') {
            toggleEditSection(index);
        }
    }

    function handleKeyDownForShowDeleteConfirmationModal(event: React.KeyboardEvent, trait: Trait): void {
        if (event.key === 'Enter') {
            showDeleteConfirmationModal(trait);
        }
    }

    function isEditBoxOpen(): boolean {
        return editSectionsOpen.includes(true);
    }

    function ViewTraitRow({ trait, index }: { trait: Trait; index: number }): JSX.Element {
        let colorToUse: string | undefined;
        if (colorSection) {
            const spaceRole: SpaceRole = trait as SpaceRole;
            colorToUse = spaceRole.color ? spaceRole.color.color : '#FFFFFF';
        }
        const testIdTraitName = traitName.replace(' ', '');
        const userIsNotEditingATag = !editSectionsOpen.find(value => value);
        return (
            <div className={`viewTagRow ${traitNameClass}`} data-testid="traitRow">
                {colorSection &&
                    <div className="viewTagRowColorCircle">
                        <span data-testid="myRolesCircle"
                            style={{'backgroundColor': colorToUse}}
                            className={`myTraitsCircle ${colorToUse === '#FFFFFF' ? 'whiteCircleBorder' : ''}`}
                        />
                    </div>
                }
                <span className="traitName" data-testid={`given${testIdTraitName}Name`}>
                    {trait.name}
                </span>
                {userIsNotEditingATag && !showEditState && (
                    <div>
                        <button
                            className="traitEditIcon"
                            data-testid={`${testIdTraitName}EditIcon`}
                            onClick={(): void => toggleEditSection(index)}
                            onKeyDown={(e): void => handleKeyDownForToggleEditSection(e, index)}>
                            <i className="fas fa-pen fa-s"/>
                        </button>
                        <button className="traitDeleteIcon"
                            data-testid={`${testIdTraitName}DeleteIcon`}
                            onClick={(): void => showDeleteConfirmationModal(trait)}
                            onKeyDown={(e): void => handleKeyDownForShowDeleteConfirmationModal(e, trait)}
                        >
                            <i className="fas fa-trash fa-s" />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    const AddNewTagRow = (): JSX.Element => {
        const handleAddNewTagClick = (event: React.KeyboardEvent, isAddSectionOpen: boolean): void => {
            if (event.key === 'Enter') {
                setShowEditState(isAddSectionOpen);
            }
        };

        return !showEditState ? (
            <button className="addNewTagRow"
                disabled={isEditBoxOpen()}
                data-testid={createDataTestId('addNewButton', traitName)}
                onClick={(): void => setShowEditState(true)}
                onKeyDown={(e): void => handleAddNewTagClick(e, true)}>
                <div className="addNewTagCircle" data-testid="addNewTraitCircle">
                    <img src={PlusIcon} alt="Add Trait Icon"/>
                </div>
                <span className="traitName addNewTraitText">
                    Add New {toTitleCase(traitName)}
                </span>
            </button>
        ) : (
            <EditTraitSection
                closeCallback={(): void => setShowEditState(false)}
                updateCallback={updateTraits}
                traitClient={traitClient}
                traitName={traitName}
                colorSection={colorSection}
                currentSpace={currentSpace}
                listOfTraits={traits}/>
        );
    };

    return (
        <div data-testid={createDataTestId('tagsModalContainer', traitName)}
            className="myTraitsModalContainer">
            {!colorSection && <div className="title"> {title}</div>}
            {traits.map((trait: Trait, index: number) => {
                return (
                    <React.Fragment key={index}>
                        {!editSectionsOpen[index] &&
                        <ViewTraitRow trait={trait} index={index}/>
                        }
                        {editSectionsOpen[index] &&
                        <EditTraitSection
                            closeCallback={(): void => toggleEditSection(index)}
                            updateCallback={updateTraits}
                            trait={trait}
                            colorSection={colorSection}
                            traitClient={traitClient}
                            traitName={traitName}
                            currentSpace={currentSpace}
                            listOfTraits={traits}/>
                        }
                    </React.Fragment>
                );
            })}
            <AddNewTagRow />
            {confirmDeleteModal}
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptions(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyTraits);
/* eslint-enable */
