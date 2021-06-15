package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.person.Person
import org.assertj.core.api.Assertions
import org.junit.Test
import java.time.LocalDate

class AssignmentDateHandlerTest {

    @Test
    fun uniqueDatesFinder() {
        val person = Person(name = "name", spaceUuid = "space")
        var effectiveDate = LocalDate.parse("2021-06-30")
        val assignmentList: List<Assignment> = listOf(Assignment(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate))

        val expectedDateList: List<LocalDate> = listOf(effectiveDate)

        val assignmentDateHandler = AssignmentDateHandler();
        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        Assertions.assertThat(actualDateList).isEqualTo(expectedDateList)
    }
}