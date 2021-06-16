package com.ford.internalprojects.peoplemover.assignment

import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class AssignmentDateHandler {
    fun findUniqueDates(assignmentList: List<Assignment>): List<LocalDate> {
        var returnValue: LinkedHashSet<LocalDate> = LinkedHashSet()
        assignmentList.map{returnValue.add(it.effectiveDate!!)}
        return returnValue.toList()
    }
}
