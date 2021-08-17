package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.person.Person
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.time.LocalDate

class AssignmentDateHandlerTest {

    val person = Person(name = "name", spaceUuid = "space")
    val jun1 = "2020-06-01"
    val jul1 = "2020-07-01"
    val aug1 = "2020-08-01"
    val sep1 = "2020-09-01"
    val oct1 = "2020-10-01"

    lateinit var effectiveDate: LocalDate

    var assignmentDateHandler = AssignmentDateHandler()

    @Test
    fun `findUniqueDates should return a unique date when one assignment supplied`() {
        effectiveDate = LocalDate.parse(jun1)
        val assignmentList: List<AssignmentV1> = listOf(AssignmentV1(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate))

        val expectedDateList: List<LocalDate> = listOf(effectiveDate)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should return a unique date when two assignments with the same date are supplied`() {
        effectiveDate = LocalDate.parse(jun1)
        val assignmentList: List<AssignmentV1> = listOf(
                AssignmentV1(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate),
                AssignmentV1(person = person, spaceUuid = "space", productId = 2, effectiveDate = effectiveDate)
        )

        val expectedDateList: List<LocalDate> = listOf(effectiveDate)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should return two unique dates when two assignments with different dates are supplied`() {
        val effectiveDate1 = LocalDate.parse(jun1)
        val effectiveDate2 = LocalDate.parse(jul1)
        val assignmentList: List<AssignmentV1> = listOf(
                AssignmentV1(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate1),
                AssignmentV1(person = person, spaceUuid = "space", productId = 2, effectiveDate = effectiveDate2)
        )

        val expectedDateList: List<LocalDate> = listOf(effectiveDate1, effectiveDate2)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should return two unique dates when three assignments with two different dates are supplied`() {
        val effectiveDate1 = LocalDate.parse(jun1)
        val effectiveDate2 = LocalDate.parse(jul1)
        val effectiveDate3 = LocalDate.parse(jul1)
        val assignmentList: List<AssignmentV1> = listOf(
                AssignmentV1(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate1),
                AssignmentV1(person = person, spaceUuid = "space", productId = 2, effectiveDate = effectiveDate2),
                AssignmentV1(person = person, spaceUuid = "space", productId = 3, effectiveDate = effectiveDate3)
        )

        val expectedDateList: List<LocalDate> = listOf(effectiveDate1, effectiveDate2)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should handle assignments with empty effective dates by giving them today's date`() {
        val assignmentList: List<AssignmentV1> = listOf(
                AssignmentV1(person = person, spaceUuid = "space", productId = 1)
        )

        val expectedDateList: List<LocalDate> = listOf(LocalDate.now())

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should return the dates in the order they were sent`() {
        val effectiveDate1 = LocalDate.parse(jun1)
        val effectiveDate2 = LocalDate.parse(oct1)
        val effectiveDate3 = LocalDate.parse(jul1)
        val effectiveDate4 = LocalDate.parse(sep1)
        val effectiveDate5 = LocalDate.parse(jul1)
        val effectiveDate6 = LocalDate.parse(aug1)
        val assignmentList: List<AssignmentV1> = listOf(
                AssignmentV1(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate1),
                AssignmentV1(person = person, spaceUuid = "space", productId = 2, effectiveDate = effectiveDate2),
                AssignmentV1(person = person, spaceUuid = "space", productId = 3, effectiveDate = effectiveDate3),
                AssignmentV1(person = person, spaceUuid = "space", productId = 4, effectiveDate = effectiveDate4),
                AssignmentV1(person = person, spaceUuid = "space", productId = 5, effectiveDate = effectiveDate5),
                AssignmentV1(person = person, spaceUuid = "space", productId = 6, effectiveDate = effectiveDate6)
        )

        val expectedDateList: List<LocalDate> = listOf(
                effectiveDate1, effectiveDate2, effectiveDate3,
                effectiveDate4, effectiveDate6)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findStartDate should return the last date in uniqueDatesForAllAssignments list as a default`() {
        val uniqueDatesForAssignment: List<LocalDate> = listOf(LocalDate.parse(jul1))
        val uniqueDatesForAllAssignment: List<LocalDate> = listOf(LocalDate.parse(jul1))

        val expected: LocalDate = LocalDate.parse(jul1)

        val actual = assignmentDateHandler.findStartDate(uniqueDatesForAssignment, uniqueDatesForAllAssignment)

        assertThat(actual).isEqualTo(expected)

    }

    @Test
    fun `findStartDate should return the oldest of two dates in uniqueDatesForAllAssignments list when both lists are equal`() {
        val uniqueDatesForAssignment: List<LocalDate> = listOf(LocalDate.parse(jun1), LocalDate.parse(jul1))
        val uniqueDatesForAllAssignment: List<LocalDate> = listOf(LocalDate.parse(jun1), LocalDate.parse(jul1))

        val expected: LocalDate = LocalDate.parse(jun1)

        val actual = assignmentDateHandler.findStartDate(uniqueDatesForAssignment, uniqueDatesForAllAssignment)

        assertThat(actual).isEqualTo(expected)
    }

    @Test
    fun `findStartDate should return newest of 2 dates when lists are not equal`() {
        val uniqueDatesForAssignment: List<LocalDate> = listOf(LocalDate.parse(jul1))
        val uniqueDatesForAllAssignment: List<LocalDate> = listOf(LocalDate.parse(jun1), LocalDate.parse(jul1))

        val expected: LocalDate = LocalDate.parse(jul1)

        val actual = assignmentDateHandler.findStartDate(uniqueDatesForAssignment, uniqueDatesForAllAssignment)

        assertThat(actual).isEqualTo(expected)
    }

    @Test
    fun `findStartDate should return first non missing date`() {
        val uniqueDatesForAssignment: List<LocalDate> = listOf(LocalDate.parse(sep1), LocalDate.parse(aug1))
        val uniqueDatesForAllAssignment: List<LocalDate> = listOf(LocalDate.parse(sep1), LocalDate.parse(jul1), LocalDate.parse(aug1))

        val expected: LocalDate = LocalDate.parse(aug1)

        val actual = assignmentDateHandler.findStartDate(uniqueDatesForAssignment, uniqueDatesForAllAssignment)

        assertThat(actual).isEqualTo(expected)
    }
}
