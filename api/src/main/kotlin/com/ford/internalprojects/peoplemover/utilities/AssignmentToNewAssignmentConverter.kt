package com.ford.internalprojects.peoplemover.utilities

import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.assignment.NewAssignment
import java.time.LocalDate

class AssignmentToNewAssignmentConverter {
    fun convert(oldAssignments: List<Assignment>): List<NewAssignment> {
        var returnList = mutableListOf<NewAssignment>()
        val today = LocalDate.now()
        val sortedAssignments = oldAssignments.sortedBy { it.effectiveDate }.toMutableList()
        var savedAssignment: NewAssignment? = null
        var savedEffectiveDate: LocalDate? = null
        var savedProductId: Int = 0

        for (index in sortedAssignments.indices) {
            if(savedAssignment == null) {
                savedAssignment = NewAssignment(id = sortedAssignments[index].id, person = sortedAssignments[index].person, productId = sortedAssignments[index].productId, startDate = sortedAssignments[index].effectiveDate!!, endDate = null, placeholder = sortedAssignments[index].placeholder, spaceUuid = sortedAssignments[index].spaceUuid)
                savedEffectiveDate = sortedAssignments[index].effectiveDate!!
                savedProductId = sortedAssignments[index].productId
                returnList.add(savedAssignment)
            } else if (sortedAssignments[index].effectiveDate != savedEffectiveDate) {
                if(sortedAssignments[index].productId != savedProductId) {
                    savedAssignment.endDate = sortedAssignments[index].effectiveDate
                    savedAssignment = NewAssignment(id = sortedAssignments[index].id, person = sortedAssignments[index].person, productId = sortedAssignments[index].productId, startDate = sortedAssignments[index].effectiveDate!!, endDate = null, placeholder = sortedAssignments[index].placeholder, spaceUuid = sortedAssignments[index].spaceUuid)
                    savedEffectiveDate = sortedAssignments[index].effectiveDate!!
                    savedProductId = sortedAssignments[index].productId
                    returnList.add(savedAssignment)
                } else {
                    continue
                }
//            } else if (sortedAssignments[index].productId != savedProductId){
//                savedAssignment.endDate = savedEffectiveDate
//                savedAssignment = NewAssignment(id = sortedAssignments[index].id, person = sortedAssignments[index].person, productId = sortedAssignments[index].productId, startDate = sortedAssignments[index].effectiveDate!!, endDate = null, placeholder = sortedAssignments[index].placeholder, spaceUuid = sortedAssignments[index].spaceUuid)
//                savedEffectiveDate = sortedAssignments[index].effectiveDate!!
//                savedProductId = sortedAssignments[index].productId
            } else {
                continue
            }
//            if (index < sortedAssignments.size - 1) {
//                if (sortedAssignments[index].productId == sortedAssignments[index + 1].productId) {
//                    returnList.add(NewAssignment(id = sortedAssignments[index].id, person = sortedAssignments[index].person, productId = sortedAssignments[index].productId, startDate = sortedAssignments[index].effectiveDate!!, endDate = null, placeholder = sortedAssignments[index].placeholder, spaceUuid = sortedAssignments[index].spaceUuid))
//                }
//            } else {
//                returnList.add(NewAssignment(id = sortedAssignments[index].id, person = sortedAssignments[index].person, productId = sortedAssignments[index].productId, startDate = sortedAssignments[index].effectiveDate!!, endDate = null, placeholder = sortedAssignments[index].placeholder, spaceUuid = sortedAssignments[index].spaceUuid))
//            }
        }

//        var firstElement = sortedAssignments[0]
//        var secondElemt = sortedAssignments[1]
//        if (firstElement.productId == secondElemt.productId ) {
//
//        }

        return returnList.toList();
    }
/*
    fun joinAssignmentsByDate(assignments: List<NewAssignment>): List<NewAssignment> {
        if(assignments.size < 2){
            return assignments;
        }
        else if(!doMergesExist(assignments)){
            return joinAssignmentsByDate(mergeOneAssignment(assignments))
        }
        else return assignments
    }

    private fun mergeOneAssignment(assignments: List<NewAssignment>): List<NewAssignment> {

    }

    private fun doMergesExist(assignments: List<NewAssignment>): Boolean {

    }*/
}