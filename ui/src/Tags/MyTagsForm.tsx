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
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptions} from '../Redux/Actions';
import warningIcon from '../Application/Assets/warningIcon.svg';
import LocationClient from '../Locations/LocationClient';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import {Tag} from './Tag';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {Space} from '../Space/Space';
import ViewTagRow from "../ModalFormComponents/ViewTagRow";

import '../ModalFormComponents/TagRowsContainer.scss';
import ProductTagClient from '../ProductTag/ProductTagClient';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {JSX} from '@babel/types';
import {SpaceRole} from '../Roles/Role';
import {FilterOption} from '../CommonTypes/Option';
import {createDataTestId} from '../tests/TestUtils';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';

const INACTIVE_EDIT_STATE_INDEX = -1;

enum TagAction {
    ADD,
    EDIT,
    DELETE
}

interface Props {
    currentSpace: Space;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function MyTagsForm({ currentSpace, allGroupedTagFilterOptions }: Props): JSX.Element {

    function sortTraitsAlphabetically(traitsList: Array<Tag>): void {
        traitsList.sort( (trait1: Tag, trait2: Tag) => {
            return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
        });
    }

    // @todo abstract away to redux please
    const updateFilterValuesInGroupedTags = (index: number, trait: Tag, action: TagAction): Array<FilterOption> => {
        let options: Array<FilterOption>;
        switch (action) {
            case TagAction.ADD:
                options = [
                    ...allGroupedTagFilterOptions[index].options,
                    {label: trait.name, value: trait.id.toString() + '_' + trait.name, selected: false},
                ];
                break;
            case TagAction.EDIT:
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
            case TagAction.DELETE:
                options = allGroupedTagFilterOptions[index].options.filter(val => val.label !== trait.name);
                break;
            default:
                options = [];
        }
        return options;
    };

    // function sortTraitsAlphabetically(traitsList: Array<Tag>): void {
    //     traitsList.sort( (trait1: Tag, trait2: Tag) => {
    //         return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
    //     });
    // }
    //
    // function updateTraits(trait: Tag): void {
    //     setTraits(prevTraits => {
    //         const updating: boolean = prevTraits.some(prevTrait => prevTrait.id === trait.id);
    //         if (updating) {
    //             updateGroupedTagFilterOptions(traitName, trait, TagAction.EDIT);
    //             const traits = prevTraits.map(prevTrait => prevTrait.id !== trait.id ? prevTrait : trait);
    //             sortTraitsAlphabetically(traits);
    //             return traits;
    //         } else {
    //             updateGroupedTagFilterOptions(traitName, trait, TagAction.ADD);
    //             const traits = [...prevTraits, trait];
    //             sortTraitsAlphabetically(traits);
    //             return traits;
    //         }
    //     });
    // }

    const LocationTags = (): JSX.Element => {
        const testIdSuffix = 'location';
        const [locations, setLocations] = useState<Array<Tag>>([]);
        const [editLocationIndex, setEditLocationIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
        const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

        function sortTraitsAlphabetically(traitsList: Array<Tag>): void {
            traitsList.sort( (trait1: Tag, trait2: Tag) => {
                return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
            });
        }

        useEffect(() => {
            async function setup(): Promise<void> {
                const response = await LocationClient.get(currentSpace.uuid!!);
                sortTraitsAlphabetically(response.data);
                setLocations(response.data);
            }

            setup().then();
        }, [currentSpace.uuid]);

        // @todo refactor
        function updateLocationFilterOptions(role: Tag, action: TagAction ): void {
            const groupedFilterOptions = [...allGroupedTagFilterOptions];
            const locationFilterIndex = 0;
            groupedFilterOptions[locationFilterIndex]
                .options = updateFilterValuesInGroupedTags(locationFilterIndex, role, action);
            setAllGroupedTagFilterOptions(groupedFilterOptions);
        }

        const deleteLocation = async (roleToDelete: Tag): Promise<void> => {
            try {
                if (currentSpace.uuid) {
                    await LocationClient.delete(roleToDelete.id, currentSpace.uuid);
                    setConfirmDeleteModal(null);
                    setLocations(prevTraits => prevTraits.filter((location: SpaceRole) => location.id !== roleToDelete.id));
                    updateLocationFilterOptions(roleToDelete, TagAction.DELETE);
                }
            } catch {
                return;
            }
        };

        const showDeleteConfirmationModal = (roleToDelete: Tag): void => {
            const propsForDeleteConfirmationModal: ConfirmationModalProps = {
                submit: () => deleteLocation(roleToDelete),
                close: () => setConfirmDeleteModal(null),
                warningMessage: `Deleting this product tag will remove it from any product that has been given this product tag.`,
            };
            const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
            setConfirmDeleteModal(deleteConfirmationModal);
        };

        const onSave = (location: Tag): void => {
            // edit location
        };

        const onChange = (location: Tag): void => {
            // update input value
        };

        const onCancel = (): void => {
            setEditLocationIndex(INACTIVE_EDIT_STATE_INDEX);
        };

        return (
            <div data-testid={createDataTestId('tagsModalContainer', testIdSuffix)}
                className="myTraitsModalContainer">
                <div className="title">Location Tags</div>
                {locations.map((location: Tag, index: number) => {
                    return (
                        <React.Fragment key={index}>
                            {editLocationIndex != index &&
                                <ViewTagRow
                                    testIdSuffix={testIdSuffix}
                                    index={index}
                                    tag={location}
                                    setConfirmDeleteModal={(): void => showDeleteConfirmationModal(location)}
                                    showEditButtons={editLocationIndex === INACTIVE_EDIT_STATE_INDEX}
                                    editTagCallback={(): void => setEditLocationIndex(index)}
                                />
                            }
                            {editLocationIndex === index &&
                               <EditTagRow
                                   defaultInputValue=""
                                   onSave={(): void => onSave(location)}
                                   onCancel={onCancel}
                                   tagName="Location"
                                   testIdSuffix={testIdSuffix}
                               />
                            }
                        </React.Fragment>
                    );
                })}
                <AddNewTagRow
                    addNewButtonLabel="Location"
                    testIdSuffix={testIdSuffix}
                />
                {confirmDeleteModal}
            </div>
        );
    };

    const ProductTags = (): JSX.Element => {
        const testIdSuffix = 'product tag';
        const [productTags, setProductTags] = useState<Array<Tag>>([]);
        const [editProductTagIndex, setEditProductTagIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
        const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

        useEffect(() => {
            async function setup(): Promise<void> {
                const response = await ProductTagClient.get(currentSpace.uuid!!);
                sortTraitsAlphabetically(response.data);
                setProductTags(response.data);
            }

            setup().then();
        }, [currentSpace.uuid]);

        // @todo refactor
        function updateProductTagFilterOptions(productTag: Tag, action: TagAction ): void {
            const groupedFilterOptions = [...allGroupedTagFilterOptions];
            const productTagFilterIndex = 1;
            groupedFilterOptions[productTagFilterIndex]
                .options = updateFilterValuesInGroupedTags(productTagFilterIndex, productTag, action);
            setAllGroupedTagFilterOptions(groupedFilterOptions);
        }

        const deleteProductTag = async (productTagToDelete: Tag): Promise<void> => {
            try {
                if (currentSpace.uuid) {
                    await ProductTagClient.delete(productTagToDelete.id, currentSpace.uuid);
                    setConfirmDeleteModal(null);
                    setProductTags(prevTraits =>
                        prevTraits.filter((productTag: SpaceRole) => productTag.id !== productTagToDelete.id)
                    );
                    updateProductTagFilterOptions(productTagToDelete, TagAction.DELETE);
                }
            } catch {
                return;
            }
        };

        const showDeleteConfirmationModal = (productTagToDelete: Tag): void => {
            const propsForDeleteConfirmationModal: ConfirmationModalProps = {
                submit: () => deleteProductTag(productTagToDelete),
                close: () => setConfirmDeleteModal(null),
                warningMessage: `Deleting this product tag will remove it from any product that has been given this product tag.`,
            };
            const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
            setConfirmDeleteModal(deleteConfirmationModal);
        };

        const onSave = (productTag: string): void => {
            console.log('SAVE PRODUCT TAG: ', productTag);
        };

        const onCancel = (): void => {
            setEditProductTagIndex(INACTIVE_EDIT_STATE_INDEX);
        };

        return (
            <div data-testid={createDataTestId('tagsModalContainer', testIdSuffix)}
                className="myTraitsModalContainer">
                <div className="title">Product Tags</div>
                {productTags.map((productTag: Tag, index: number) => {
                    return (
                        <React.Fragment key={index}>
                            {editProductTagIndex !== index &&
                                <ViewTagRow
                                    testIdSuffix={testIdSuffix}
                                    testIdSuffix={testIdSuffix}
                                    index={index}
                                    tag={productTag}
                                    setConfirmDeleteModal={(): void => showDeleteConfirmationModal(location)}
                                    showEditButtons={editProductTagIndex === INACTIVE_EDIT_STATE_INDEX}
                                    editTagCallback={(): void => setEditProductTagIndex(index)}
                                />
                            }
                            {editProductTagIndex === index &&
                                <EditTagRow
                                    defaultInputValue=""
                                    onSave={(): void => onSave(productTag)}
                                    onCancel={onCancel}
                                    tagName="Product Tag"
                                    testIdSuffix={testIdSuffix}
                                />
                            }
                        </React.Fragment>
                    );
                })}
                <AddNewTagRow
                    addNewButtonLabel="Product Tag"
                    testIdSuffix={testIdSuffix}
                    onSave={onSave}
                />
                {confirmDeleteModal}
            </div>
        );
    };

    return (
        <div data-testid="myTagsModal" className="myTraitsContainer">
            <LocationTags />
            <div className="lineSeparator"/>
            <ProductTags />
            <div className="traitWarning">
                <img src={warningIcon} className="warningIcon" alt="warning icon"/>
                <p className="warningText">
                    Editing or deleting a tag will affect any product currently tagged with it.
                </p>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(MyTagsForm);
/* eslint-enable */
