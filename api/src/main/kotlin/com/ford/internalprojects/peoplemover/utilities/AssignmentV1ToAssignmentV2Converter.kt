package com.ford.internalprojects.peoplemover.utilities

import com.ford.internalprojects.peoplemover.assignment.AssignmentV1
import com.ford.internalprojects.peoplemover.assignment.AssignmentV2
import com.ford.internalprojects.peoplemover.assignment.CreateAssignmentsRequest
import com.ford.internalprojects.peoplemover.person.Person
import java.time.LocalDate
import kotlin.streams.toList

class AssignmentV1ToAssignmentV2Converter {
    fun convert(v1Assignments: List<AssignmentV1>): List<AssignmentV2> {
        val v2Assignments = mutableListOf<AssignmentV2>()

        val mapOfPerson = mapPersonToV1Assignments(v1Assignments)

        for (v1AssignmentsForPerson in mapOfPerson.values) {
            v2Assignments.addAll(createListOfV2AssignmentsForAPerson(v1AssignmentsForPerson))
        }
        return v2Assignments.toList()
    }

    fun put(newAssignmentV1Request: CreateAssignmentsRequest, person: Person, preExistingAssignmentsV2: List<AssignmentV2>): List<AssignmentV2> {
        val preExistingAssignmentsCopy = preExistingAssignmentsV2.map { it.copy() }
        var personAssignmentsV2 = preExistingAssignmentsCopy.filter { it.person.id == person.id }
        var notPersonAssignmentsV2 = preExistingAssignmentsCopy.filter { it.person.id != person.id }
        var updatedAssignmentsV2 = notPersonAssignmentsV2.toMutableList()
        personAssignmentsV2 = handleTheFunkyMergeCase(newAssignmentV1Request, personAssignmentsV2);
        updatedAssignmentsV2.addAll(endExistingAssignments(newAssignmentV1Request, personAssignmentsV2))
        updatedAssignmentsV2.addAll(createNewAssignments(newAssignmentV1Request, person, personAssignmentsV2))
        return updatedAssignmentsV2.toList();
    }

    fun handleTheFunkyMergeCase(req: CreateAssignmentsRequest, assignments: List<AssignmentV2>): List<AssignmentV2> {
        val toReturn: MutableList<AssignmentV2> = assignments.toMutableList()
        for (product in req.products) {
            val postcursorAssignment: AssignmentV2? = soonestAfter(toReturn, req.requestedDate, product.productId);
            val precursorAssignment: AssignmentV2? = toReturn.find { assignmentV2 -> assignmentV2.productId == product.productId &&  assignmentV2.endDate != null && assignmentV2.endDate!!.isEqual(req.requestedDate.plusDays(-1)) }
            if (precursorAssignment != null && postcursorAssignment != null) {
                precursorAssignment.endDate = postcursorAssignment.endDate;
                toReturn.remove(postcursorAssignment)
            }
        }
        return toReturn;
    }

    fun soonestAfter(assignments: List<AssignmentV2>, date: LocalDate, productId: Int): AssignmentV2? {
        var assignmentsByStartDate: MutableList<AssignmentV2> = assignments.toMutableList();
        assignmentsByStartDate.sortBy { it.startDate }
        assignmentsByStartDate = assignmentsByStartDate.filter { it.startDate.isAfter(date) }.filter { it.productId == productId }.toMutableList()
        if (assignmentsByStartDate.isEmpty()) {
            return null
        } else {
            return assignmentsByStartDate.first()
        }
    }

    fun endExistingAssignments(newAssignmentV1Request: CreateAssignmentsRequest, personAssignmentsV2: List<AssignmentV2>): List<AssignmentV2> {
        var newAssignedProducts = newAssignmentV1Request.products.map { it.productId }.toSet()
        for (assignmentV2 in personAssignmentsV2) {
            if (isAssignmentIntersectingDate(assignmentV2, newAssignmentV1Request.requestedDate) && !newAssignedProducts.contains(assignmentV2.productId)) {
                assignmentV2.endDate = newAssignmentV1Request.requestedDate
            }
        }
        return personAssignmentsV2.toList()
    }

    fun createNewAssignments(newAssignmentV1Request: CreateAssignmentsRequest, person: Person, personAssignmentsV2: List<AssignmentV2>): List<AssignmentV2> {
        var newAssignmentsV2 = mutableListOf<AssignmentV2>()
        var earliestStartDate = personAssignmentsV2.minBy { it.startDate }?.startDate
        var endDate: LocalDate? = null
        if (earliestStartDate != null && newAssignmentV1Request.requestedDate.isBefore(earliestStartDate)) {
            endDate = earliestStartDate
        }
        for (newAssignmentV1Info in newAssignmentV1Request.products) {
            if (!personAssignmentsV2.any { it.productId == newAssignmentV1Info.productId }) {
                newAssignmentsV2.add(AssignmentV2(person = person, spaceUuid = person.spaceUuid, placeholder = newAssignmentV1Info.placeholder, productId = newAssignmentV1Info.productId, startDate = newAssignmentV1Request.requestedDate, endDate = endDate))
            }
        }
        return newAssignmentsV2.toList()
    }

    private fun isAssignmentIntersectingDate(assignment: AssignmentV2, date: LocalDate): Boolean {
        return (assignment.startDate.isBefore(date) || assignment.startDate.isEqual(date)) &&
                (assignment.endDate == null || assignment.endDate!!.isAfter(date))
    }

    private fun mapPersonToV1Assignments(v1Assignments: List<AssignmentV1>): Map<Person, List<AssignmentV1>> {
        val mapOfPerson = mutableMapOf<Person, MutableList<AssignmentV1>>();

        for (v1Assignment in v1Assignments) {
            if (!mapOfPerson.containsKey(v1Assignment.person)) {
                mapOfPerson[v1Assignment.person] = mutableListOf(v1Assignment)
            } else {
                val v1AssignmentsForPerson = mapOfPerson[v1Assignment.person]
                v1AssignmentsForPerson!!.add(v1Assignment)
                mapOfPerson[v1Assignment.person] = v1AssignmentsForPerson
            }
        }
        return mapOfPerson.toMap()
    }

    private fun createListOfV2AssignmentsForAPerson(v1Assignments: List<AssignmentV1>): List<AssignmentV2> {
        val v2Assignments = mutableListOf<AssignmentV2>()
        val v1AssignmentsSorted = v1Assignments.sortedBy { it.effectiveDate }
        val effectiveDatesSorted = v1AssignmentsSorted.stream().map { assignment -> assignment.effectiveDate }.distinct().toList()

        for (effectiveDate in effectiveDatesSorted) {
            val v1AssignmentsForEffectiveDate = effectiveDate?.let { findV1AssignmentsByEffectiveDate(it, v1AssignmentsSorted) };
            if (v1AssignmentsForEffectiveDate != null) {
                endAssignments(findV2AssignmentsToEnd(v2Assignments, v1AssignmentsForEffectiveDate), effectiveDate)
                for (v1Assignment in v1AssignmentsForEffectiveDate) {
                    if (!isAssignedToProductOnDate(v1Assignment.productId, effectiveDate, v2Assignments)) {
                        // TODO: Remove id assignment from next line. Let AssignmentRepository set up Id behind the scenes. This is just for testing purposes right now.
                        // TODO: Verify that the v1Assignment.person has been created properly.
                        v2Assignments.add(AssignmentV2(id = v1Assignment.id, person = v1Assignment.person, placeholder = v1Assignment.placeholder, productId = v1Assignment.productId, startDate = effectiveDate, endDate = null, spaceUuid = v1Assignment.spaceUuid));
                    }
                }
            }
        }
        return v2Assignments.toList();
    }

    private fun findV2AssignmentsToEnd(v2Assignments: List<AssignmentV2>, v1AssignmentsForEffectiveDate: List<AssignmentV1>): List<AssignmentV2> {
        val v2AssignmentsToBeEnded = mutableListOf<AssignmentV2>();
        val v2AssignmentsNotYetEnded: List<AssignmentV2> = findV2AssignmentsWithoutEndDate(v2Assignments);
        for (v2Assignment in v2AssignmentsNotYetEnded) {
            if (v1AssignmentsForEffectiveDate.none { v1Assignment -> v1Assignment.productId == v2Assignment.productId }) {
                v2AssignmentsToBeEnded.add(v2Assignment);
            }
        }
        return v2AssignmentsToBeEnded.toList()
    }

    private fun endAssignments(v2Assignments: List<AssignmentV2>, endDate: LocalDate) {
        for (v2Assignment in v2Assignments) {
            v2Assignment.endDate = endDate;
        }
    }

    private fun isAssignedToProductOnDate(productId: Int, date: LocalDate, assignments: List<AssignmentV2>): Boolean {
        for (assignment in assignments.filter { assn -> assn.productId == productId }) {
            if (assignment.startDate.isBefore(date) && (assignment.endDate == null || assignment.endDate!!.isAfter(date))) {
                return true;
            }
        }
        return false;
    }

    private fun findV2AssignmentsWithoutEndDate(v2Assignments: List<AssignmentV2>): List<AssignmentV2> {
        return v2Assignments.filter { v2Assignment -> v2Assignment.endDate == null }
    }

    private fun findV1AssignmentsByEffectiveDate(date: LocalDate, v1Assignments: List<AssignmentV1>): List<AssignmentV1> {
        return v1Assignments.filter { v1Assignment -> v1Assignment.effectiveDate == date }
    }
}
