import moment from "moment";
import {Assignment, calculateDuration} from "../Assignment";
import React, {useEffect, useState} from "react";
import {Space} from "../../Space/Space";
import {Person} from "../../People/Person";
import {Product} from "../../Products/Product";
import AssignmentClient from "../AssignmentClient";
import ProductClient from "../../Products/ProductClient";

interface AssignmentHistoryProps {
    person: Person;
}

export function AssignmentHistory({person}: AssignmentHistoryProps): JSX.Element {

    const [products, setProducts] = useState<Array<Product>>([]);
    const [assignments, setAssignments] = useState<Array<Assignment>>([]);

    const capitalize = (s: string): string => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    useEffect(() => {
        ProductClient.getProductsForDate(person.spaceUuid, new Date()).then((result) => {
            setProducts(result.data);
        })
        AssignmentClient.getAssignmentsV2ForSpaceAndPerson(person.spaceUuid, person.id).then((result) => {
            setAssignments(result.data);
        });
    }, [person]);



    return (
        <>
            {assignments.map(
                assignment => {
                    const now = new Date();
                    if (assignment && moment(assignment.startDate).isBefore(moment(now))) {
                        let productName = 'Unknown Product';
                        let product = products.find((product) => product.id === assignment.productId);
                        if (product) {
                            productName = product.name;
                        }
                        if (productName === 'unassigned') {
                            productName = capitalize(productName);
                        }
                        let startDate = (assignment.startDate ? moment(assignment.startDate).format('MM/DD/YYYY') : 'undefined date');
                        let endDate = (assignment.endDate ? moment(assignment.endDate).format('MM/DD/YYYY') : 'Current');
                        let duration = calculateDuration(assignment, now);
                        let durationUnit = (duration === 1 ? 'day' : 'days');
                        return (
                            <div
                                key={assignment.id}>{productName} {startDate} - {endDate} ({duration} {durationUnit})
                            </div>
                        );
                    }
                }
            )}
        </>
    );
}