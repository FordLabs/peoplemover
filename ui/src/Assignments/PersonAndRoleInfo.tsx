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

import React, {ReactElement} from 'react';
import {Assignment, calculateDuration} from './Assignment';
import './PersonAndRoleInfo.scss';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import HoverableIcon from './HoverableIcon';
import moment from 'moment';

interface Props {
    assignment: Assignment;
    isUnassignedProduct: boolean;
    isReadOnly: boolean;
    isDragging: boolean;
    viewingDate: Date;
}

const PersonAndRoleInfo = ({
    isReadOnly,
    assignment = {id: 0} as Assignment,
    isUnassignedProduct,
    isDragging,
    viewingDate,
}: Props): ReactElement => {
    const {person} = assignment;

    const listOfTagName = (): string[] => {
        if (person.tags) {
            return person.tags.map((tag) => {
                return tag.name;
            });
        } else return [];
    };

    const passNote = (): []|string[] => {
        if (person.notes) {
            return [person.notes];
        } else {
            return [];
        }
    };

    const getTimeOnProduct = (): string => {
        if (assignment.startDate) {
            const startString = moment(assignment.startDate).format('M/D/YY');
            const duration = calculateDuration(assignment, viewingDate);
            let days = 'days';
            if (duration < 2) {
                days = 'day';
            }
            let endString = 'tbd';
            if (assignment.endDate) {
                endString = moment(assignment.endDate).format('M/D/YY');
            }
            return startString + ' - ' + endString + ' (' + duration + ' ' + days + ')';
        } else {
            return 'no information available';
        }
    };

    return (
        <div data-testid={`assignmentCard${assignment.id}info`}
            className="personNameAndRoleContainer">
            <div
                className={`${person.name === 'Chris Boyer' ? 'chrisBoyer' : ''} ${!isReadOnly ? 'notReadOnly' : ''}  personName`}
                data-testid="personName">
                {person.name}
                <HoverableIcon iconName={'local_offer'} textToDisplay={listOfTagName()} viewOnly={isReadOnly}
                    isDragging={isDragging} isUnassignedProduct={isUnassignedProduct} type={'Person Tags'}/>
                <HoverableIcon iconName={'note'} textToDisplay={passNote()} viewOnly={isReadOnly}
                    isDragging={isDragging} isUnassignedProduct={isUnassignedProduct} type={'Notes'}/>
                <HoverableIcon iconName={'timer'} textToDisplay={[getTimeOnProduct()]} viewOnly={isReadOnly}
                    isDragging={isDragging} isUnassignedProduct={isUnassignedProduct} type={'Time on Product'}/>
            </div>
            {person?.spaceRole?.name && (
                <div className={`${!isReadOnly ? 'notReadOnly' : ''}  personRole`}>
                    {person.spaceRole.name}
                </div>
            )}
        </div>
    );
};

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    isDragging: state.isDragging,
    viewingDate: state.viewingDate,
    isReadOnly: state.isReadOnly
});

export default connect(mapStateToProps)(PersonAndRoleInfo);
/* eslint-enable */
