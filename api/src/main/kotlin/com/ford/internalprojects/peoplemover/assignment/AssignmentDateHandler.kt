package com.ford.internalprojects.peoplemover.assignment

import org.springframework.stereotype.Component
import java.time.LocalDate


@Component
class AssignmentDateHandler {
    fun findUniqueDates(assignmentList: List<Assignment>): List<LocalDate> {
        return assignmentList.map { assignment -> assignment.effectiveDate!!}.distinct()
    }

    fun findStartDate(uniqueDatesForAssignment: List<LocalDate>, uniqueDatesForAllAssignment: List<LocalDate>): LocalDate {
        val uniqueDatesForAllAssignmentSorted = uniqueDatesForAllAssignment.sortedByDescending { date -> date }

        var startDate = uniqueDatesForAllAssignmentSorted.last()

        if(uniqueDatesForAssignment != uniqueDatesForAllAssignment) {
            startDate = uniqueDatesForAllAssignmentSorted.first()
            for(date in uniqueDatesForAllAssignmentSorted) {
                if (uniqueDatesForAssignment.contains(date)) {
                    startDate = date
                } else
                    break
            }
        }
        return startDate
    }
}
