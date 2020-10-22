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
import TagRowsContainer from '../ModalFormComponents/TagRowsContainer';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import RoleClient from './RoleClient';
import warningIcon from '../Application/Assets/warningIcon.svg';
import {Color, SpaceRole} from './Role';
import {Tag} from '../Tags/Tag';
import {JSX} from '@babel/types';

import '../ModalFormComponents/TagRowsContainer.scss';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {GlobalStateProps} from '../Redux/Reducers';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {Space} from '../Space/Space';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {setAllGroupedTagFilterOptions} from '../Redux/Actions';
import {FilterOption} from '../CommonTypes/Option';
import ColorClient from "./ColorClient";
import {RoleAddRequest} from "./RoleAddRequest";
import Select, {OptionType} from "../ModalFormComponents/Select";
import ColorCircle from "../ModalFormComponents/ColorCircle";

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
        const [selectedColor, setSelectedColor] = useState<Color>();
        const [colors, setColors] = useState<Array<Color>>([]);
        const [roles, setRoles] = useState<Array<SpaceRole>>([]);
        const [editRoleIndex, setEditRoleIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
        const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

        const sortTraitsAlphabetically = (traitsList: Array<SpaceRole>): void => {
            traitsList.sort( (trait1: SpaceRole, trait2: SpaceRole) => {
                return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
            });
        };

        useEffect(() => {
            ColorClient.getAllColors().then(response => {
                const colors: Array<Color> = response.data;
                setColors(colors);

                const spaceRole: SpaceRole = trait as SpaceRole;

                const roleColor = spaceRole && spaceRole.color ? spaceRole.color : colors[colors.length - 1];
                const roleAddRequest: RoleAddRequest = {
                    name: spaceRole ? spaceRole.name : '',
                    colorId: roleColor.id,
                };
                // setSelectedColor(roleColor);
                // setEnteredTrait(roleAddRequest);
            });
        });

        useEffect(() => {
            async function setup(): Promise<void> {
                const response = await RoleClient.get(currentSpace.uuid!!);
                sortTraitsAlphabetically(response.data);
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
        function updateRoleFilterOptions(traitName: string, role: Tag, action: TagAction ): void {
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
                    setRoles(prevTraits => prevTraits.filter((role: SpaceRole) => role.id !== roleToDelete.id));
                    updateRoleFilterOptions('role', roleToDelete, TagAction.DELETE);
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

        const selectedColorOption = (): OptionType => {
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
            const color = selectedOption.value as Color;
            setEnteredTrait(prevEnteredTrait => ({
                ...prevEnteredTrait,
                colorId: color.id,
            }));
            setSelectedColor(color);
        };

        const onSave = (role: Tag): void => {
            // edit role
        };

        const onChange = (role: Tag): void => {
            // update input value
        };

        return (
            <TagRowsContainer
                addNewButtonLabel="Role"
                confirmDeleteModal={confirmDeleteModal}
            >
                {roles.map((role: Tag, index: number) => {
                    let colorToUse: string | undefined;
                    const spaceRole: SpaceRole = role as SpaceRole;
                    colorToUse = spaceRole.color ? spaceRole.color.color : '#FFFFFF';

                    return (
                        <React.Fragment key={index}>
                            {editRoleIndex != index &&
                                <ViewTagRow
                                    tag={role}
                                    index={index}
                                    setConfirmDeleteModal={(): void => showDeleteConfirmationModal(role)}
                                    showEditButtons={editRoleIndex === INACTIVE_EDIT_STATE_INDEX}
                                    editTagCallback={(): void => setEditRoleIndex(index)}>
                                    <div className="viewTagRowColorCircle">
                                        <span data-testid="myRolesCircle"
                                            style={{'backgroundColor': colorToUse}}
                                            className={`myTraitsCircle ${colorToUse === '#FFFFFF' ? 'whiteCircleBorder' : ''}`}
                                        />
                                    </div>
                                </ViewTagRow>
                            }
                            {editRoleIndex === index &&
                                <EditTagRow
                                    onChange={(): void => onChange(role)}
                                    onSave={(): void => onSave(role)}

                                    closeCallback={(): void => toggleEditSection(index)}
                                    updateCallback={updateTraits}
                                    trait={trait}
                                    colorSection={colorSection}
                                    traitClient={traitClient}
                                    traitName={traitName}
                                    currentSpace={currentSpace}
                                >
                                    <Select
                                        ariaLabel="Color"
                                        selectedOption={selectedColorOption()}
                                        options={colorOptions()}
                                        onChange={handleColorChange}
                                    />
                                </EditTagRow>
                            }
                        </React.Fragment>
                    );
                })}
            </TagRowsContainer>
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
