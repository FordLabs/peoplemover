package com.ford.internalprojects.peoplemover.assignment

import org.springframework.stereotype.Component
import java.time.LocalDate


@Component
class AssignmentDateHandler {
    fun findUniqueDates(assignmentList: List<AssignmentV1>): List<LocalDate> {
        return assignmentList.map { assignment -> assignment.effectiveDate!! }.distinct()
    }

    fun findStartDate(uniqueProductAssignmentPrevAndCurrDates: List<LocalDate>, uniqueAllAssignmentPrevAndCurrDates: List<LocalDate>): LocalDate {
        val uniqueDatesForAllAssignmentSorted = uniqueAllAssignmentPrevAndCurrDates.sortedByDescending { date -> date }

        var startDate = uniqueDatesForAllAssignmentSorted.last()

        if (uniqueProductAssignmentPrevAndCurrDates != uniqueAllAssignmentPrevAndCurrDates) {
            startDate = uniqueDatesForAllAssignmentSorted.first()
            for (date in uniqueDatesForAllAssignmentSorted) {
                if (uniqueProductAssignmentPrevAndCurrDates.contains(date)) {
                    startDate = date
                } else
                    break
            }
        }
        return startDate
    }

    fun findEndDate(uniqueProductAssignmentFutureDates: List<LocalDate>, uniqueAllAssignmentFutureDates: List<LocalDate>): LocalDate? {
        val uniqueDatesForAllAssignmentSorted = uniqueAllAssignmentFutureDates.sortedByDescending { date -> date }.reversed()

        var endDate: LocalDate? = null
        if(uniqueAllAssignmentFutureDates.isNotEmpty()) {
            endDate = uniqueAllAssignmentFutureDates.first()
        }
        if (uniqueProductAssignmentFutureDates.isNotEmpty()) {
            endDate = null
            for (date in uniqueDatesForAllAssignmentSorted) {
                if (!uniqueProductAssignmentFutureDates.contains(date)) {
                    endDate = date.minusDays(1)
                    break
                }
            }
        }
        return endDate
    }
}
