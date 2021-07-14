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

import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {JSX} from '@babel/types';
import {Dispatch} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {Color, RoleTag} from './RoleTag.interface';
import ColorClient from './ColorClient';
import RoleTags from './RoleTags';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import {TagInterface} from '../Tags/Tag.interface';
import {FilterOption} from '../CommonTypes/Option';
import '../ModalFormComponents/TagRowsContainer.scss';

interface Props {
    roles: Array<RoleTag>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function MyRolesForm({ roles, allGroupedTagFilterOptions, setAllGroupedTagFilterOptions }: Props): JSX.Element {
    const [colors, setColors] = useState<Array<Color>>([]);

    useEffect(() => {
        ColorClient.getAllColors().then(response => {
            setColors(response.data);
        });
    }, [colors.length]);

    const getUpdatedFilterOptions = (index: number, trait: TagInterface): Array<FilterOption> => {
        let options: Array<FilterOption>;
        options = allGroupedTagFilterOptions[index].options.map(val =>
            !val.value.includes(trait.id.toString() + '_') ?
                val :
                {
                    label: trait.name,
                    value: trait.id.toString() + '_' + trait.name,
                    selected: val.selected,
                }
        );
        return options;
    };

    function updateFilterOptions(optionIndex: number, tag: TagInterface): void {
        const groupedFilterOptions = [...allGroupedTagFilterOptions];
        groupedFilterOptions[optionIndex]
            .options = getUpdatedFilterOptions(optionIndex, tag);
        setAllGroupedTagFilterOptions(groupedFilterOptions);
    }

    return (
        <div data-testid="myRolesModalContainer" className="myTraitsContainer">
            <RoleTags
                colors={colors}
                updateFilterOptions={updateFilterOptions}
            />
            <div className="traitWarning">
                <i className="material-icons warningIcon">error</i>
                <p className="warningText">Editing or deleting a role will affect any person currently assigned to it.</p>
            </div>
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    roles: state.roles,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyRolesForm);
/* eslint-enable */
