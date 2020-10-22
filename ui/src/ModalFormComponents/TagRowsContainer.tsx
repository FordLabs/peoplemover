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

import React, {ReactNode, useEffect, useState} from 'react';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import {JSX} from '@babel/types';
import {TagClient} from '../Tags/TagClient';
import {Tag} from '../Tags/Tag';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptions} from '../Redux/Actions';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {FilterOption} from '../CommonTypes/Option';
import {Space} from '../Space/Space';
import PlusIcon from '../Application/Assets/plusIcon.png';
import {createDataTestId} from '../tests/TestUtils';

import './TagRowsContainer.scss';

export type TraitNameType = 'role' | 'product tag' | 'location'
export type TraitType = 'product' | 'person'

interface MyTraitsProps {
    tagRows: ReactNode;
    confirmDeleteModal: ReactNode;

    currentSpace: Space;
    traitClient: TagClient;
    traitType: TraitType;
    colorSection: boolean;
    traitName: TraitNameType;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

enum TagAction {
    ADD,
    EDIT,
    DELETE
}

function TagRowsContainer({
    tagRows,

    currentSpace,
    traitClient,
    colorSection,
    traitName,
    traitType,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
}: MyTraitsProps): JSX.Element {
    const [traits, setTraits] = useState<Array<Tag>>([]);
    const [showEditState, setShowEditState] = useState<boolean>(false);
    const [editSectionsOpen, setEditSectionsOpen] = useState<Array<boolean>>([]);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const traitNameClass = traitName.replace(' ', '_');

    useEffect(() => {
        async function setup(): Promise<void> {
            const response = await traitClient.get(currentSpace.uuid!!);
            const traitResponse: Array<Tag> = response.data;
            sortTraitsAlphabetically(traitResponse);
            setTraits(traitResponse);
            setEditSectionsOpen(new Array(traitResponse.length).fill(false));
        }

        setup().then();
    }, [currentSpace.uuid, traitClient]);

    function sortTraitsAlphabetically(traitsList: Array<Tag>): void {
        traitsList.sort( (trait1: Tag, trait2: Tag) => {
            return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
        });
    }

    function updateTraits(trait: Tag): void {
        setTraits(prevTraits => {
            const updating: boolean = prevTraits.some(prevTrait => prevTrait.id === trait.id);
            if (updating) {
                updateGroupedTagFilterOptions(traitName, trait, TagAction.EDIT);
                const traits = prevTraits.map(prevTrait => prevTrait.id !== trait.id ? prevTrait : trait);
                sortTraitsAlphabetically(traits);
                return traits;
            } else {
                updateGroupedTagFilterOptions(traitName, trait, TagAction.ADD);
                const traits = [...prevTraits, trait];
                sortTraitsAlphabetically(traits);
                return traits;
            }
        });
    }

    function toTitleCase(phrase: string): string {
        return phrase
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function isEditBoxOpen(): boolean {
        return editSectionsOpen.includes(true);
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
                    <img src={PlusIcon} alt="Add Tag Icon"/>
                </div>
                <span className="traitName addNewTraitText">
                    Add New {toTitleCase(traitName)}
                </span>
            </button>
        ) : (
            <EditTagRow
                closeCallback={(): void => setShowEditState(false)}
                updateCallback={updateTraits}
                traitClient={traitClient}
                traitName={traitName}
                colorSection={colorSection}
                currentSpace={currentSpace}/>
        );
    };

    return (
        <div data-testid={createDataTestId('tagsModalContainer', traitName)}
            className="myTraitsModalContainer">
            {tagRows}
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

export default connect(mapStateToProps, mapDispatchToProps)(TagRowsContainer);
/* eslint-enable */
