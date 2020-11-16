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

import React, {useState} from 'react';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {Tag} from './Tag.interface';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {JSX} from '@babel/types';
import {FilterOption} from '../CommonTypes/Option';
import {LocationTag} from '../Locations/LocationTag.interface';
import {ProductTag} from '../ProductTag/ProductTag';
import LocationTags from './LocationTags';
import ProductTags from './ProductTags';

import '../ModalFormComponents/TagRowsContainer.scss';

// @Todo consolidate (also in MyRolesForm)
export const INACTIVE_EDIT_STATE_INDEX = -1;

// @Todo consolidate (also in MyRolesForm)
export enum TagAction {
    ADD,
    EDIT,
    DELETE
}

interface Props {
    locations: Array<LocationTag>;
    productTags: Array<ProductTag>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function MyTagsForm({
    locations,
    productTags,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
}: Props): JSX.Element {
    const [locationTagsList, setLocationTagsList] = useState<Array<Tag>>(locations);
    const [productTagsList, setProductTagsList] = useState<Array<Tag>>(productTags);
    // @todo abstract filter methods away to redux please
    const getUpdatedFilterOptions = (index: number, tag: Tag, action: TagAction): Array<FilterOption> => {
        let options: Array<FilterOption>;
        switch (action) {
            case TagAction.ADD:
                options = [
                    ...allGroupedTagFilterOptions[index].options,
                    {label: tag.name, value: tag.id.toString() + '_' + tag.name, selected: false},
                ];
                break;
            case TagAction.EDIT:
                options = allGroupedTagFilterOptions[index].options.map(val =>
                    !val.value.includes(tag.id.toString() + '_') ?
                        val :
                        {
                            label: tag.name,
                            value: tag.id.toString() + '_' + tag.name,
                            selected: val.selected,
                        }
                );
                break;
            case TagAction.DELETE:
                options = allGroupedTagFilterOptions[index].options.filter(val => val.label !== tag.name);
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
        <div data-testid="myTagsModal" className="myTraitsContainer">
            <LocationTags
                locations={locationTagsList}
                updateLocations={setLocationTagsList}
                updateFilterOptions={updateFilterOptions}
            />
            <div className="lineSeparator"/>
            <ProductTags
                productTags={productTagsList}
                updateProductTags={setProductTagsList}
                updateFilterOptions={updateFilterOptions}
            />
            <div className="traitWarning">
                <i className="material-icons warningIcon">error</i>
                <p className="warningText">
                    Editing or deleting a tag will affect any product currently tagged with it.
                </p>
            </div>
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    locations: state.locations,
    productTags: state.productTags,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyTagsForm);
/* eslint-enable */
