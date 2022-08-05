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
import {createDataTestId} from 'Utils/ReactUtils';
import EditTagRow from '../EditTagRow/EditTagRow';
import {TagRequest} from 'Types/TagRequest';
import {TagNameType, TagType} from 'Common/SubHeader/SortingAndFiltering/FilterLibraries';
import {Color} from 'Types/Color';

interface Props {
    colors?: Array<Color>;
    addNewButtonLabel: TagNameType;
    disabled: boolean;
    tagType: TagType;
    onSave: (value: TagRequest) => Promise<unknown>;
    onAddingTag: (isAdding: boolean) => void;
    existingTags: Array<TagRequest>;
}

const AddNewTagRow = ({
    colors,
    addNewButtonLabel,
    disabled,
    onSave,
    tagType,
    onAddingTag,
    existingTags,
}: Props): JSX.Element => {
    const testIdSuffix = tagType;
    const [showAddTagState, setShowAddTagState] = useState<boolean>(false);

    const updateViewState = (isAdding: boolean): void => {
        onAddingTag(isAdding);
        setShowAddTagState(isAdding);
    };

    const openAddTagRow = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') updateViewState(true);
    };

    const onCancel = (): void => {
        updateViewState(false);
    };

    const onSaveTag = async (value: TagRequest): Promise<unknown> => {
        return await onSave(value).then(() => {
            updateViewState(false);
        });
    };

    return !showAddTagState ? (
        <button className="addNewTagRow"
            disabled={disabled}
            data-testid={createDataTestId('addNewButton', testIdSuffix)}
            onClick={(): void => updateViewState(true)}
            onKeyDown={(e): void => openAddTagRow(e)}>
            <div className="addNewTagCircle" data-testid="addNewTraitCircle">
                <i className="material-icons">add_circle</i>
            </div>
            <span className="tagName addNewTraitText">
                Add New {addNewButtonLabel}
            </span>
        </button>
    ) : (
        <EditTagRow
            tagType={tagType}
            onSave={onSaveTag}
            onCancel={onCancel}
            colors={colors}
            existingTags={existingTags}
        />
    );
};

export default AddNewTagRow;
