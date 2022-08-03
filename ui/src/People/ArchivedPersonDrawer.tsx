/*
 * Copyright (c) 2022 Ford Motor Company
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
import DrawerContainer from '../Common/DrawerContainer/DrawerContainer';
import moment from 'moment';
import PersonCard from './PersonCard';
import {useRecoilValue} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {PeopleState} from '../State/PeopleState';
import {Person} from '../Types/Person';

function ArchivedPersonDrawer(): JSX.Element {
    const viewingDate = useRecoilValue(ViewingDateState);
    const people = useRecoilValue(PeopleState);

    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const getArchivedPeople = (): Person[] => {
        return people.filter(person => person.archiveDate !== null && moment(person.archiveDate).isBefore(moment(viewingDate)));
    };

    const getArchivedPeopleElements = (): JSX.Element => {
        return (
            <div>
                {getArchivedPeople().map(person => {
                    return (<PersonCard person={person} key={person.id}/>);
                })}
            </div>
        );
    };

    return (
        <DrawerContainer
            drawerIcon="supervisor_account"
            testId="archivedPersonDrawer"
            numberForCountBadge={getArchivedPeople().length}
            containerTitle="Archived People"
            containee={getArchivedPeopleElements()}
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}/>
    );
}

export default ArchivedPersonDrawer;
