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

import {JSX} from '@babel/types';
import React, {useState} from 'react';
import {Tag} from './Tag.interface';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {TagRequest} from './TagRequest.interface';
import LocationClient from '../Locations/LocationClient';
import sortTagsAlphabetically from './sortTagsAlphabetically';
import {RoleTag} from '../Roles/Role.interface';
import {createDataTestId} from '../tests/TestUtils';
import {INACTIVE_EDIT_STATE_INDEX, TagAction} from './MyTagsForm';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Space} from '../Space/Space';

interface Props {
    locations: Array<Tag>;
    updateLocations: any;
    updateFilterOptions(index: number, tag: Tag, action: TagAction): void;
    currentSpace: Space;
}

const LocationTags = ({ 
    locations, 
    updateLocations,
    updateFilterOptions,
    currentSpace, 
}: Props): JSX.Element => {
    const tagType = 'location';
    const locationFilterIndex = 0;
    const [editLocationIndex, setEditLocationIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);

    const showDeleteConfirmationModal = (locationToDelete: Tag): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: () => deleteLocation(locationToDelete),
            close: () => setConfirmDeleteModal(null),
            warningMessage: 'Deleting this location will remove it from any product that has been given this location.',
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
                updateLocations((prevLocations: Array<Tag>) => {
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
                updateLocations((prevLocations: Array<Tag>) => {
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
                updateLocations((prevLocations: Array<Tag>) => prevLocations.filter((location: RoleTag) => location.id !== locationToDelete.id));
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

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(LocationTags);
/* eslint-enable */
