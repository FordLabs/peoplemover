package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.person.Person
import org.assertj.core.api.Assertions
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
        val assignmentList: List<Assignment> = listOf(Assignment(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate))

        val expectedDateList: List<LocalDate> = listOf(effectiveDate)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        Assertions.assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should return a unique date when two assignments with the same date are supplied`() {
        effectiveDate = LocalDate.parse(jun1)
        val assignmentList: List<Assignment> = listOf(
                Assignment(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate),
                Assignment(person = person, spaceUuid = "space", productId = 2, effectiveDate = effectiveDate)
        )

        val expectedDateList: List<LocalDate> = listOf(effectiveDate)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        Assertions.assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should return two unique dates when two assignments with different dates are supplied`() {
        val effectiveDate1 = LocalDate.parse(jun1)
        val effectiveDate2 = LocalDate.parse(jul1)
        val assignmentList: List<Assignment> = listOf(
                Assignment(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate1),
                Assignment(person = person, spaceUuid = "space", productId = 2, effectiveDate = effectiveDate2)
        )

        val expectedDateList: List<LocalDate> = listOf(effectiveDate1, effectiveDate2)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        Assertions.assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should return two unique dates when three assignments with two different dates are supplied`() {
        val effectiveDate1 = LocalDate.parse(jun1)
        val effectiveDate2 = LocalDate.parse(jul1)
        val effectiveDate3 = LocalDate.parse(jul1)
        val assignmentList: List<Assignment> = listOf(
                Assignment(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate1),
                Assignment(person = person, spaceUuid = "space", productId = 2, effectiveDate = effectiveDate2),
                Assignment(person = person, spaceUuid = "space", productId = 3, effectiveDate = effectiveDate3)
        )

        val expectedDateList: List<LocalDate> = listOf(effectiveDate1, effectiveDate2)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        Assertions.assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should handle assignments with empty effective dates by giving them today's date`() {
        val assignmentList: List<Assignment> = listOf(
                Assignment(person = person, spaceUuid = "space", productId = 1)
        )

        val expectedDateList: List<LocalDate> = listOf(LocalDate.now())

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        Assertions.assertThat(actualDateList).isEqualTo(expectedDateList)
    }

    @Test
    fun `findUniqueDates should return the dates in the order they were sent`() {
        val effectiveDate1 = LocalDate.parse(jun1)
        val effectiveDate2 = LocalDate.parse(oct1)
        val effectiveDate3 = LocalDate.parse(jul1)
        val effectiveDate4 = LocalDate.parse(sep1)
        val effectiveDate5 = LocalDate.parse(jul1)
        val effectiveDate6 = LocalDate.parse(aug1)
        val assignmentList: List<Assignment> = listOf(
                Assignment(person = person, spaceUuid = "space", productId = 1, effectiveDate = effectiveDate1),
                Assignment(person = person, spaceUuid = "space", productId = 2, effectiveDate = effectiveDate2),
                Assignment(person = person, spaceUuid = "space", productId = 3, effectiveDate = effectiveDate3),
                Assignment(person = person, spaceUuid = "space", productId = 4, effectiveDate = effectiveDate4),
                Assignment(person = person, spaceUuid = "space", productId = 5, effectiveDate = effectiveDate5),
                Assignment(person = person, spaceUuid = "space", productId = 6, effectiveDate = effectiveDate6)
        )

        val expectedDateList: List<LocalDate> = listOf(
                effectiveDate1, effectiveDate2, effectiveDate3,
                effectiveDate4, effectiveDate6)

        val actualDateList = assignmentDateHandler.findUniqueDates(assignmentList)

        Assertions.assertThat(actualDateList).isEqualTo(expectedDateList)
    }
}
