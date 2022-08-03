/*
 * Copyright (c) 2022 Ford Motor Company
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
import ConfirmationModal, {ConfirmationModalProps} from 'Modal/ConfirmationModal/ConfirmationModal';
import RoleClient from 'Services/Api/RoleClient';
import {createDataTestId} from 'Utils/ReactUtils';
import ViewTagRow from 'Common/ViewTagRow/ViewTagRow';
import EditTagRow from 'Common/EditTagRow/EditTagRow';
import AddNewTagRow from 'Common/AddNewTagRow/AddNewTagRow';
import {INACTIVE_EDIT_STATE_INDEX} from 'Tags/MyTagsForm';
import useFetchRoles from 'Hooks/useFetchRoles/useFetchRoles';
import {useRecoilValue} from 'recoil';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {Color} from 'Types/Color';
import {RoleTag} from 'Types/Tag';
import {RoleTagRequest} from 'Types/TagRequest';

interface Props {
    colors: Array<Color>;
}

const RoleTags = ({ colors }: Props): JSX.Element => {
    const currentSpace = useRecoilValue(CurrentSpaceState);

    const { fetchRoles, roles } = useFetchRoles(currentSpace.uuid || '');

    const tagType = 'role';
    const [editRoleIndex, setEditRoleIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);

    const showDeleteConfirmationModal = (roleToDelete: RoleTag): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: () => deleteRole(roleToDelete),
            close: () => setConfirmDeleteModal(null),
            content: <div>Deleting this role will remove it from any person that has been given this role.</div>,
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    };

    const returnToViewState = (): void => {
        setEditRoleIndex(INACTIVE_EDIT_STATE_INDEX);
    };

    const editRole = async (role: RoleTagRequest): Promise<unknown> => {
        return await RoleClient.edit(role, currentSpace)
            .then((response) => {
                fetchRoles();
                returnToViewState();
            });
    };

    const addRole = async (role: RoleTagRequest): Promise<unknown> => {
        const newRole = {
            name: role.name,
            colorId: role.colorId,
        };
        return await RoleClient.add(newRole, currentSpace)
            .then(() => {
                fetchRoles();
                returnToViewState();
            });
    };

    const deleteRole = async (roleToDelete: RoleTag): Promise<void> => {
        try {
            if (currentSpace.uuid) {
                await RoleClient.delete(roleToDelete.id, currentSpace);
                setConfirmDeleteModal(null);
                fetchRoles();
            }
        } catch {
            return;
        }
    };

    const showEditButtons = (): boolean => editRoleIndex === INACTIVE_EDIT_STATE_INDEX && !isAddingNewTag;

    const showViewState = (index: number): boolean => editRoleIndex !== index;

    const showEditState = (index: number): boolean => editRoleIndex === index;

    const transformTagIntoRoleEditRequest = (role: RoleTag): RoleTagRequest => {
        return {id: role.id, name: role.name, colorId: role.color?.id};
    };

    return (
        <div data-testid={createDataTestId('tagsModalContainer', tagType)}
            className="myTraitsModalContainer">
            {roles.map((role: RoleTag, index: number) => {
                const colorToUse = role.color ? role.color.color : '#FFFFFF';

                return (
                    <React.Fragment key={index}>
                        {showViewState(index) &&
                            <ViewTagRow
                                tag={role}
                                showEditButtons={showEditButtons()}
                                setConfirmDeleteModal={(): void => showDeleteConfirmationModal(role)}
                                tagType={tagType}
                                editTagCallback={(): void => setEditRoleIndex(index)}>
                                <div className="viewTagRowColorCircle">
                                    <span data-testid={`myRolesCircle__${role.name}`}
                                        style={{'backgroundColor': colorToUse}}
                                        className={`myTraitsCircle ${colorToUse === '#FFFFFF' ? 'whiteCircleBorder' : ''}`}
                                    />
                                </div>
                            </ViewTagRow>
                        }
                        {showEditState(index) &&
                            <EditTagRow
                                initialValue={transformTagIntoRoleEditRequest(role)}
                                onSave={editRole}
                                onCancel={returnToViewState}
                                tagType={tagType}
                                existingTags={roles.map(transformTagIntoRoleEditRequest)}
                                colors={colors}
                            />
                        }
                    </React.Fragment>
                );
            })}
            <AddNewTagRow
                disabled={!showEditButtons()}
                addNewButtonLabel="Role"
                tagType={tagType}
                onSave={addRole}
                onAddingTag={setIsAddingNewTag}
                existingTags={roles.map(transformTagIntoRoleEditRequest)}
                colors={colors}
            />
            {confirmDeleteModal}
        </div>
    );
};

export default RoleTags;
