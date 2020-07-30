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

import React, {useEffect, useState} from 'react';
import '../Traits/MyTraits.scss';
import '../Modal/Form.scss';
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
import {Space} from '../SpaceDashboard/Space';

interface MyTraitsProps {
    currentSpace: Space;
    title?: string;
    traitClient: TraitClient;
    setTraitSectionOpen: Function;
    colorSection: boolean;
    traitName: string;
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
    setTraitSectionOpen,
    colorSection,
    traitName,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
}: MyTraitsProps): JSX.Element {
    const [traits, setTraits] = useState<Array<Trait>>([]);
    const [addSectionOpen, setAddSectionOpen] = useState<boolean>(false);
    const [editSectionsOpen, setEditSectionsOpen] = useState<Array<boolean>>([]);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

    useEffect(() => {
        async function setup(): Promise<void> {
            const response = await traitClient.get(currentSpace.name);
            const traitResponse: Array<Trait> = response.data;
            setTraits(traitResponse);
            setEditSectionsOpen(new Array(traitResponse.length).fill(false));
        }

        setup().then();
    }, []);

    useEffect(() => {
        setTraitSectionOpen(checkForUnsavedChanges());
        return (): void => setTraitSectionOpen(false);
    }, [addSectionOpen, editSectionsOpen]);

    useEffect(() => {
        sortTraitsAlphabetically(traits);
    }, [traits]);

    function sortTraitsAlphabetically(traits: Array<Trait>): void {
        traits.sort( (trait1: Trait, trait2: Trait) => {
            return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
        });
    }

    function checkForUnsavedChanges(): boolean {
        const editSectionOpen: boolean = editSectionsOpen.includes(true);
        return addSectionOpen || editSectionOpen;
    }

    function updateTraits(trait: Trait): void {
        setTraits(prevTraits => {
            const updating: boolean = prevTraits.some(prevTrait => prevTrait.id === trait.id);
            if (updating) {
                updateGroupedTagFilterOptions(traitName, trait, TraitAction.EDIT);
                return prevTraits.map(prevTrait => prevTrait.id !== trait.id ? prevTrait : trait);
            } else {
                updateGroupedTagFilterOptions(traitName, trait, TraitAction.ADD);
                return [...prevTraits, trait];
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
            await traitClient.delete(traitToDelete.id);
            setConfirmDeleteModal(null);
            setTraits(prevTraits => prevTraits.filter(trait => trait.id !== traitToDelete.id));
            updateGroupedTagFilterOptions(traitName, traitToDelete, TraitAction.DELETE);
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
            warningMessage: `Deleting this ${traitName} will remove it from any person or product that has been given this ${traitName}.`,
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

    return (
        <div data-testid="myTraitsModalContainer"
            className="myTraitsModalContainer">

            {!colorSection && <div className="title"> {title}</div>}

            {traits.map((trait: Trait, index: number) => {
                let colorToUse: string | undefined;
                if (colorSection) {
                    const spaceRole: SpaceRole = trait as SpaceRole;
                    colorToUse = spaceRole.color ? spaceRole.color.color : '#FFFFFF';
                }
                const testIdTraitName = traitName.replace(' ', '');
                return (
                    <React.Fragment key={index}>
                        {!editSectionsOpen[index] && <div className="traitRow" data-testid="traitRow">
                            { colorSection &&
                                <span data-testid="myRolesCircle"
                                    style={{'backgroundColor': colorToUse}}
                                    className={`myTraitsCircle ${colorToUse === '#FFFFFF' ? 'whiteCircleBorder' : ''}`}
                                />
                            }

                            <span className="traitName" data-testid={`given${testIdTraitName}Name`}>{trait.name}</span>
                            <div className="traitIcons">
                                <i className="fas fa-pen fa-xs traitEditIcon" data-testid={`${testIdTraitName}EditIcon`}
                                    onClick={(): void => toggleEditSection(index)}/>
                                <i className="fas fa-trash fa-xs traitDeleteIcon" data-testid={`${testIdTraitName}DeleteIcon`}
                                    onClick={(): void => showDeleteConfirmationModal(trait)}/>
                            </div>
                        </div>
                        }
                        {editSectionsOpen[index] && <EditTraitSection
                            closeCallback={(): void => toggleEditSection(index)}
                            updateCallback={updateTraits}
                            trait={trait}
                            colorSection={colorSection}
                            traitClient={traitClient}
                            traitName={traitName}
                            currentSpace={currentSpace}
                        />
                        }
                    </React.Fragment>
                );
            })}
            {addSectionOpen && <EditTraitSection
                closeCallback={(): void => setAddSectionOpen(false)}
                updateCallback={updateTraits}
                traitClient={traitClient}
                traitName={traitName}
                colorSection={colorSection}
                currentSpace={currentSpace}/>
            }
            {!addSectionOpen && <div className="traitRow addNewTraitRow"
                onClick={(): void => setAddSectionOpen(true)}>
                <span data-testid="addNewTraitCircle"
                    className="myTraitsCircle addNewTraitUnfilledCircle">
                    <i className="fa fa-plus orangeIcon addTraitIcon"/>
                </span>
                <span className="traitName addNewTraitText"
                    data-testid={`addNew${toTitleCase(traitName).replace(' ', '')}`}>
                    Add New {toTitleCase(traitName)}
                </span>
            </div>
            }
            {confirmDeleteModal}
        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptions(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyTraits);