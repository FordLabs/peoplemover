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
import React, {ReactNode, useState} from 'react';
import {createDataTestId} from '../tests/TestUtils';
import PlusIcon from '../Application/Assets/plusIcon.png';
import EditTagRow from './EditTagRow';
import {TagNameType, TagType} from './TagForms.types';
import {TagRequest} from '../Tags/TagRequest.interface';

interface Props {
    colorDropdown?: ReactNode;
    addNewButtonLabel: TagNameType;
    disabled: boolean;
    tagType: TagType;
    onSave: (value: TagRequest) => Promise<unknown>;
    onAddingTag: (isAdding: boolean) => void;
}

const AddNewTagRow = ({
    colorDropdown,
    addNewButtonLabel,
    disabled,
    onSave,
    tagType,
    onAddingTag,
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
                <img src={PlusIcon} alt="Add Tag Icon"/>
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
            colorDropdown={colorDropdown}
        />
    );
};

export default AddNewTagRow;
