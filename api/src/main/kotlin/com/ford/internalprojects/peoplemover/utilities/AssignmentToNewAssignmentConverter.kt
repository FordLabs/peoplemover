package com.ford.internalprojects.peoplemover.utilities

import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.assignment.NewAssignment
import com.ford.internalprojects.peoplemover.person.Person
import java.time.LocalDate
import kotlin.streams.toList

class AssignmentToNewAssignmentConverter {
    fun convert(oldAssignments: List<Assignment>): List<NewAssignment> {
        val listOfNewAssignments = mutableListOf<NewAssignment>()

        val mapOfSpace = mapSpacesToAssignments(oldAssignments)
        for (assignmentInSpace in mapOfSpace.values) {

            val mapOfPerson = mapPersonToAssignments(assignmentInSpace)

            for (list in mapOfPerson.values) {
                listOfNewAssignments.addAll(createListOfNewAssignmentForAPerson(list))
            }
        }
        return listOfNewAssignments
    }

    private fun mapSpacesToAssignments(oldAssignments: List<Assignment>): MutableMap<String, MutableList<Assignment>> {
            val mapOfSpace = mutableMapOf<String,MutableList<Assignment>>();

            for (assignment in oldAssignments) {
                if(!mapOfSpace.containsKey(assignment.spaceUuid)) {
                    mapOfSpace[assignment.spaceUuid] = mutableListOf(assignment)
                } else {
                    val oldList = mapOfSpace[assignment.spaceUuid]
                    oldList!!.add(assignment)
                    mapOfSpace[assignment.spaceUuid] = oldList
                }
            }
            return  mapOfSpace
    }

    private fun createListOfNewAssignmentForAPerson(oldAssignments: List<Assignment>): MutableList<NewAssignment> {
        var returnList = mutableListOf<NewAssignment>()
        val sortedAssignments = oldAssignments.sortedBy { it.effectiveDate }.toMutableList()
        val listOfDateSorted = sortedAssignments.stream().map { assignment -> assignment.effectiveDate }.distinct().toList()


        for (currentDate in listOfDateSorted) {
            val assignmentsForDate = currentDate?.let { findAssignmentsEffectiveOnDate(it, sortedAssignments) };
            if (assignmentsForDate != null) {
                endAssignments(identifyAssignmentsEnding(returnList, assignmentsForDate, currentDate), currentDate)
                for (a in assignmentsForDate) {
                    if (!isAssignedToProductOnDate(a.productId, currentDate, returnList)) {
                        returnList.add(NewAssignment(person = a.person, placeholder = a.placeholder, productId = a.productId, startDate = currentDate, endDate = null, spaceUuid = a.spaceUuid));
                    }
                }
            }
        }
        return returnList;
    }

    private fun mapPersonToAssignments(oldAssignments: List<Assignment>): Map<Person, List<Assignment>> {
        val mapOfPerson = mutableMapOf<Person,MutableList<Assignment>>();

        for (assignment in oldAssignments) {
            if(!mapOfPerson.containsKey(assignment.person)) {
                mapOfPerson[assignment.person] = mutableListOf(assignment)
            } else {
                val oldList = mapOfPerson[assignment.person]
                oldList!!.add(assignment)
                mapOfPerson[assignment.person] = oldList
            }
        }
        return  mapOfPerson
    }

    private fun endAssignments(assns: MutableList<NewAssignment>, date: LocalDate){
        for(assn in assns){
            assn.endDate = date;
        }
    }

    private fun identifyAssignmentsEnding(newAssignments: MutableList<NewAssignment>, assignmentsForDate: List<Assignment>, date: LocalDate) : MutableList<NewAssignment> {
        val toReturn : MutableList<NewAssignment> = mutableListOf<NewAssignment>();
        val outstandingNewAssignments: List<NewAssignment> = findOutstandingAssignments(newAssignments);
        for (newAssignment in outstandingNewAssignments){
            if(assignmentsForDate.count { a -> a.productId == newAssignment.productId} <= 0){
                toReturn.add(newAssignment);
            }
        }
        return toReturn;
    }

    fun isAssignedToProductOnDate(productId: Int, date: LocalDate, assignments: List<NewAssignment> ): Boolean{
        for(assignment in assignments.filter{assn -> assn.productId == productId})
        {
            if(assignment.startDate.isBefore(date) && (assignment.endDate == null || assignment.endDate!!.isAfter(date))){
                return true;
            }
        }
        return false;
    }

    fun findOutstandingAssignments(assignments: List<NewAssignment>) : List<NewAssignment>{
        return assignments.filter { assignment -> assignment.endDate == null }
    }

    fun findAssignmentsEffectiveOnDate(date: LocalDate, assignments: List<Assignment>) : List<Assignment> {
        return assignments.filter { assignment -> assignment.effectiveDate == date }
    }
}