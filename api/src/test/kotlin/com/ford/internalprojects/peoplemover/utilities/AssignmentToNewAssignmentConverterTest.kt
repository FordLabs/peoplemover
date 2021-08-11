package com.ford.internalprojects.peoplemover.utilities

import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.assignment.NewAssignment
import com.ford.internalprojects.peoplemover.person.Person
import org.junit.Test
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat


internal class AssignmentToNewAssignmentConverterTest {

    @Test
    fun `can convert one old assignment to new one with no end date`() {
        var testPerson = Person(name = "Bugs Bunny", spaceUuid = "Outer Space")
        val juneAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))

        var expectedNewAssignment = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate=null)

        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(juneAssignment));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedNewAssignment));
    }

    @Test
    fun `can merge two old assignments to the same product that are contiguous`() {
        var testPerson = Person(name = "Bugs Bunny", spaceUuid = "Outer Space")
        val juneAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val julyAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))

        var expectedNewAssignment = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate=null)

        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(juneAssignment, julyAssignment));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedNewAssignment));
    }



    @Test
    fun `can merge two old assignments to the same product that are contiguous when there's one that isn't the same product`() {
        var testPerson = Person(name = "Bugs Bunny", spaceUuid = "Outer Space")
        val juneAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val assignment4 = Assignment(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-12"))
        val julyAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))
//        val assignment3 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-12"))
//        val assignment5 = Assignment(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))

        var expectedJunAssignment = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate=LocalDate.parse("2021-06-12"))
        var expectedInBetweenAssignment = NewAssignment(person = testPerson, productId = 2, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-12"), endDate=LocalDate.parse("2021-07-06"))
        var expectedJulAssignment = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-06"), endDate=null)

        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(juneAssignment, julyAssignment, assignment4));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedJunAssignment, expectedInBetweenAssignment, expectedJulAssignment));
    }
}