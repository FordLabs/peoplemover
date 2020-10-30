import {JSX} from '@babel/types';
import {Color, RoleTag} from './Role.interface';
import React, {useState} from 'react';
import {Tag} from '../Tags/Tag.interface';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import Select, {OptionType} from '../ModalFormComponents/Select';
import ColorCircle from '../ModalFormComponents/ColorCircle';
import {TagRequest} from '../Tags/TagRequest.interface';
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

const colorMapping: { [key: string]: string } = {
    '#81C0FA': 'Blue',
    '#83DDC2': 'Aquamarine',
    '#A7E9F2': 'Light Blue',
    '#C9E9B0': 'Light Green',
    '#DBB5FF': 'Purple',
    '#FFD7B3': 'Orange',
    '#FCBAE9': 'Pink',
    '#FFEAAA': 'Yellow',
    '#FFFFFF': 'White',
};

interface Props {
    colors: Array<Color>;
    roles: Array<RoleTag>;
    setRoles: any;
    updateFilterOptions(index: number, tag: Tag, action: TagAction): void;
    currentSpace: Space;
}

const RoleTags = ({ colors, roles, setRoles, updateFilterOptions, currentSpace }: Props): JSX.Element => {
    const tagType = 'role';
    let selectedColor: Color;
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

    const selectedColorOption = (selectedColor?: Color): OptionType => {
        const color = selectedColor ? selectedColor : { id: -1, color: 'transparent'};
        return {
            value: color,
            ariaLabel: colorMapping[color.color],
            displayValue: <ColorCircle color={color} />,
        };
    };

    const colorOptions = (): OptionType[] => {
        return colors.map((color): OptionType => {
            return {
                value: color,
                ariaLabel: colorMapping[color.color],
                displayValue: <ColorCircle color={color} />,
            };
        });
    };

    const handleColorChange = (selectedOption: OptionType): void => {
        selectedColor = selectedOption.value as Color;
    };

    const getDefaultColor = (): Color => {
        return colors[colors.length - 1];
    };

    const ColorDropdown = ({ selectedColor }: { selectedColor?: Color }): JSX.Element => (
        <Select
            ariaLabel="Color"
            selectedOption={selectedColorOption(selectedColor)}
            options={colorOptions()}
            onChange={handleColorChange}
        />
    );

    const returnToViewState = (): void => {
        setEditRoleIndex(INACTIVE_EDIT_STATE_INDEX);
    };

    const editRole = async (role: TagRequest): Promise<unknown> => {
        const editedRole = {...role, colorId: selectedColor?.id};
        return await RoleClient.edit(editedRole, currentSpace.uuid!!)
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

    const addRole = async (role: TagRequest): Promise<unknown> => {
        const defaultColor = getDefaultColor();
        const newRole = {
            name: role.name,
            colorId: selectedColor ? selectedColor?.id : defaultColor.id,
        };
        return await RoleClient.add(newRole, currentSpace.uuid!!)
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
                await RoleClient.delete(roleToDelete.id, currentSpace.uuid);
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
                                    <span data-testid="myRolesCircle"
                                        style={{'backgroundColor': colorToUse}}
                                        className={`myTraitsCircle ${colorToUse === '#FFFFFF' ? 'whiteCircleBorder' : ''}`}
                                    />
                                </div>
                            </ViewTagRow>
                        }
                        {showEditState(index) &&
                            <EditTagRow
                                initialValue={role}
                                onSave={editRole}
                                onCancel={returnToViewState}
                                tagType={tagType}
                                colorDropdown={
                                    <ColorDropdown
                                        selectedColor={role.color}
                                    />
                                }
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
                colorDropdown={
                    <ColorDropdown
                        selectedColor={getDefaultColor()}
                    />
                }
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