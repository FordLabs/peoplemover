import {JSX} from '@babel/types';
import {Color, RoleTag} from './RoleTag.interface';
import React, {useState} from 'react';
import {Tag} from '../Tags/Tag.interface';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import RoleClient from './RoleClient';
import sortTagsAlphabetically from '../Tags/sortTagsAlphabetically';
import {createDataTestId} from '../tests/TestUtils';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {INACTIVE_EDIT_STATE_INDEX} from './MyRolesForm';
import {Space} from '../Space/Space';
import {TagAction} from '../Tags/MyTagsForm';
import {RoleEditRequest} from './RoleEditRequest.interface';

interface Props {
    colors: Array<Color>;
    roles: Array<RoleTag>;
    setRoles(Function: (roles: Array<Tag>) => Tag[]): void;
    updateFilterOptions(index: number, tag: Tag, action: TagAction): void;
    currentSpace: Space;
}

const RoleTags = ({ colors, roles, setRoles, updateFilterOptions, currentSpace }: Props): JSX.Element => {
    const tagType = 'role';
    const roleFiltersIndex = 2;
    const [editRoleIndex, setEditRoleIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);

    const showDeleteConfirmationModal = (roleToDelete: Tag): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: () => deleteRole(roleToDelete),
            close: () => setConfirmDeleteModal(null),
            warningMessage: `Deleting this role will remove it from any person that has been given this role.`,
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
                updateFilterOptions(roleFiltersIndex, newRole, TagAction.EDIT);
                setRoles((prevRoles: Array<RoleTag>) => {
                    const locations = prevRoles.map(prevTrait => prevTrait.id !== role.id ? prevTrait : newRole);
                    sortTagsAlphabetically(locations);
                    return locations;
                });
                returnToViewState();
            });
    };

    const addRole = async (role: RoleEditRequest): Promise<unknown> => {
        const newRole = {
            name: role.name,
            colorId: role.colorId,
        };
        return await RoleClient.add(newRole, currentSpace)
            .then((response) => {
                const newRole: RoleTag = response.data;
                updateFilterOptions(roleFiltersIndex, newRole, TagAction.ADD);
                setRoles((prevRoles: Array<RoleTag>) => {
                    const roles = [...prevRoles, newRole];
                    sortTagsAlphabetically(roles);
                    return roles;
                });
                returnToViewState();
            });
    };

    const deleteRole = async (roleToDelete: Tag): Promise<void> => {
        try {
            if (currentSpace.uuid) {
                await RoleClient.delete(roleToDelete.id, currentSpace);
                setConfirmDeleteModal(null);
                updateFilterOptions(roleFiltersIndex, roleToDelete, TagAction.DELETE);
                setRoles((prevRoles: Array<RoleTag>) => prevRoles.filter((role: RoleTag) => role.id !== roleToDelete.id));
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

export default connect(mapStateToProps)(RoleTags);
/* eslint-enable */
