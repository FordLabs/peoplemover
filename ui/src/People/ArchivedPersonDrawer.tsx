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
import DrawerContainer from '../ReusableComponents/DrawerContainer';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Person} from './Person';
import moment from 'moment';
import PersonCard from './PersonCard';

interface ArchivedPersonDrawerProps {
    people: Array<Person>;
    viewingDate: Date;
}

function ArchivedPersonDrawer({
    people,
    viewingDate,
}: ArchivedPersonDrawerProps): JSX.Element {
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const getArchivedPeopleElements = (): JSX.Element => {
        return (
            <div>
                {people.filter(person => person.archiveDate !== null && moment(person.archiveDate).isBefore(moment(viewingDate)))
                    .map(person => {
                        return (<PersonCard person={person} key={person.id}/>);
                    })}
            </div>
        );
    };

    return (
        <DrawerContainer
            drawerIcon="supervisor_account"
            testId="archivedPersonDrawer"
            numberForCountBadge={0}
            containerTitle="Archived People"
            containee={getArchivedPeopleElements()}
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}/>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    people: state.people,
    viewingDate: state.viewingDate,
});

const mapDispatchToProps = (dispatch:  Dispatch) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ArchivedPersonDrawer);
/* eslint-enable */
