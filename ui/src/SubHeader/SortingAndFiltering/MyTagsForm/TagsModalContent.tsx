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

import {JSX} from '@babel/types';
import React, {useState} from 'react';
import ConfirmationModal, {ConfirmationModalProps} from 'Modal/ConfirmationModal/ConfirmationModal';
import {TagRequest} from 'Types/TagRequest';
import {createDataTestId} from 'Utils/ReactUtils';
import ViewTagRow from 'Common/ViewTagRow/ViewTagRow';
import EditTagRow from 'Common/EditTagRow/EditTagRow';
import AddNewTagRow from 'Common/AddNewTagRow/AddNewTagRow';
import {INACTIVE_EDIT_STATE_INDEX} from './MyTagsForm';
import {TagClient} from 'Types/TagClient';
import {FilterType} from 'SubHeader/SortingAndFiltering/FilterLibraries';
import {useRecoilValue} from 'recoil';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {Tag} from 'Types/Tag';

interface Props {
    tags: Array<Tag>;
    tagClient: TagClient;
    filterType: FilterType;
    fetchCommand: () => void;
}

const TagsModalContent = ({
    tags,
    tagClient,
    filterType,
    fetchCommand,
}: Props): JSX.Element => {
    const currentSpace = useRecoilValue(CurrentSpaceState);

    const [editTagIndex, setEditTagIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);

    const showDeleteConfirmationModal = (tagToDelete: Tag): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: () => deleteTag(tagToDelete),
            close: () => setConfirmDeleteModal(null),
            content: <div>Deleting this {filterType.tagType} will remove it from anything that has been given
                this {filterType.tagType}.</div>,
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    };

    const returnToViewState = (): void => {
        setEditTagIndex(INACTIVE_EDIT_STATE_INDEX);
    };

    const editTag = async (tagToEdit: TagRequest): Promise<unknown> => {
        return await tagClient.edit(tagToEdit, currentSpace)
            .then(() => {
                fetchCommand();
                returnToViewState();
            });
    };

    const addTag = async (tagToAdd: TagRequest): Promise<unknown> => {
        return await tagClient.add(tagToAdd, currentSpace)
            .then(() => {
                fetchCommand();
                returnToViewState();
            });
    };

    const deleteTag = async (tagToDelete: Tag): Promise<void> => {
        try {
            if (currentSpace.uuid) {
                await tagClient.delete(tagToDelete.id, currentSpace);
                setConfirmDeleteModal(null);
                fetchCommand();
            }
        } catch {
            return;
        }
    };

    const showEditButtons = (): boolean => editTagIndex === INACTIVE_EDIT_STATE_INDEX && !isAddingNewTag;

    const showViewState = (index: number): boolean => editTagIndex !== index;

    const showEditState = (index: number): boolean => editTagIndex === index;

    return (
        <div data-testid={createDataTestId('tagsModalContainer', filterType.tagType)} className="myTraitsModalContainer">
            {tags.map((currentTag: Tag, index: number) => {
                return (
                    <React.Fragment key={index}>
                        {showViewState(index) &&
                        <ViewTagRow
                            tagType={filterType.tagType}
                            tag={currentTag}
                            setConfirmDeleteModal={(): void => showDeleteConfirmationModal(currentTag)}
                            showEditButtons={showEditButtons()}
                            editTagCallback={(): void => setEditTagIndex(index)}
                        />
                        }
                        {showEditState(index) &&
                        <EditTagRow
                            initialValue={currentTag}
                            onSave={editTag}
                            onCancel={returnToViewState}
                            tagType={filterType.tagType}
                            existingTags={tags}
                        />
                        }
                    </React.Fragment>
                );
            })}
            <AddNewTagRow
                disabled={!showEditButtons()}
                addNewButtonLabel={filterType.tagNameType}
                tagType={filterType.tagType}
                onSave={addTag}
                onAddingTag={setIsAddingNewTag}
                existingTags={tags}
            />
            {confirmDeleteModal}
        </div>
    );
};

export default TagsModalContent;
