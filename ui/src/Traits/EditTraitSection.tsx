/*
 * Copyright (c) 2019 Ford Motor Company
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
import React, {createRef, RefObject, useEffect, useState} from 'react';
import ColorClient from '../Roles/ColorClient';
import '../Traits/MyTraits.scss';
import {AxiosResponse} from 'axios';
import {Trait} from './Trait';
import {TraitAddRequest} from './TraitAddRequest';
import {TraitClient} from './TraitClient';
import {TraitEditRequest} from './TraitEditRequest';
import {RoleAddRequest} from '../Roles/RoleAddRequest';
import {RoleEditRequest} from '../Roles/RoleEditRequest';
import {Space} from '../SpaceDashboard/Space';

interface EditTraitSectionProps {
    closeCallback: () => void;
    updateCallback: (newRole: Trait) => void;
    trait?: Trait;
    colorSection: boolean;
    traitClient: TraitClient;
    traitName: string;
    currentSpace: Space;
}

function EditTraitSection({
    closeCallback,
    updateCallback,
    trait,
    colorSection,
    traitClient,
    traitName,
    currentSpace
}: EditTraitSectionProps): JSX.Element {
    const [colors, setColors] = useState<Array<Color>>([]);
    const [enteredTrait, setEnteredTrait] = useState<TraitAddRequest>();
    const [duplicateErrorMessage, setDuplicateErrorMessage] = useState<boolean>(false);
    const colorRefs: Array<RefObject<HTMLSpanElement>> = [];

    useEffect(() => {
        async function setup(): Promise<void> {
            if (colorSection) {
                const colorsResponse = await ColorClient.getAllColors();
                const colors: Array<Color> = colorsResponse.data;
                setColors(colors);

                const spaceRole: SpaceRole = trait as SpaceRole;
                const roleAddRequest: RoleAddRequest = {
                    name: spaceRole ? spaceRole.name : '',
                    colorId: spaceRole && spaceRole.color ? spaceRole.color.id : colors[colors.length - 1].id,
                };
                setEnteredTrait(roleAddRequest);
            } else {
                const traitAddRequest: TraitAddRequest = {
                    name: trait ? trait.name : '',
                };
                setEnteredTrait(traitAddRequest);
            }
        }

        setup().then();
    }, []);

    function highlightCircle(circleRef: RefObject<HTMLSpanElement>, color: Color): void {
        clearHighlightedCircle();
        if (circleRef.current) {
            circleRef.current.classList.add('highlightedCircle');
        }

        setEnteredTrait(prevEnteredTrait => ({
            ...prevEnteredTrait,
            colorId: color.id,
        }));
    }

    function clearHighlightedCircle(): void {
        colorRefs.forEach(colorRef => {
            if (colorRef.current) {
                colorRef.current.classList.remove('highlightedCircle');
            }
        });
    }

    function handleEnterSubmit(event: React.KeyboardEvent) {
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
                    clientResponse = await traitClient.edit(editRequest, currentSpace.name);
                } else {
                    clientResponse = await traitClient.add(enteredTrait, currentSpace.name);
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

    function highlightDefaultCircle(color: Color, index: number): string {
        const spaceRole: SpaceRole = trait as SpaceRole;
        const thisColorCircleMatchesProvidedColor = spaceRole && spaceRole.color && spaceRole.color.color === color.color;
        const thisColorCircleIsWhiteOne = !spaceRole && (colors.length - 1) === index;

        if (thisColorCircleMatchesProvidedColor || thisColorCircleIsWhiteOne) {
            return 'highlightedCircle';
        }
        return '';
    }

    function putBorderOnWhiteCircle(index: number): string {
        return (colors.length - 1) === index ? 'whiteCircleBorder' : '';
    }

    return (
        <React.Fragment>
            <div className="separator"/>
            <input className="formInput formTextInput editTraitName"
                type="text"
                data-testid="traitName"
                value={enteredTrait ? enteredTrait.name : ''}
                onChange={updateEnteredRoleText}
                onKeyPress={event => handleEnterSubmit(event)}
                autoFocus/>
            {duplicateErrorMessage &&
            <div className="duplicateErrorMessage"> A {traitName} with this name already exists.<br/> Enter a different name. </div>
            }
            {colorSection && <div className="selectRoleCircles">
                {colors.map((color: Color, index: number) => {
                    const ref: RefObject<HTMLSpanElement> = createRef();
                    colorRefs.push(ref);

                    return (
                        <span key={index}
                            ref={ref}
                            data-testid="selectRoleCircle"
                            style={{'backgroundColor': color.color}}
                            onClick={(): void => highlightCircle(ref, color)}
                            className={`myTraitsCircle selectRoleCircle ${highlightDefaultCircle(color, index)} ${putBorderOnWhiteCircle(index)}`}/>
                    );
                })}
            </div>
            }
            <div className="editTraitsButtons">
                <button className="formButton cancelFormButton" onClick={closeCallback}>Cancel</button>
                <button
                    className="formButton saveFormButton"
                    data-testid="saveTraitsButton"
                    disabled={enteredTrait ? enteredTrait.name === '' : true}
                    onClick={handleSubmit}>Save</button>
            </div>
            <div className="separator"/>
        </React.Fragment>
    );
}

export default EditTraitSection;
