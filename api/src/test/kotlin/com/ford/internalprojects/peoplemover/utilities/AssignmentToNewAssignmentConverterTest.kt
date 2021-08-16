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
        var testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val juneAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))

        var expectedNewAssignment = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate=null)

        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(juneAssignment));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedNewAssignment));
    }

    @Test
    fun `can merge two old assignments to the same product that are contiguous`() {
        var testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val juneAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val julyAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))

        var expectedNewAssignment = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate=null)

        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(juneAssignment, julyAssignment));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedNewAssignment));
    }



    @Test
    fun `can merge two old assignments to the same product that are contiguous when there's one that isn't the same product`() {
        var testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val juneAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val assignment4 = Assignment(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-12"))
        val julyAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))

        var expectedJunAssignment = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate=LocalDate.parse("2021-06-12"))
        var expectedInBetweenAssignment = NewAssignment(person = testPerson, productId = 2, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-12"), endDate=LocalDate.parse("2021-07-06"))
        var expectedJulAssignment = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-06"), endDate=null)

        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(juneAssignment, julyAssignment, assignment4));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedJunAssignment, expectedInBetweenAssignment, expectedJulAssignment));
    }


    @Test
    fun `can merge  with multiple concomitant assignments` () {
        var testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val prod1assignment1 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val prod1assignment2 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod2assignment1 = Assignment(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod1assignment3 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod2assignment2 = Assignment(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod2assignment3 = Assignment(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod3assignment1 = Assignment(person = testPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod3assignment2 = Assignment(person = testPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-16"))
        val prod3assignment3 = Assignment(person = testPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-26"))
        val prod4assignment1 = Assignment(person = testPerson, productId = 4, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))

        val expectedProd1 = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate= LocalDate.parse("2021-07-06"))
        val expectedProd2 = NewAssignment(person = testPerson, productId = 2, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-16"), endDate= LocalDate.parse("2021-07-16"))
        val expectedProd3 = NewAssignment(person = testPerson, productId = 3, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-06"), endDate= LocalDate.parse("2021-07-30"))
        val expectedProd4 = NewAssignment(person = testPerson, productId = 4, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)



        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(prod1assignment1, prod1assignment2, prod2assignment1,prod1assignment3,prod2assignment2,prod2assignment3,prod3assignment1,prod3assignment2,prod3assignment3,prod4assignment1 ));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1, expectedProd2, expectedProd3,expectedProd4));
    }

    @Test
    fun `non-contiguous assignments to one project` () {
        var testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val prod1assignment1 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val prod1assignment2 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod1assignment3 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod3assignment1 = Assignment(person = testPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod4assignment1 = Assignment(person = testPerson, productId = 4, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))
        val prod1assignment4 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))

        val expectedProd1 = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate= LocalDate.parse("2021-07-06"))
        val expectedProd3 = NewAssignment(person = testPerson, productId = 3, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-06"), endDate= LocalDate.parse("2021-07-30"))
        val expectedProd4 = NewAssignment(person = testPerson, productId = 4, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)
        val expectedProd1Again = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)

        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(prod1assignment1, prod1assignment2,prod1assignment3,prod3assignment1,prod4assignment1,prod1assignment4));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1,expectedProd3,expectedProd4,expectedProd1Again));
    }

    @Test
    fun `can distinguish between assignments of two different people` () {
        var testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        var notTheTestPerson = Person(id = 2, name = "Roger Rabbit", spaceUuid = "Outer Space")
        val prod1assignment1 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val prod1assignment2 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod1assignment3 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod3assignment1 = Assignment(person = notTheTestPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod4assignment1 = Assignment(person = testPerson, productId = 4, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-28"))
        val prod1assignment4 = Assignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))

        val expectedProd1 = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate= LocalDate.parse("2021-07-28"))
        val expectedProd3 = NewAssignment(person = notTheTestPerson, productId = 3, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-06"), endDate= null)
        val expectedProd4 = NewAssignment(person = testPerson, productId = 4, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-28"), endDate= LocalDate.parse("2021-07-30"))
        val expectedProd1Again = NewAssignment(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)

        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(prod1assignment1, prod1assignment2,prod1assignment3,prod3assignment1,prod4assignment1,prod1assignment4));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1,expectedProd3,expectedProd4,expectedProd1Again));
    }

    @Test
    fun `can distinguish between assignments in two different spaces` () {
        var testPerson1 = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        var testPerson2 = Person(id = 2, name = "Bugs Bunny", spaceUuid = "Inner Space")
        val prod1assignment1 = Assignment(person = testPerson1, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val prod1assignment2 = Assignment(person = testPerson1, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod1assignment3 = Assignment(person = testPerson1, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod3assignment1 = Assignment(person = testPerson2, productId = 3, spaceUuid = "Inner Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod4assignment1 = Assignment(person = testPerson1, productId = 4, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-28"))
        val prod1assignment4 = Assignment(person = testPerson1, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))

        val expectedProd1 = NewAssignment(person = testPerson1, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate= LocalDate.parse("2021-07-28"))
        val expectedProd3 = NewAssignment(person = testPerson2, productId = 3, spaceUuid = "Inner Space", startDate = LocalDate.parse("2021-07-06"), endDate= null)
        val expectedProd4 = NewAssignment(person = testPerson1, productId = 4, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-28"), endDate= LocalDate.parse("2021-07-30"))
        val expectedProd1Again = NewAssignment(person = testPerson1, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)

        val conversionResult : List<NewAssignment> = AssignmentToNewAssignmentConverter().convert(listOf(prod1assignment1, prod1assignment2,prod1assignment3,prod3assignment1,prod4assignment1,prod1assignment4));
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1,expectedProd3,expectedProd4,expectedProd1Again));
    }
}
