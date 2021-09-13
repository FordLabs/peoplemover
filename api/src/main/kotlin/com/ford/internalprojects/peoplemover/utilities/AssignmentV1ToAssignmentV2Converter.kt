package com.ford.internalprojects.peoplemover.utilities

import com.ford.internalprojects.peoplemover.assignment.AssignmentV1
import com.ford.internalprojects.peoplemover.assignment.AssignmentV2
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
                        v2Assignments.add(AssignmentV2(person = v1Assignment.person, placeholder = v1Assignment.placeholder, productId = v1Assignment.productId, startDate = effectiveDate, endDate = null, spaceUuid = v1Assignment.spaceUuid));
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
