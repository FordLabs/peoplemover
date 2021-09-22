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

import moment from 'moment';
import {Assignment, calculateDuration} from '../Assignment';
import React, {useEffect, useState} from 'react';
import {Person} from '../../People/Person';
import {Product} from '../../Products/Product';
import AssignmentClient from '../AssignmentClient';
import ProductClient from '../../Products/ProductClient';
import './AssignmentHistory.scss';

interface AssignmentHistoryProps {
    person: Person;
}

export function AssignmentHistory({person}: AssignmentHistoryProps): JSX.Element {

    const [products, setProducts] = useState<Array<Product>>([]);
    const [assignments, setAssignments] = useState<Array<Assignment>>([]);
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
        let product = products.find((product) => product.id === assignment.productId);
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
        return ((assignment.endDate && moment(assignment.endDate).isBefore(moment())) ? moment(assignment.endDate).format('MM/DD/YYYY') : 'Current');
    };

    const getDurationUnit = (duration: number): string => {
        return (duration === 1 ? 'day' : 'days');
    };

    const getDurationWithRespectToToday = (assignment: Assignment) => {
        const isFutureEnd: boolean = assignment.endDate !== null && moment(assignment.endDate).isAfter(moment.now());
        if (isFutureEnd) {
            return calculateDuration({...assignment, endDate: undefined}, new Date());
        } else {
            return calculateDuration(assignment, new Date());
        }
    };

    const generateTableRow = (assignment: Assignment): JSX.Element => {
        const now = new Date();
        if (assignment && moment(assignment.startDate).isBefore(moment(now))) {
            const productName = getProductName(assignment);
            const startDate = getStartDate(assignment);
            const endDate = getEndDate(assignment);
            const duration = getDurationWithRespectToToday(assignment);
            const durationUnit = getDurationUnit(duration);
            return (<tr key={'' + person.id + assignment.productId + assignment.startDate} className="assignmentHistoryRow">
                <td className="assignmentHistoryCell assignmentHistoryName">{productName}</td>
                <td className="assignmentHistoryCell assignmentHistoryDate">{startDate} - {endDate} ({duration} {durationUnit})</td>
            </tr>);
        } else {
            return (<></>);
        }
    };

    const generateTableRows = (): Array<JSX.Element> => {
        const assignmentHistoryRows: Array<JSX.Element> = [];
        assignments.forEach(
            (assignment, index) => {
                if (index === 0) {
                    return;
                }
                const now = new Date();
                if (assignment && moment(assignment.startDate).isBefore(moment(now))) {
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
                    <table className="assignmentHistoryTable assignmentHistoryTableCurrent">
                        <tbody>
                            {generateTableRow(assignments[0])}
                        </tbody>
                    </table>
                    <div className="assignmentHistoryPastLabel">past:</div>
                    <table className="assignmentHistoryTable assignmentHistoryTableBorder assignmentHistoryTablePast">
                        <tbody>
                            {generateTableRows()}
                        </tbody>
                    </table>
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
