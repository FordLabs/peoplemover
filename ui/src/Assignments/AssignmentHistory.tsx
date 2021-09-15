import moment from "moment";
import {Assignment, calculateDuration} from "./Assignment";
import React from "react";
import {Product} from "../Products/Product";

interface AssignmentHistoryProps{
    assignmentHistory: Array<Assignment>;
    products: Array<Product>;
    date: Date;
}
export function AssignmentHistory({products, assignmentHistory, date}: AssignmentHistoryProps): JSX.Element {

    const capitalize = (s: string): string => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    return (
        <>
            {assignmentHistory.map(
                assignment => {
                    if (assignment) {
                        let productName = 'Unknown/Future Product';
                        let product = products.find((product) => product.id === assignment.productId);
                        if (product) {
                            productName = product.name;
                        }
                        if (productName === 'unassigned') {
                            productName = capitalize(productName);
                        }
                        let startDate = (assignment.startDate ? moment(assignment.startDate).format('MM/DD/YYYY') : 'undefined date');
                        let endDate = (assignment.endDate ? moment(assignment.endDate).format('MM/DD/YYYY') : 'Current');
                        let duration = calculateDuration(assignment, date);
                        let durationUnit = (duration === 1 ? 'day' : 'days');
                        return (
                            <div
                                key={assignment.id}>{productName} {startDate} - {endDate} ({duration} {durationUnit})</div>
                        );
                    } else {
                        return (
                            <div>No Assignment History</div>
                        );
                    }
                }
            )}
        </>
    );
}