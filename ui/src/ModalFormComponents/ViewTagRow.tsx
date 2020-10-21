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

import {Tag} from '../Tags/Tag';
import {JSX} from '@babel/types';
import {SpaceRole} from '../Roles/Role';
import React, {ReactNode} from 'react';


interface Props {
    children?: ReactNode;

    tag: Tag;
    index: number;
}

function ViewTagRow({ children, tag, index }: Props): JSX.Element {

    const testIdTraitName = traitName.replace(' ', '');
    const userIsNotEditingATag = !editSectionsOpen.find(value => value);
    return (
        <div className={`viewTagRow ${traitNameClass}`} data-testid="traitRow">
            {children}
            <span className="traitName" data-testid={`given${testIdTraitName}Name`}>
                {tag.name}
            </span>
            {userIsNotEditingATag && !showEditState && (
                <div>
                    <button
                        className="traitEditIcon"
                        data-testid={`${testIdTraitName}EditIcon`}
                        onClick={(): void => toggleEditSection(index)}
                        onKeyDown={(e): void => handleKeyDownForToggleEditSection(e, index)}>
                        <i className="fas fa-pen fa-s"/>
                    </button>
                    <button className="traitDeleteIcon"
                        data-testid={`${testIdTraitName}DeleteIcon`}
                        onClick={(): void => showDeleteConfirmationModal(tag)}
                        onKeyDown={(e): void => handleKeyDownForShowDeleteConfirmationModal(e, tag)}
                    >
                        <i className="fas fa-trash fa-s" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ViewTagRow;