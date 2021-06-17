package com.ford.internalprojects.peoplemover.assignment

import org.springframework.stereotype.Component
import java.time.LocalDate


@Component
class AssignmentDateHandler {
    fun findUniqueDates(assignmentList: List<Assignment>): List<LocalDate> {
        return assignmentList.map { assignment -> assignment.effectiveDate!!}.distinct()
    }

    fun findStartDate(uniqueDatesForAssignment: List<LocalDate>, uniqueDatesForAllAssignment: List<LocalDate>): LocalDate {
        return uniqueDatesForAllAssignment.sortedByDescending { date -> date }.last()
    }
}
