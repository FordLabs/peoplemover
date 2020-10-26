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
    addNewButtonLabel: string;
    testIdSuffix: TagType;
    tagName: TagNameType;
    onSave: (value: TagRequest) => Promise<unknown>;
}

const AddNewTagRow = ({
    colorDropdown,
    addNewButtonLabel,
    testIdSuffix,
    onSave,
    tagName,
}: Props): JSX.Element => {
    const [showEditState, setShowEditState] = useState<boolean>(false);

    const openEditTagRow = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            setShowEditState(true);
        }
    };

    const onCancel = (): void => {
        setShowEditState(false);
    };

    const onSaveTag = async (value: TagRequest): Promise<unknown> => {
        return await onSave(value).then(() => {
            setShowEditState(false);
        });
    };

    return !showEditState ? (
        <button className="addNewTagRow"
            disabled={showEditState}
            data-testid={createDataTestId('addNewButton', testIdSuffix)}
            onClick={(): void => setShowEditState(true)}
            onKeyDown={(e): void => openEditTagRow(e)}>
            <div className="addNewTagCircle" data-testid="addNewTraitCircle">
                <img src={PlusIcon} alt="Add Tag Icon"/>
            </div>
            <span className="traitName addNewTraitText">
                Add New {addNewButtonLabel}
            </span>
        </button>
    ) : (
        <EditTagRow
            tagName={tagName}
            onSave={onSaveTag}
            onCancel={onCancel}
            testIdSuffix={testIdSuffix}
            colorDropdown={colorDropdown}
        />
    );
};

export default AddNewTagRow;
