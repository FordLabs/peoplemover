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

import React, {useState} from 'react';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import warningIcon from '../Application/Assets/warningIcon.svg';
import LocationClient from '../Locations/LocationClient';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import {Tag} from './Tag.interface';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {Space} from '../Space/Space';
import ProductTagClient from '../ProductTag/ProductTagClient';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {JSX} from '@babel/types';
import {RoleTag} from '../Roles/Role.interface';
import {FilterOption} from '../CommonTypes/Option';
import {createDataTestId} from '../tests/TestUtils';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';
import {TagRequest} from './TagRequest.interface';
import sortTagsAlphabetically from './sortTagsAlphabetically';
import {Location} from '../Locations/Location.interface';
import {ProductTag} from '../ProductTag/ProductTag';

import '../ModalFormComponents/TagRowsContainer.scss';
import ViewTagRow from "../ModalFormComponents/ViewTagRow";

const INACTIVE_EDIT_STATE_INDEX = -1;

enum TagAction {
    ADD,
    EDIT,
    DELETE
}

interface LocationTagsProps {
    locations: Array<Tag>;
    setLocations: any;
}

interface ProductTagsProps {
    productTags: Array<Tag>;
    setProductTags: any;
}

interface Props {
    locations: Array<Location>;
    productTags: Array<ProductTag>;
    currentSpace: Space;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function MyTagsForm({ locations, productTags, currentSpace, allGroupedTagFilterOptions, setAllGroupedTagFilterOptions }: Props): JSX.Element {
    const [locationTagsList, setLocationTagsList] = useState<Array<Tag>>(locations);
    const [productTagsList, setProductTagsList] = useState<Array<Tag>>(productTags);
    // @todo abstract filter methods away to redux please
    const getUpdatedFilterOptions = (index: number, tag: Tag, action: TagAction): Array<FilterOption> => {
        let options: Array<FilterOption>;
        switch (action) {
            case TagAction.ADD:
                options = [
                    ...allGroupedTagFilterOptions[index].options,
                    {label: tag.name, value: tag.id.toString() + '_' + tag.name, selected: false},
                ];
                break;
            case TagAction.EDIT:
                options = allGroupedTagFilterOptions[index].options.map(val =>
                    !val.value.includes(tag.id.toString() + '_') ?
                        val :
                        {
                            label: tag.name,
                            value: tag.id.toString() + '_' + tag.name,
                            selected: val.selected,
                        }
                );
                break;
            case TagAction.DELETE:
                options = allGroupedTagFilterOptions[index].options.filter(val => val.label !== tag.name);
                break;
            default:
                options = [];
        }
        return options;
    };


    function updateFilterOptions(optionIndex: number, tag: Tag, action: TagAction): void {
        const groupedFilterOptions = [...allGroupedTagFilterOptions];
        groupedFilterOptions[optionIndex]
            .options = getUpdatedFilterOptions(optionIndex, tag, action);
        setAllGroupedTagFilterOptions(groupedFilterOptions);
    }

    const LocationTags = ({ locations, setLocations }: LocationTagsProps): JSX.Element => {
        const tagType = 'location';
        const locationFilterIndex = 0;
        const [editLocationIndex, setEditLocationIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
        const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
        const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);

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
                    const newLocation: Tag = response.data;
                    updateFilterOptions(locationFilterIndex, newLocation, TagAction.EDIT);
                    setLocations((prevLocations: Array<Tag>) => {
                        const locations = prevLocations.map(tag => tag.id !== location.id ? tag : newLocation);
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
                    updateFilterOptions(locationFilterIndex, newLocation, TagAction.ADD);
                    setLocations((prevLocations: Array<Tag>) => {
                        const locations = [...prevLocations, newLocation];
                        sortTagsAlphabetically(locations);
                        return locations;
                    });

                    returnToViewState();
                });
        };

        const deleteLocation = async (locationToDelete: Tag): Promise<void> => {
            try {
                if (currentSpace.uuid) {
                    await LocationClient.delete(locationToDelete.id, currentSpace.uuid);
                    setConfirmDeleteModal(null);
                    updateFilterOptions(locationFilterIndex, locationToDelete, TagAction.DELETE);
                    setLocations((prevLocations: Array<Tag>) => prevLocations.filter((location: RoleTag) => location.id !== locationToDelete.id));
                }
            } catch {
                return;
            }
        };

        const showEditButtons = (): boolean => editLocationIndex === INACTIVE_EDIT_STATE_INDEX && !isAddingNewTag;

        const showViewState = (index: number): boolean => editLocationIndex !== index;

        const showEditState = (index: number): boolean => editLocationIndex === index;

        return (
            <div data-testid={createDataTestId('tagsModalContainer', tagType)}
                className="myTraitsModalContainer">
                <div className="title">Location Tags</div>
                {locations.map((location: Tag, index: number) => {
                    return (
                        <React.Fragment key={index}>
                            {showViewState(index) &&
                            <ViewTagRow
                                tagType={tagType}
                                index={index}
                                tag={location}
                                setConfirmDeleteModal={(): void => showDeleteConfirmationModal(location)}
                                showEditButtons={showEditButtons()}
                                editTagCallback={(): void => setEditLocationIndex(index)}
                            />
                            }
                            {showEditState(index) &&
                                <EditTagRow
                                    initialValue={location}
                                    onSave={editLocation}
                                    onCancel={returnToViewState}
                                    tagType={tagType}
                                />
                            }
                        </React.Fragment>
                    );
                })}
                <AddNewTagRow
                    addNewButtonLabel="Location"
                    disabled={!showEditButtons()}
                    tagType={tagType}
                    onSave={addLocation}
                    onAddingTag={setIsAddingNewTag}
                />
                {confirmDeleteModal}
            </div>
        );
    };

    const ProductTags = ({ productTags, setProductTags }: ProductTagsProps): JSX.Element => {
        const tagType = 'product tag';
        const productTagFilterIndex = 1;
        const [editProductTagIndex, setEditProductTagIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
        const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
        const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);

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
                    const newProductTag: Tag = response.data;
                    updateFilterOptions(productTagFilterIndex, newProductTag, TagAction.EDIT);
                    setProductTags((prevProductTag: Array<Tag>) => {
                        const productTags = prevProductTag.map((tag: Tag) => tag.id !== productTag.id ? tag : newProductTag);
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
                    updateFilterOptions(productTagFilterIndex, newProductTag, TagAction.ADD);
                    setProductTags((prevProductTag: Array<Tag>) => {
                        const productTags = [...prevProductTag, newProductTag];
                        sortTagsAlphabetically(productTags);
                        return productTags;
                    });

                    returnToViewState();
                });
        };

        const deleteProductTag = async (productTagToDelete: Tag): Promise<void> => {
            try {
                if (currentSpace.uuid) {
                    await ProductTagClient.delete(productTagToDelete.id, currentSpace.uuid);
                    setConfirmDeleteModal(null);
                    updateFilterOptions(productTagFilterIndex, productTagToDelete, TagAction.DELETE);
                    setProductTags((prevProductTags: Array<Tag>) =>
                        prevProductTags.filter((productTag: RoleTag) => productTag.id !== productTagToDelete.id)
                    );
                }
            } catch {
                return;
            }
        };

        const showEditButtons = (): boolean => editProductTagIndex === INACTIVE_EDIT_STATE_INDEX && !isAddingNewTag;

        const showViewState = (index: number): boolean => editProductTagIndex !== index;

        const showEditState = (index: number): boolean => editProductTagIndex === index;

        return (
            <div data-testid={createDataTestId('tagsModalContainer', tagType)}
                className="myTraitsModalContainer">
                <div className="title">Product Tags</div>
                {productTags.map((productTag: Tag, index: number) => {
                    return (
                        <React.Fragment key={index}>
                            {showViewState(index) &&
                                <ViewTagRow
                                    tagType={tagType}
                                    index={index}
                                    tag={productTag}
                                    setConfirmDeleteModal={(): void => showDeleteConfirmationModal(productTag)}
                                    showEditButtons={showEditButtons()}
                                    editTagCallback={(): void => setEditProductTagIndex(index)}
                                />
                            }
                            {showEditState(index) &&
                                <EditTagRow
                                    initialValue={productTag}
                                    onSave={editProductTag}
                                    onCancel={returnToViewState}
                                    tagType={tagType}
                                />
                            }
                        </React.Fragment>
                    );
                })}
                <AddNewTagRow
                    disabled={!showEditButtons()}
                    addNewButtonLabel="Product Tag"
                    tagType={tagType}
                    onSave={addProductTag}
                    onAddingTag={setIsAddingNewTag}
                />
                {confirmDeleteModal}
            </div>
        );
    };

    return (
        <div data-testid="myTagsModal" className="myTraitsContainer">
            <LocationTags locations={locationTagsList} setLocations={setLocationTagsList} />
            <div className="lineSeparator"/>
            <ProductTags productTags={productTagsList} setProductTags={setProductTagsList}  />
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
    locations: state.locations,
    productTags: state.productTags,
    currentSpace: state.currentSpace,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyTagsForm);
/* eslint-enable */
