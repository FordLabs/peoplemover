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
import React, {ReactNode} from 'react';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';


interface Props {
    colorCircleComponent?: ReactNode;
    editTagCallback: Function;
    showEditButtons: boolean;
    setConfirmDeleteModal: Function;

    tag: Tag;
    index: number;
}

function ViewTagRow({
    colorCircleComponent,
    editTagCallback,
    showEditButtons,
    setConfirmDeleteModal,
    tag,
    index,
}: Props): JSX.Element {

    const testIdTraitName = traitName.replace(' ', '');

    // function toggleEditSection(index: number): void {
    //     const editSectionChanges: Array<boolean> = [...editSectionsOpen];
    //     editSectionChanges[index] = !editSectionChanges[index];
    //     setEditSectionsOpen(editSectionChanges);
    // }

    const openEditViewOnEnter = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            editTagCallback();
        }
    };

    const showDeleteConfirmationModalOnEnter = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            setConfirmDeleteModal();
        }
    };
    
    return (
        <div className={`viewTagRow ${traitNameClass}`} data-testid="traitRow">
            {colorCircleComponent}
            <span className="traitName" data-testid={`given${testIdTraitName}Name`}>
                {tag.name}
            </span>
            {showEditButtons && (
                <div>
                    <button
                        className="traitEditIcon"
                        data-testid={`${testIdTraitName}EditIcon`}
                        onClick={(): void => editTagCallback()}
                        onKeyDown={(e): void => openEditViewOnEnter(e)}>
                        <i className="fas fa-pen fa-s"/>
                    </button>
                    <button className="traitDeleteIcon"
                        data-testid={`${testIdTraitName}DeleteIcon`}
                        onClick={(): void => showDeleteConfirmationModal(tag)}
                        onKeyDown={(e): void => showDeleteConfirmationModalOnEnter(e, tag)}
                    >
                        <i className="fas fa-trash fa-s" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ViewTagRow;