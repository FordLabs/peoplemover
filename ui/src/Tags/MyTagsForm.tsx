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
import LocationClient from '../Locations/LocationClient';
import ProductTagClient from '../ProductTag/ProductTagClient';
import MyTraits from '../Traits/MyTraits';
import warningIcon from '../Application/Assets/warningIcon.svg';

import '../Traits/MyTraits.scss';
import {Tag} from './Tag';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import {GlobalStateProps} from '../Redux/Reducers';
import {Dispatch} from 'redux';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {setAllGroupedTagFilterOptions} from '../Redux/Actions';
import {connect} from 'react-redux';
import {Space} from '../Space/Space';
import ViewTagRow from "../ModalFormComponents/ViewTagRow";

const INACTIVE_EDIT_STATE_INDEX = -1;

interface Props {
    currentSpace: Space;
}

function MyTagsForm({ currentSpace }: Props): JSX.Element {

    const LocationTags = (): JSX.Element => {
        const [locations, setLocations] = useState<Array<Tag>>([]);
        const [editLocationIndex, setEditLocationIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);

        function sortTraitsAlphabetically(traitsList: Array<Tag>): void {
            traitsList.sort( (trait1: Tag, trait2: Tag) => {
                return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
            });
        }

        useEffect(() => {
            async function setup(): Promise<void> {
                const response = await LocationClient.get(currentSpace.uuid!!);
                sortTraitsAlphabetically(response.data);
                setLocations(response.data);
                // setEditLocationIndex(new Array(traitResponse.length).fill(false));
            }

            setup().then();
        }, [currentSpace.uuid]);

        return (
            <MyTraits
                title="Location Tags"
                traitClient={LocationClient}
                colorSection={false}
                traitType="product"
                traitName="location"
            >
                {locations.map((trait: Tag, index: number) => {
                    return (
                        <React.Fragment key={index}>
                            {editLocationIndex != index &&
                                <ViewTagRow tag={trait} index={index}/>
                            }
                            {editLocationIndex === index &&
                               <EditTagRow
                                   closeCallback={(): void => toggleEditSection(index)}
                                   updateCallback={updateTraits}
                                   trait={trait}
                                   colorSection={colorSection}
                                   traitClient={traitClient}
                                   traitName={traitName}
                                   currentSpace={currentSpace}
                                   listOfTraits={locations}
                               />
                            }
                        </React.Fragment>
                    );
                })}

            </MyTraits>
        );
    };

    return (
        <div data-testid="myTagsModal" className="myTraitsContainer">
            <LocationTags />
            <div className="lineSeparator"/>
            {/*<MyTraits*/}
            {/*    title="Product Tags"*/}
            {/*    traitClient={ProductTagClient}*/}
            {/*    colorSection={false}*/}
            {/*    traitType="product"*/}
            {/*    traitName="product tag"*/}
            {/*/>*/}
            <div className="traitWarning">
                <img src={warningIcon} className="warningIcon" alt="warning icon"/>
                <p className="warningText">
                    Editing or deleting a tag will affect any product currently tagged with it.
                </p>
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

export default connect(mapStateToProps, mapDispatchToProps)(MyTagsForm);
/* eslint-enable */
