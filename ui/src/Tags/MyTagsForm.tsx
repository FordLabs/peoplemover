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

import React, {useState} from 'react';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {TagInterface} from './Tag.interface';
import {JSX} from '@babel/types';
import {FilterOption} from '../CommonTypes/Option';
import {LocationTag} from '../Locations/LocationTag.interface';
import {Tag} from './Tag';
import TagsModalContent from './TagsModalContent';

import '../ModalFormComponents/TagRowsContainer.scss';
import {AllGroupedTagFilterOptions, FilterType, FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';
import ProductTagClient from './ProductTag/ProductTagClient';
import LocationClient from '../Locations/LocationClient';
import PersonTagClient from './PersonTag/PersonTagClient';

// @Todo consolidate (also in MyRolesForm)
export const INACTIVE_EDIT_STATE_INDEX = -1;

// @Todo consolidate (also in MyRolesForm)
export enum TagAction {
    ADD,
    EDIT,
    DELETE
}

interface Props {
    filterType?: FilterType;
    locations: Array<LocationTag>;
    productTags: Array<Tag>;
    personTags: Array<Tag>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    locations: state.locations,
    productTags: state.productTags,
    personTags: state.personTags,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyTagsForm);

/* eslint-enable */
function MyTagsForm({
    filterType,
    locations,
    productTags,
    personTags,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
}: Props): JSX.Element {
    const [locationTagsList, setLocationTagsList] = useState<Array<TagInterface>>(locations);
    const [productTagsList, setProductTagsList] = useState<Array<TagInterface>>(productTags);
    const [personTagsList, setPersonTagsList] = useState<Array<TagInterface>>(personTags);
    // @todo abstract filter methods away to redux please
    const getUpdatedFilterOptions = (index: number, tag: TagInterface, action: TagAction): Array<FilterOption> => {
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


    function updateFilterOptions(optionIndex: number, tag: TagInterface, action: TagAction): void {
        const groupedFilterOptions = [...allGroupedTagFilterOptions];
        groupedFilterOptions[optionIndex]
            .options = getUpdatedFilterOptions(optionIndex, tag, action);
        setAllGroupedTagFilterOptions(groupedFilterOptions);
    }

    return (
        <div data-testid="myTagsModal" className="myTraitsContainer">
            {filterType === undefined &&
                <>
                    <div className="title">Location Tags</div>
                    <TagsModalContent
                        tags={locationTagsList}
                        updateTags={setLocationTagsList}
                        updateFilterOptions={updateFilterOptions}
                        tagClient={LocationClient}
                        filterType={FilterTypeListings.Location}
                    />
                    <div className="lineSeparator"/>
                    <div className="title">Product Tags</div>
                    <TagsModalContent
                        tags={productTagsList}
                        updateTags={setProductTagsList}
                        updateFilterOptions={updateFilterOptions}
                        tagClient={ProductTagClient}
                        filterType={FilterTypeListings.ProductTag}
                    />
                </>
            }
            {filterType === FilterTypeListings.Location &&
                <>
                    <TagsModalContent
                        tags={locationTagsList}
                        updateTags={setLocationTagsList}
                        updateFilterOptions={updateFilterOptions}
                        tagClient={LocationClient}
                        filterType={FilterTypeListings.Location}
                    />
                </>
            }
            {filterType === FilterTypeListings.ProductTag &&
                <>
                    <TagsModalContent
                        tags={productTagsList}
                        updateTags={setProductTagsList}
                        updateFilterOptions={updateFilterOptions}
                        tagClient={ProductTagClient}
                        filterType={filterType}
                    />
                </>
            }
            {filterType === FilterTypeListings.PersonTag &&
            <>
                <TagsModalContent
                    tags={personTagsList}
                    updateTags={setPersonTagsList}
                    updateFilterOptions={updateFilterOptions}
                    tagClient={PersonTagClient}
                    filterType={filterType}
                />
            </>
            }

            <div className="traitWarning">
                <i className="material-icons warningIcon">error</i>
                <p className="warningText">
                        Editing or deleting a tag will affect any product currently tagged with it.
                </p>
            </div>
        </div>
    );
}
