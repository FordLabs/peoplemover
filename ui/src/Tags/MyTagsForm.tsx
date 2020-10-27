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
import {Tag} from './Tag.interface';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {Space} from '../Space/Space';
import ViewTagRow from "../ModalFormComponents/ViewTagRow";

import '../ModalFormComponents/TagRowsContainer.scss';
import ProductTagClient from '../ProductTag/ProductTagClient';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {JSX} from '@babel/types';
import {RoleTag} from '../Roles/Role.interface';
import {FilterOption} from '../CommonTypes/Option';
import {createDataTestId} from '../tests/TestUtils';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';
import {TagRequest} from './TagRequest.interface';
import sortTagsAlphabetically from './sortTagsAlphabetically';

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

function MyTagsForm({currentSpace, allGroupedTagFilterOptions}: Props): JSX.Element {
    //@todo check location and products are labeled correctly
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
                sortTagsAlphabetically(response.data);
                setLocations(response.data);
            }

            setup().then();
        }, [currentSpace.uuid]);

        // @todo refactor
        function updateLocationFilterOptions(location: Tag, action: TagAction): void {
            const groupedFilterOptions = [...allGroupedTagFilterOptions];
            const locationFilterIndex = 0;
            groupedFilterOptions[locationFilterIndex]
                .options = updateFilterValuesInGroupedTags(locationFilterIndex, location, action);
            setAllGroupedTagFilterOptions(groupedFilterOptions);
        }

        const deleteLocation = async (locationToDelete: Tag): Promise<void> => {
            try {
                if (currentSpace.uuid) {
                    await LocationClient.delete(locationToDelete.id, currentSpace.uuid);
                    setConfirmDeleteModal(null);
                    setLocations(prevTraits => prevTraits.filter((location: RoleTag) => location.id !== locationToDelete.id));
                    updateLocationFilterOptions(locationToDelete, TagAction.DELETE);
                }
            } catch {
                return;
            }
        };

        const showDeleteConfirmationModal = (locationToDelete: Tag): void => {
            const propsForDeleteConfirmationModal: ConfirmationModalProps = {
                submit: () => deleteLocation(locationToDelete),
                close: () => setConfirmDeleteModal(null),
                warningMessage: `Deleting this location will remove it from any product that has been given this location.`,
            };
            const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
            setConfirmDeleteModal(deleteConfirmationModal);
        };

        const returnToViewState = (): void => {
            setEditLocationIndex(INACTIVE_EDIT_STATE_INDEX);
        };

        const editLocation = async (location: TagRequest): Promise<unknown> => {
            return await LocationClient.edit(location, currentSpace.uuid!!)
                .then((response) => {
                    setLocations(prevLocations => {
                        const newLocation: Tag = response.data;
                        updateLocationFilterOptions(newLocation, TagAction.EDIT);
                        const locations = prevLocations.map(prevTrait => prevTrait.id !== location.id ? prevTrait : newLocation);
                        sortTagsAlphabetically(locations);
                        return locations;
                    });

                    returnToViewState();
                });
        };

        const addLocation = async (location: TagRequest): Promise<unknown> => {
            return await LocationClient.add(location, currentSpace.uuid!!)
                .then((response) => {
                    const newLocation: Tag = response.data;
                    setLocations(prevLocations => {
                        updateLocationFilterOptions(newLocation, TagAction.ADD);
                        const locations = [...prevLocations, newLocation];
                        sortTagsAlphabetically(locations);
                        return locations;
                    });

                    returnToViewState();
                });
        };

        const onCancel = (): void => {
            returnToViewState();
        };

        return (
            <div data-testid={createDataTestId('tagsModalContainer', testIdSuffix)}
                className="myTraitsModalContainer">
                <div className="title">Location Tags</div>
                {locations.map((location: Tag, index: number) => {
                    return (
                        <React.Fragment key={index}>
                            {editLocationIndex !== index &&
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
                                initialValue={location}
                                onSave={editLocation}
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
                    tagName="Location"
                    testIdSuffix={testIdSuffix}
                    onSave={addLocation}
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
                sortTagsAlphabetically(response.data);
                setProductTags(response.data);
            }

            setup().then();
        }, [currentSpace.uuid]);

        // @todo refactor
        function updateProductTagFilterOptions(productTag: Tag, action: TagAction): void {
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
                        prevTraits.filter((productTag: RoleTag) => productTag.id !== productTagToDelete.id)
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

        const returnToViewState = (): void => {
            setEditProductTagIndex(INACTIVE_EDIT_STATE_INDEX);
        };

        const editProductTag = async (productTag: TagRequest): Promise<unknown> => {
            return await ProductTagClient.edit(productTag, currentSpace.uuid!!)
                .then((response) => {
                    setProductTags(prevProductTag => {
                        const newProductTag: Tag = response.data;
                        updateProductTagFilterOptions(newProductTag, TagAction.EDIT);
                        const productTags = prevProductTag.map(prevTrait => prevTrait.id !== productTag.id ? prevTrait : newProductTag);
                        sortTagsAlphabetically(productTags);
                        return productTags;
                    });

                    returnToViewState();
                });
        };

        const addProductTag = async (productTag: TagRequest): Promise<unknown> => {
            return await ProductTagClient.add(productTag, currentSpace.uuid!!)
                .then((response) => {
                    const newProductTag: Tag = response.data;
                    setProductTags(prevProductTag => {
                        updateProductTagFilterOptions(newProductTag, TagAction.ADD);
                        const productTags = [...prevProductTag, newProductTag];
                        sortTagsAlphabetically(productTags);
                        return productTags;
                    });

                    returnToViewState();
                });
        };

        const onCancel = (): void => {
            returnToViewState();
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
                                    index={index}
                                    tag={productTag}
                                    setConfirmDeleteModal={(): void => showDeleteConfirmationModal(location)}
                                    showEditButtons={editProductTagIndex === INACTIVE_EDIT_STATE_INDEX}
                                    editTagCallback={(): void => setEditProductTagIndex(index)}
                                />
                            }
                            {editProductTagIndex === index &&
                                <EditTagRow
                                    initialValue={productTag}
                                    onSave={editProductTag}
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
                    onSave={addProductTag}
                    tagName="Product Tag"
                />
                {confirmDeleteModal}
            </div>
        );
    };

    return (
        <div data-testid="myTagsModal" className="myTraitsContainer">
            <LocationTags/>
            <div className="lineSeparator"/>
            <ProductTags/>
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
