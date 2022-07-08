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
import {Color, RoleTag} from './RoleTag.interface';
import React, {useState} from 'react';
import {TagInterface} from '../Tags/Tag.interface';
import ConfirmationModal, {ConfirmationModalProps} from 'Modal/ConfirmationModal/ConfirmationModal';
import RoleClient from './RoleClient';
import {createDataTestId} from '../Utils/ReactUtils';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Space} from '../Space/Space';
import {INACTIVE_EDIT_STATE_INDEX} from '../Tags/MyTagsForm';
import {RoleEditRequest} from './RoleEditRequest.interface';
import {setupSpaceAction} from '../Redux/Actions';
import useFetchRoles from 'Hooks/useFetchRoles/useFetchRoles';

interface Props {
    colors: Array<Color>;
    updateFilterOptions(index: number, tag: TagInterface): void;
    currentSpace: Space;
}

const RoleTags = ({ colors, updateFilterOptions, currentSpace }: Props): JSX.Element => {
    const { fetchRoles, roles } = useFetchRoles();

    const tagType = 'role';
    const roleFiltersIndex = 2;
    const [editRoleIndex, setEditRoleIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);

    const showDeleteConfirmationModal = (roleToDelete: TagInterface): void => {
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

    const editRole = async (role: RoleEditRequest): Promise<unknown> => {
        return await RoleClient.edit(role, currentSpace)
            .then((response) => {
                const newRole: RoleTag = response.data;
                updateFilterOptions(roleFiltersIndex, newRole);
                fetchRoles();
                returnToViewState();
            });
    };

    const addRole = async (role: RoleEditRequest): Promise<unknown> => {
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

    const deleteRole = async (roleToDelete: TagInterface): Promise<void> => {
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

    const transformTagIntoRoleEditRequest = (role: RoleTag): RoleEditRequest => {
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

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

const mapDispatchToProps = (dispatch: any) => ({
    setSpace: (space: Space) => dispatch(setupSpaceAction(space)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RoleTags);
/* eslint-enable */
