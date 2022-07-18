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

import moment from 'moment';
import {didAssignmentEndInThePast, getDurationWithRespectToToday} from '../AssignmentService';
import React, {useEffect, useState} from 'react';
import AssignmentClient from '../AssignmentClient';
import ProductClient from 'Products/ProductClient';
import {Product} from 'Types/Product';
import {Person} from 'Types/Person';
import {Assignment} from 'Types/Assignment';

import './AssignmentHistory.scss';

interface AssignmentHistoryProps {
    person: Person;
}

export function AssignmentHistory({person}: AssignmentHistoryProps): JSX.Element {
    const [products, setProducts] = useState<Product[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isShowing, setIsShowing] = useState<boolean>(false);

    useEffect(() => {
        ProductClient.getProductsForDate(person.spaceUuid, new Date()).then((result) => {
            setProducts(result.data);
        });
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson(person.spaceUuid, person.id).then((result) => {
            const data = result.data.filter((item: Assignment) => {
                return item !== null && isValidDate(new Date(item.startDate!)) && moment(item.startDate).isBefore(moment());
            });
            data.sort((a: Assignment, b: Assignment) => {
                return new Date(b.startDate!).valueOf() - new Date(a.startDate!).valueOf();
            });
            setAssignments(data);
        });
    }, [person]);

    const toggleShowing = () => {
        setIsShowing(!isShowing);
    };

    const handleKeyDownForToggleShowing = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            toggleShowing();
        }
    };

    const capitalize = (s: string): string => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const isValidDate = (d: Date | undefined): boolean => {
        return d !== undefined && d !== null && typeof d.valueOf() === 'number';
    };

    const getProductName = (assignment: Assignment): string => {
        let productName = 'Unknown Product';
        const product = products.find((product) => product.id === assignment.productId);
        if (product) {
            productName = product.name;
        }
        if (productName === 'unassigned') {
            productName = capitalize(productName);
        }
        return productName;
    };

    const getStartDate = (assignment: Assignment): string => {
        return (assignment.startDate ? moment(assignment.startDate).format('MM/DD/YYYY') : 'undefined date');
    };

    const getEndDate = (assignment: Assignment): string => {
        return (didAssignmentEndInThePast(assignment) ? moment(assignment.endDate).subtract(1, 'days').format('MM/DD/YYYY') : 'Current');
    };

    const getDurationUnit = (duration: number): string => {
        return (duration === 1 ? 'day' : 'days');
    };

    const getCurrentAssignments = (): Array<Assignment> => {
        return assignments.filter(assignment => { return !didAssignmentEndInThePast(assignment);});
    };

    const getPastAssignments = (): Array<Assignment> => {
        return assignments.filter(assignment => { return didAssignmentEndInThePast(assignment);});
    };

    const generateTableRow = (assignment: Assignment): JSX.Element => {
        if (assignment && moment(assignment.startDate).isBefore(moment())) {
            const productName = getProductName(assignment);
            const startDate = getStartDate(assignment);
            const endDate = getEndDate(assignment);
            const duration = getDurationWithRespectToToday(assignment) - 1;
            const durationUnit = getDurationUnit(duration);
            return (<div key={'' + person.id + assignment.productId + assignment.startDate} className="assignmentHistoryRow">
                <div className="assignmentHistoryCell">{productName}</div>
                <div className="assignmentHistoryCell">{startDate} - {endDate} ({duration} {durationUnit})</div>
            </div>);
        } else {
            return (<></>);
        }
    };

    const generateTableRows = (inputAssignments: Array<Assignment>): Array<JSX.Element> => {
        const assignmentHistoryRows: Array<JSX.Element> = [];
        inputAssignments.forEach(
            (assignment) => {
                if (assignment && moment(assignment.startDate).isBefore(moment())) {
                    assignmentHistoryRows.push(
                        generateTableRow(assignment),
                    );
                }
            },
        );
        return assignmentHistoryRows;
    };

    const generateAssignmentHistoryContent = (): JSX.Element => {
        let returnValue = <></>;
        if (isShowing) {
            returnValue =
                <>
                    <div className="assignmentHistoryTable">
                        {generateTableRows(getCurrentAssignments())}
                    </div>
                    <div className="assignmentHistoryPastLabel">past:</div>
                    <div className="assignmentHistoryTable assignmentHistoryTableBorder assignmentHistoryTablePast">
                        {generateTableRows(getPastAssignments())}
                    </div>
                </>;
        }
        return returnValue;
    };

    return (
        <>
            <div className={'flexRow'} onClick={toggleShowing} onKeyPress={handleKeyDownForToggleShowing}>
                <span className="formItemLabel purple">View Assignment History</span>
                <span className="material-icons assignmentHistoryArrow purple" data-testid="assignmentHistoryArrow">
                    {isShowing ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
            </div>
            {generateAssignmentHistoryContent()}
        </>
    );
}
