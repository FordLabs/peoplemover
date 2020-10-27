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

import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {JSX} from '@babel/types';
import {Dispatch} from 'redux';

import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptions} from '../Redux/Actions';
import {FilterOption} from '../CommonTypes/Option';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import Select, {OptionType} from '../ModalFormComponents/Select';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {Color, RoleTag} from './Role.interface';
import RoleClient from './RoleClient';
import {Tag} from '../Tags/Tag.interface';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {Space} from '../Space/Space';
import ColorClient from './ColorClient';
import ColorCircle from '../ModalFormComponents/ColorCircle';
import warningIcon from '../Application/Assets/warningIcon.svg';
import {createDataTestId} from '../tests/TestUtils';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';

import '../ModalFormComponents/TagRowsContainer.scss';
import {TagRequest} from '../Tags/TagRequest.interface';
import sortTagsAlphabetically from '../Tags/sortTagsAlphabetically';
import {RoleAddRequest} from './RoleAddRequest.interface';

const INACTIVE_EDIT_STATE_INDEX = -1;

enum TagAction {
    ADD,
    EDIT,
    DELETE
}

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
    currentSpace: Space;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function MyRolesForm({ currentSpace, allGroupedTagFilterOptions }: Props): JSX.Element {
    const RoleTags = () => {
        const tagType = 'role';
        let selectedColor: Color;
        const [colors, setColors] = useState<Array<Color>>([]);
        const [roles, setRoles] = useState<Array<RoleTag>>([]);
        const [editRoleIndex, setEditRoleIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
        const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

        useEffect(() => {
            ColorClient.getAllColors().then(response => {
                const colors: Array<Color> = response.data;
                setColors(colors);
            });
        }, []);

        useEffect(() => {
            async function setup(): Promise<void> {
                const response = await RoleClient.get(currentSpace.uuid!!);
                sortTagsAlphabetically(response.data);
                setRoles(response.data);
            }

            setup().then();
        }, [currentSpace.uuid]);

        // @todo abstract away to redux please
        const updateFilterValuesInGroupedTags = (index: number, trait: Tag, action: TagAction): Array<FilterOption> => {
            let options: Array<FilterOption>;
            switch (action) {
                case TagAction.ADD:
                    options = [
                        ...allGroupedTagFilterOptions[index].options,
                        {label: trait.name, value: trait.id.toString() + '_' + trait.name, selected: false},
                    ];
                    break;
                case TagAction.EDIT:
                    options = allGroupedTagFilterOptions[index].options.map(val =>
                        !val.value.includes(trait.id.toString() + '_') ?
                            val :
                            {
                                label: trait.name,
                                value: trait.id.toString() + '_' + trait.name,
                                selected: val.selected,
                            }
                    );
                    break;
                case TagAction.DELETE:
                    options = allGroupedTagFilterOptions[index].options.filter(val => val.label !== trait.name);
                    break;
                default:
                    options = [];
            }
            return options;
        };

        // @todo refactor
        function updateRoleFilterOptions(role: Tag, action: TagAction ): void {
            const groupedFilterOptions = [...allGroupedTagFilterOptions];
            const roleFiltersIndex = 2;
            groupedFilterOptions[roleFiltersIndex]
                .options = updateFilterValuesInGroupedTags(roleFiltersIndex, role, action);
            setAllGroupedTagFilterOptions(groupedFilterOptions);
        }

        const deleteRole = async (roleToDelete: Tag): Promise<void> => {
            try {
                if (currentSpace.uuid) {
                    await RoleClient.delete(roleToDelete.id, currentSpace.uuid);
                    setConfirmDeleteModal(null);
                    setRoles(prevTraits => prevTraits.filter((role: RoleTag) => role.id !== roleToDelete.id));
                    updateRoleFilterOptions(roleToDelete, TagAction.DELETE);
                }
            } catch {
                return;
            }
        };

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

        const getDefaultColor = () => {
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
                    setRoles(prevRoles => {
                        const newRole: RoleTag = response.data;
                        updateRoleFilterOptions(newRole, TagAction.EDIT);
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
                    setRoles(prevRoles => {
                        updateRoleFilterOptions(newRole, TagAction.ADD);
                        const roles = [...prevRoles, newRole];
                        sortTagsAlphabetically(roles);
                        return roles;
                    });

                    returnToViewState();
                });
        };

        const onCancel = (): void => {
            returnToViewState();
        };

        const showEditButtons = (): boolean => editRoleIndex === INACTIVE_EDIT_STATE_INDEX;

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
                                    onCancel={onCancel}
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
                    addNewButtonLabel="Role"
                    tagType={tagType}
                    onSave={addRole}
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

    return (
        <div data-testid="myRolesModalContainer" className="myTraitsContainer">
            <RoleTags />
            <div className="traitWarning">
                <img src={warningIcon} className="warningIcon" alt="warning icon"/>
                <p className="warningText">Editing or deleting a role will affect any person currently assigned to it.</p>
            </div>
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptions(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyRolesForm);
/* eslint-enable */
