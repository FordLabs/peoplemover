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

import React, {ChangeEvent, ReactNode, useState} from 'react';
import SaveIcon from '../Application/Assets/saveIcon.png';
import CloseIcon from '../Application/Assets/closeIcon.png';
import {JSX} from '@babel/types';
import {createDataTestId} from '../tests/TestUtils';
import {TagType} from './TagForms.types';
import {TagRequest} from '../Tags/TagRequest.interface';

import './TagRowsContainer.scss';

interface Props {
    colorDropdown?: ReactNode;
    initialValue?: TagRequest;
    onSave: (value: TagRequest) => Promise<unknown>;
    onCancel: () => void;
    tagType: TagType;
    existingTags: Array<TagRequest>;
}

function EditTagRow({
    colorDropdown,
    tagType,
    initialValue = { name: '' },
    onSave,
    onCancel,
    existingTags = [],
}: Props): JSX.Element {
    const testIdSuffix = tagType;
    const tagNameClass = tagType.replace(' ', '_');
    const [tagInputValue, setTagInputValue] = useState<TagRequest>(initialValue);
    const [showDuplicatedTagErrorMessage, setShowDuplicatedTagErrorMessage] = useState<boolean>(false);

    const saveTag = (tagValue: TagRequest): void => {
        onSave(tagValue).catch((error) => {
            if (error.response.status === 409) {
                setShowDuplicatedTagErrorMessage(true);
            }
        });
    };

    const handleEnterSubmit = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') saveTag(tagInputValue);
    };

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const newInputValue = {
            id: initialValue.id,
            name: event.target.value,
        };
        setTagInputValue(newInputValue);
        if(newNameIsDuplicated()){
            setShowDuplicatedTagErrorMessage(true)
        } else if(showDuplicatedTagErrorMessage === true){
            setShowDuplicatedTagErrorMessage(false);
        }
    };

    function newNameIsDuplicated() {
        return existingTags.map<string>(tag => tag.name).includes(tagInputValue.name);
    }

    let isTraitNameInvalid = tagInputValue.name === ''
        || showDuplicatedTagErrorMessage
        || newNameIsDuplicated()
        || (tagInputValue.name.toLowerCase() === initialValue?.name?.toLowerCase() );
            // && initialValue.name?.color === initialValue.name?.color);

    return (
        <>
            <div className={`editTagRow ${tagNameClass}`}
                data-testid={createDataTestId('editTagRow', testIdSuffix)}>
                {colorDropdown}
                <input className={`editTagInput ${tagNameClass}`}
                    data-testid="tagNameInput"
                    type="text"
                    value={tagInputValue.name}
                    onChange={handleOnChange}
                    onKeyPress={handleEnterSubmit}/>
                <div className="editTagIcons">
                    <button onClick={onCancel}
                        data-testid="cancelTagButton"
                        className="closeEditTagButton"
                        aria-label="Close Edited Tag">
                        <img src={CloseIcon} alt=""/>
                    </button>
                    <button disabled={isTraitNameInvalid}
                        onClick={(): void => saveTag(tagInputValue)}
                        data-testid="saveTagButton"
                        className="saveEditTagButton"
                        aria-label="Save Edited Tag">
                        <img src={SaveIcon} alt=""/>
                    </button>
                </div>
            </div>
            {showDuplicatedTagErrorMessage && (
                <div className="duplicateErrorMessage">
                    Oops! You already have this {tagType} Please try using a different one.
                </div>
            )}
        </>
    );
}

export default EditTagRow;
