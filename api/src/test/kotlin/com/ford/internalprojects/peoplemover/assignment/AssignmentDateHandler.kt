package com.ford.internalprojects.peoplemover.assignment

import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class AssignmentDateHandler {
    fun findUniqueDates(assignmentList: List<Assignment>): List<LocalDate> {
        return listOf(assignmentList[0].effectiveDate!!)
    }
}