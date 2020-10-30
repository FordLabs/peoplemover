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
import ProductTagClient from '../ProductTag/ProductTagClient';
import sortTagsAlphabetically from './sortTagsAlphabetically';
import {RoleTag} from '../Roles/Role.interface';
import {createDataTestId} from '../tests/TestUtils';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';
import {INACTIVE_EDIT_STATE_INDEX, TagAction} from './MyTagsForm';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Space} from '../Space/Space';

interface Props {
    productTags: Array<Tag>;
    updateProductTags: any;
    updateFilterOptions(index: number, tag: Tag, action: TagAction): void;
    currentSpace: Space;
}

const ProductTags = ({ 
    productTags, 
    updateProductTags, 
    currentSpace, 
    updateFilterOptions,
}: Props): JSX.Element => {
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
                updateProductTags((prevProductTag: Array<Tag>) => {
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
                updateProductTags((prevProductTag: Array<Tag>) => {
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
                updateProductTags((prevProductTags: Array<Tag>) =>
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

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(ProductTags);
/* eslint-enable */