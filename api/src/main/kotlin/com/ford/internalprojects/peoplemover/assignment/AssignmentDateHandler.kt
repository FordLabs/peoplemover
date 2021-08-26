package com.ford.internalprojects.peoplemover.assignment

import org.springframework.stereotype.Component
import java.time.LocalDate


@Component
class AssignmentDateHandler {
    fun findUniqueDates(assignmentList: List<AssignmentV1>): List<LocalDate> {
        return assignmentList.map { assignment -> assignment.effectiveDate!! }.distinct()
    }

    fun findStartDate(uniqueDatesForAssignment: List<LocalDate>, uniqueDatesForAllAssignment: List<LocalDate>): LocalDate {
        val uniqueDatesForAllAssignmentSorted = uniqueDatesForAllAssignment.sortedByDescending { date -> date }

        var startDate = uniqueDatesForAllAssignmentSorted.last()

        if (uniqueDatesForAssignment != uniqueDatesForAllAssignment) {
            startDate = uniqueDatesForAllAssignmentSorted.first()
            for (date in uniqueDatesForAllAssignmentSorted) {
                if (uniqueDatesForAssignment.contains(date)) {
                    startDate = date
                } else
                    break
            }
        }
        return startDate
    }

    fun findEndDate(uniqueDatesForAssignments: List<LocalDate>, uniqueDatesForAllAssignments: List<LocalDate>): LocalDate? {
        val uniqueDatesForAllAssignmentSorted = uniqueDatesForAllAssignments.sortedByDescending { date -> date }.reversed()

        var endDate: LocalDate? = null
        if(uniqueDatesForAllAssignments.size > 0) {
            endDate = uniqueDatesForAllAssignments.first()
        }
        if (uniqueDatesForAssignments.size > 0) {
            endDate = null
            for (date in uniqueDatesForAllAssignmentSorted) {
                if (!uniqueDatesForAssignments.contains(date)) {
                    endDate = date.minusDays(1)
                    break
                }
            }
        }
        return endDate
    }
}
