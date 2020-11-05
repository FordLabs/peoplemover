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
import {Color, RoleTag} from '../Roles/Role.interface';
import {OptionType} from './Select';
import ColorCircle from './ColorCircle';
import ColorDropdown from '../Roles/ColorDropdown';
import {Tag} from '../Tags/Tag.interface';
import RoleTags from '../Roles/RoleTags';
import {RoleEditRequest} from "../Roles/RoleEditRequest.interface";



interface Props {
    colors?: Array<Color>;
    initialValue?: TagRequest;
    onSave: (value: TagRequest) => Promise<unknown>;
    onCancel: () => void;
    tagType: TagType;
    existingTags: Array<TagRequest>;
}

function EditTagRow({
    colors,
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
        console.log(tagValue);
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
        const newInputValue = {...tagInputValue, name: event.target.value};
        console.log(newInputValue)
        setTagInputValue(newInputValue);
        if (newNameIsDuplicated(newInputValue.name)) {
            setShowDuplicatedTagErrorMessage(true);
        } else if (showDuplicatedTagErrorMessage === true) {
            setShowDuplicatedTagErrorMessage(false);
        }
    };

    function newNameIsDuplicated(newName: string) {
        return existingTags.map<string>(tag => tag.name).includes(newName);
    }

    const handleColorChange = (selectedOption: OptionType): void => {
        console.log("gg", ({...tagInputValue, colorId: ((selectedOption.value as Color).id) }) as RoleEditRequest)
        setTagInputValue(({...tagInputValue, colorId: ((selectedOption.value as Color).id) }) as RoleEditRequest);
    };

    let isTraitNameInvalid = tagInputValue.name === ''
        || showDuplicatedTagErrorMessage
        || newNameIsDuplicated(tagInputValue.name)
        || (tagInputValue.name.toLowerCase() === initialValue?.name?.toLowerCase() );
    // && initialValue.name?.color === initialValue.name?.color);

    return (
        <>
            <div className={`editTagRow ${tagNameClass}`}
                data-testid={createDataTestId('editTagRow', testIdSuffix)}>
                { colors && <ColorDropdown selectedColorId={(tagInputValue as RoleEditRequest).colorId} colors={colors} handleColorChange={handleColorChange} />}
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
                    Oops! You already have this {tagType}. Please try using a different one.
                </div>
            )}
        </>
    );
}

export default EditTagRow;
