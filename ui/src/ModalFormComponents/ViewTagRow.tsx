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

import {Tag} from '../Tags/Tag.interface';
import {JSX} from '@babel/types';
import React, {ReactNode} from 'react';
import {TagType} from './TagForms.types';
import {createDataTestId} from '../tests/TestUtils';

interface Props {
    children?: ReactNode;
    editTagCallback: Function;
    showEditButtons: boolean;
    setConfirmDeleteModal: Function;
    testIdSuffix: TagType;
    tag: Tag;
}

function ViewTagRow({
    children,
    editTagCallback,
    showEditButtons,
    setConfirmDeleteModal,
    testIdSuffix,
    tag,
}: Props): JSX.Element {
    const tagNameClass = testIdSuffix.replace(' ', '_');

    const openEditViewOnEnter = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') editTagCallback();
    };

    const showDeleteConfirmationModal = (): void => {
        setConfirmDeleteModal();
    };

    const showDeleteConfirmationModalOnEnter = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') showDeleteConfirmationModal();
    };

    return (
        <div className={`viewTagRow ${tagNameClass}`} data-testid="viewTagRow">
            {children}
            <span className="tagName" data-testid={createDataTestId('tagName', testIdSuffix)}>
                {tag.name}
            </span>
            {showEditButtons && (
                <div>
                    <button
                        className="editTagIcon"
                        data-testid={createDataTestId('editIcon', testIdSuffix)}
                        onClick={(): void => editTagCallback()}
                        onKeyDown={openEditViewOnEnter}>
                        <i className="fas fa-pen fa-s"/>
                    </button>
                    <button className="deleteTagIcon"
                        data-testid={createDataTestId('deleteIcon', testIdSuffix)}
                        onClick={(): void => showDeleteConfirmationModal()}
                        onKeyDown={showDeleteConfirmationModalOnEnter}
                    >
                        <i className="fas fa-trash fa-s" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ViewTagRow;
