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

    fun put(newAssignmentV1Request: CreateAssignmentsRequest, person: Person, preExistingAssignmentsV2: List<AssignmentV2>) : List<AssignmentV2>{
        var updatedAssignmentsV2 = endExistingAssignments(newAssignmentV1Request, person, preExistingAssignmentsV2).toMutableList()
        updatedAssignmentsV2.addAll(createNewAssignments(newAssignmentV1Request, person))
        return updatedAssignmentsV2.toList();
    }

    fun endExistingAssignments(newAssignmentV1Request: CreateAssignmentsRequest, person: Person, preExistingAssignmentsV2: List<AssignmentV2>): List<AssignmentV2> {
        var personAssignmentsV2 = getAssignmentsIntersectingDate(preExistingAssignmentsV2, newAssignmentV1Request.requestedDate).filter { it.person.id == person.id }
        var newAssignedProducts = newAssignmentV1Request.products.map { it.productId }.toSet()
        for(assignmentV2 in personAssignmentsV2) {
            if(!newAssignedProducts.contains(assignmentV2.productId)) {
                assignmentV2.endDate = newAssignmentV1Request.requestedDate
            }
        }
        return preExistingAssignmentsV2.toList()
    }

    fun createNewAssignments(newAssignmentV1Request: CreateAssignmentsRequest, person: Person): List<AssignmentV2> {
        var newAssignmentsV2 = mutableListOf<AssignmentV2>()
        for(newAssignmentV1Info in newAssignmentV1Request.products) {
            newAssignmentsV2.add(AssignmentV2(person = person, spaceUuid = person.spaceUuid, placeholder = newAssignmentV1Info.placeholder, productId = newAssignmentV1Info.productId, startDate = newAssignmentV1Request.requestedDate, endDate = null))
        }
        return newAssignmentsV2.toList()
    }

    private fun getAssignmentsIntersectingDate(assignments: List<AssignmentV2>, date: LocalDate): List<AssignmentV2> {
        return assignments.filter { assignment: AssignmentV2 -> (assignment.startDate.isBefore(date) ||
                assignment.startDate.isEqual(date)) &&
                (assignment.endDate == null ||
                        assignment.endDate!!.isAfter(date))}
    }

    private fun mapPersonToV1Assignments(v1Assignments: List<AssignmentV1>): Map<Person, List<AssignmentV1>> {
        val mapOfPerson = mutableMapOf<Person,MutableList<AssignmentV1>>();

        for (v1Assignment in v1Assignments) {
            if(!mapOfPerson.containsKey(v1Assignment.person)) {
                mapOfPerson[v1Assignment.person] = mutableListOf(v1Assignment)
            } else {
                val v1AssignmentsForPerson = mapOfPerson[v1Assignment.person]
                v1AssignmentsForPerson!!.add(v1Assignment)
                mapOfPerson[v1Assignment.person] = v1AssignmentsForPerson
            }
        }
        return  mapOfPerson.toMap()
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

    private fun findV2AssignmentsToEnd(v2Assignments: List<AssignmentV2>, v1AssignmentsForEffectiveDate: List<AssignmentV1>) : List<AssignmentV2> {
        val v2AssignmentsToBeEnded = mutableListOf<AssignmentV2>();
        val v2AssignmentsNotYetEnded: List<AssignmentV2> = findV2AssignmentsWithoutEndDate(v2Assignments);
        for (v2Assignment in v2AssignmentsNotYetEnded){
            if(v1AssignmentsForEffectiveDate.none { v1Assignment -> v1Assignment.productId == v2Assignment.productId }){
                v2AssignmentsToBeEnded.add(v2Assignment);
            }
        }
        return v2AssignmentsToBeEnded.toList()
    }

    private fun endAssignments(v2Assignments: List<AssignmentV2>, endDate: LocalDate){
        for(v2Assignment in v2Assignments){
            v2Assignment.endDate = endDate;
        }
    }

    private fun isAssignedToProductOnDate(productId: Int, date: LocalDate, assignments: List<AssignmentV2> ): Boolean{
        for(assignment in assignments.filter{assn -> assn.productId == productId})
        {
            if(assignment.startDate.isBefore(date) && (assignment.endDate == null || assignment.endDate!!.isAfter(date))){
                return true;
            }
        }
        return false;
    }

    private fun findV2AssignmentsWithoutEndDate(v2Assignments: List<AssignmentV2>) : List<AssignmentV2>{
        return v2Assignments.filter { v2Assignment -> v2Assignment.endDate == null }
    }

    private fun findV1AssignmentsByEffectiveDate(date: LocalDate, v1Assignments: List<AssignmentV1>) : List<AssignmentV1> {
        return v1Assignments.filter { v1Assignment -> v1Assignment.effectiveDate == date }
    }
}
