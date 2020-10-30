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
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {FilterOption} from '../CommonTypes/Option';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {Color, RoleTag} from './Role.interface';
import RoleClient from './RoleClient';
import {Tag} from '../Tags/Tag.interface';
import {Space} from '../Space/Space';
import ColorClient from './ColorClient';
import warningIcon from '../Application/Assets/warningIcon.svg';
import sortTagsAlphabetically from '../Tags/sortTagsAlphabetically';
import RoleTags from './RoleTags';

import '../ModalFormComponents/TagRowsContainer.scss';

// @Todo consolidate (also in MyTagsForm)
export const INACTIVE_EDIT_STATE_INDEX = -1;

// @Todo consolidate (also in MyTagsForm)
export enum TagAction {
    ADD,
    EDIT,
    DELETE
}

interface Props {
    currentSpace: Space;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function MyRolesForm({ currentSpace, allGroupedTagFilterOptions, setAllGroupedTagFilterOptions }: Props): JSX.Element {
    const [colors, setColors] = useState<Array<Color>>([]);
    const [roles, setRoles] = useState<Array<RoleTag>>([]);

    useEffect(() => {
        const rolesPromise = RoleClient.get(currentSpace.uuid!!);
        const colorsPromise = ColorClient.getAllColors();

        const fetchData = !roles.length && !colors.length;
        if (fetchData) {
            Promise.all([rolesPromise, colorsPromise])
                .then(values => {
                    const rolesData = values[0].data;
                    sortTagsAlphabetically(rolesData);
                    setRoles(rolesData);

                    const colorsData = values[1].data;
                    setColors(colorsData);
                });
        }
    }, [currentSpace.uuid, roles.length, colors.length]);

    // @todo abstract filter methods away to redux please
    const getUpdatedFilterOptions = (index: number, trait: Tag, action: TagAction): Array<FilterOption> => {
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

    function updateFilterOptions(optionIndex: number, tag: Tag, action: TagAction): void {
        const groupedFilterOptions = [...allGroupedTagFilterOptions];
        groupedFilterOptions[optionIndex]
            .options = getUpdatedFilterOptions(optionIndex, tag, action);
        setAllGroupedTagFilterOptions(groupedFilterOptions);
    }

    return (
        <div data-testid="myRolesModalContainer" className="myTraitsContainer">
            <RoleTags
                colors={colors}
                roles={roles}
                setRoles={setRoles}
                updateFilterOptions={updateFilterOptions}
            />
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
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyRolesForm);
/* eslint-enable */
