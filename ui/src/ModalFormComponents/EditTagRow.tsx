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

import React, {ChangeEvent, useState} from 'react';
import SaveIcon from '../Assets/saveIcon.png';
import CloseIcon from '../Assets/closeIcon.png';
import {JSX} from '@babel/types';
import {createDataTestId} from '../Utils/ReactUtils';
import {TagRequest} from '../Tags/TagRequest.interface';

import './TagRowsContainer.scss';
import {Color} from 'Types/RoleTag';
import {OptionType} from './SelectWithHTMLOptions';
import ColorDropdown from '../Roles/ColorDropdown';
import {RoleEditRequest} from '../Roles/RoleEditRequest.interface';
import {TagType} from '../SortingAndFiltering/FilterLibraries';

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

    const saveTag = (): void => {
        const newTag = tagInputValue as RoleEditRequest;
        newTag.name = newTag.name.trim();
        if (colors && !(tagInputValue as RoleEditRequest).colorId) {
            newTag.colorId = colors[colors.length - 1].id;
        }
        onSave(newTag).catch((error) => {
            if (error.response.status === 409) {
                setShowDuplicatedTagErrorMessage(true);
            }
        });
    };

    const handleEnterSubmit = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') saveTag();
    };

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const newInputValue = {...tagInputValue, name: event.target.value};
        setTagInputValue(newInputValue);
        if (newNameIsDuplicated(newInputValue.name)) {
            setShowDuplicatedTagErrorMessage(true);
        } else if (showDuplicatedTagErrorMessage === true) {
            setShowDuplicatedTagErrorMessage(false);
        }
    };

    const newNameIsDuplicated = (newName: string): boolean => {
        return existingTags.map<string>(tag => tag.name).includes(newName);
    };

    const isColorTheSame = (): boolean => {
        return (tagInputValue as RoleEditRequest).colorId === (initialValue as RoleEditRequest).colorId;
    };

    const handleColorChange = (selectedOption: OptionType): void => {
        setTagInputValue(({...tagInputValue, colorId: ((selectedOption.value as Color).id) }) as RoleEditRequest);
    };

    const isTraitNameInvalid = (): boolean => {
        return tagInputValue.name.trim() === ''
        || showDuplicatedTagErrorMessage
        || (newNameIsDuplicated(tagInputValue.name) && isColorTheSame());
    };

    return (
        <>
            <div className={`editTagRow ${tagNameClass}`}
                data-testid={createDataTestId('editTagRow', testIdSuffix)}>
                { colors?.length && <ColorDropdown
                    selectedColorId={(tagInputValue as RoleEditRequest).colorId}
                    colors={colors} 
                    handleColorChange={handleColorChange}
                />}
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
                    <button disabled={isTraitNameInvalid()}
                        onClick={(): void => saveTag()}
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
