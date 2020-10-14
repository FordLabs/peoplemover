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

import {Color, SpaceRole} from '../Roles/Role';
import React, {useEffect, useState} from 'react';
import ColorClient from '../Roles/ColorClient';
import {AxiosResponse} from 'axios';
import {Trait} from './Trait';
import {TraitAddRequest} from './TraitAddRequest';
import {TraitClient} from './TraitClient';
import {TraitEditRequest} from './TraitEditRequest';
import {RoleAddRequest} from '../Roles/RoleAddRequest';
import {RoleEditRequest} from '../Roles/RoleEditRequest';
import {Space} from '../Space/Space';
import SaveIcon from './saveIcon.png';
import CloseIcon from './closeIcon.png';
import {JSX} from '@babel/types';
import ColorCircle from '../TagsForm/ColorCircle';
import Select, {OptionType} from '../ModalFormComponents/Select';
import {TraitNameType} from './MyTraits';

import '../Traits/MyTraits.scss';
import {createDataTestId} from "../tests/TestUtils";

interface EditTraitSectionProps {
    closeCallback: () => void;
    updateCallback: (newRole: Trait) => void;
    trait?: Trait;
    colorSection: boolean;
    traitClient: TraitClient;
    traitName: TraitNameType;
    currentSpace: Space;
}

function EditTraitSection({
    closeCallback,
    updateCallback,
    trait,
    colorSection,
    traitClient,
    traitName,
    currentSpace,
}: EditTraitSectionProps): JSX.Element {
    const [colors, setColors] = useState<Array<Color>>([]);
    const [selectedColor, setSelectedColor] = useState<Color>();
    const [enteredTrait, setEnteredTrait] = useState<TraitAddRequest>();
    const [duplicateErrorMessage, setDuplicateErrorMessage] = useState<boolean>(false);
    const traitNameClass = traitName.replace(' ', '_');

    useEffect(() => {
        let mounted = false;
        async function setColorsAndTraits(): Promise<void> {
            if (colorSection) {
                ColorClient.getAllColors().then(response => {
                    if (mounted) {
                        const colors: Array<Color> = response.data;
                        setColors(colors);

                        const spaceRole: SpaceRole = trait as SpaceRole;

                        const roleColor = spaceRole && spaceRole.color ? spaceRole.color : colors[colors.length - 1];
                        const roleAddRequest: RoleAddRequest = {
                            name: spaceRole ? spaceRole.name : '',
                            colorId: roleColor.id,
                        };
                        setSelectedColor(roleColor);
                        setEnteredTrait(roleAddRequest);
                    }
                });
            } else {
                const traitAddRequest: TraitAddRequest = {
                    name: trait ? trait.name : '',
                };
                setEnteredTrait(traitAddRequest);
            }
        }

        mounted = true;
        setColorsAndTraits().then();
        return (): void => {mounted = false;};
    }, [colorSection, trait]);

    function handleEnterSubmit(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            handleSubmit().then();
        }
    }

    async function handleSubmit(): Promise<void> {
        setDuplicateErrorMessage(false);
        if (enteredTrait && enteredTrait.name !== '') {
            let clientResponse: AxiosResponse;
            try {
                if (trait) {
                    let editRequest: TraitEditRequest = {
                        id: trait.id,
                        updatedName: enteredTrait.name,
                    };
                    if (colorSection) {
                        editRequest = {
                            ...editRequest,
                            updatedColorId: (enteredTrait as RoleAddRequest).colorId,
                        } as RoleEditRequest;
                    }
                    clientResponse = await traitClient.edit(editRequest, currentSpace.uuid!!);
                } else {
                    clientResponse = await traitClient.add(enteredTrait, currentSpace.uuid!!);
                }
            } catch (error) {
                if (error.response.status === 409) {
                    setDuplicateErrorMessage(true);
                }
                return;
            }
            const newTrait: Trait = clientResponse.data;
            updateCallback(newTrait);
            closeCallback();
        }
    }

    function updateEnteredRoleText(event: React.ChangeEvent<HTMLInputElement>): void {
        const input: string = event.target ? event.target.value : '';
        setEnteredTrait(prevEnteredTrait => ({
            ...prevEnteredTrait,
            name: input,
        }));
    }

    const selectedColorOption = (): OptionType => {
        const color = selectedColor ? selectedColor : { id: -1, color: 'transparent'};
        return {
            value: color,
            displayValue: <ColorCircle color={color} />,
        };
    };

    const colorOptions = (): OptionType[] => {
        return colors.map((color): OptionType => {
            return {
                value: color,
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

    return (
        <>
            <div className={`editTagRow ${traitNameClass}`} data-testid={createDataTestId('editTagRow', traitName)}>
                {colorSection && (
                    <Select
                        selectedOption={selectedColorOption()}
                        options={colorOptions()}
                        onChange={handleColorChange}
                    />
                )}
                <input className={`editTagInput ${traitNameClass}`}
                    data-testid="tagNameInput"
                    type="text"
                    value={enteredTrait ? enteredTrait.name : ''}
                    onChange={updateEnteredRoleText}
                    onKeyPress={(e): void => handleEnterSubmit(e)}/>
                <div className="traitEditIcons">
                    <button onClick={closeCallback}
                        data-testid="cancelTagButton"
                        className="closeEditTagButton"
                        aria-label="Close Edited Tag">
                        <img src={CloseIcon} alt=""/>
                    </button>
                    <button disabled={enteredTrait ? enteredTrait.name === '' : true}
                        onClick={handleSubmit}
                        data-testid="saveTagButton"
                        className="saveEditTagButton"
                        aria-label="Save Edited Tag">
                        <img src={SaveIcon} alt=""/>
                    </button>
                </div>
            </div>
            {duplicateErrorMessage && (
                <div className="duplicateErrorMessage">
                    A {traitName} with this name already exists. Enter a different name.
                </div>
            )}
        </>
    );
}

export default EditTraitSection;
