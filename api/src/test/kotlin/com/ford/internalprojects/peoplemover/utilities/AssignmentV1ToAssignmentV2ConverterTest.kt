package com.ford.internalprojects.peoplemover.utilities

import com.ford.internalprojects.peoplemover.assignment.*
import com.ford.internalprojects.peoplemover.person.Person
import org.junit.Test
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat

internal class AssignmentV1ToAssignmentV2ConverterTest {

    @Test
    fun `can convert one old assignment to new one with no end date`() {
        val testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))

        val expectedNewAssignment = AssignmentV2(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate=null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(juneAssignment))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedNewAssignment))
    }

    @Test
    fun `can merge two old assignments to the same product that are contiguous`() {
        val testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val julyAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))

        val expectedNewAssignment = AssignmentV2(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate=null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(juneAssignment, julyAssignment))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedNewAssignment))
    }

    @Test
    fun `can merge two old assignments to the same product that are contiguous when there's one that isn't the same product`() {
        val testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val assignment4 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-12"))
        val julyAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))

        val expectedJunAssignment = AssignmentV2(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate=LocalDate.parse("2021-06-12"))
        val expectedInBetweenAssignment = AssignmentV2(person = testPerson, productId = 2, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-12"), endDate=LocalDate.parse("2021-07-06"))
        val expectedJulAssignment = AssignmentV2(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-06"), endDate=null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(juneAssignment, julyAssignment, assignment4))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedJunAssignment, expectedInBetweenAssignment, expectedJulAssignment))
    }

    @Test
    fun `can merge  with multiple concomitant assignments` () {
        val testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val prod1assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val prod1assignment2 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod2assignment1 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod1assignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod2assignment2 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod2assignment3 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod3assignment1 = AssignmentV1(person = testPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod3assignment2 = AssignmentV1(person = testPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-16"))
        val prod3assignment3 = AssignmentV1(person = testPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-26"))
        val prod4assignment1 = AssignmentV1(person = testPerson, productId = 4, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))

        val expectedProd1 = AssignmentV2(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate= LocalDate.parse("2021-07-06"))
        val expectedProd2 = AssignmentV2(person = testPerson, productId = 2, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-16"), endDate= LocalDate.parse("2021-07-16"))
        val expectedProd3 = AssignmentV2(person = testPerson, productId = 3, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-06"), endDate= LocalDate.parse("2021-07-30"))
        val expectedProd4 = AssignmentV2(person = testPerson, productId = 4, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(prod1assignment1, prod1assignment2, prod2assignment1,prod1assignment3,prod2assignment2,prod2assignment3,prod3assignment1,prod3assignment2,prod3assignment3,prod4assignment1 ))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1, expectedProd2, expectedProd3,expectedProd4))
    }

    @Test
    fun `non-contiguous assignments to one project` () {
        val testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val prod1assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val prod1assignment2 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod1assignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod3assignment1 = AssignmentV1(person = testPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod4assignment1 = AssignmentV1(person = testPerson, productId = 4, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))
        val prod1assignment4 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))

        val expectedProd1 = AssignmentV2(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate= LocalDate.parse("2021-07-06"))
        val expectedProd3 = AssignmentV2(person = testPerson, productId = 3, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-06"), endDate= LocalDate.parse("2021-07-30"))
        val expectedProd4 = AssignmentV2(person = testPerson, productId = 4, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)
        val expectedProd1Again = AssignmentV2(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(prod1assignment1, prod1assignment2,prod1assignment3,prod3assignment1,prod4assignment1,prod1assignment4))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1,expectedProd3,expectedProd4,expectedProd1Again))
    }

    @Test
    fun `can distinguish between assignments of two different people` () {
        val testPerson = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val notTheTestPerson = Person(id = 2, name = "Roger Rabbit", spaceUuid = "Outer Space")
        val prod1assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val prod1assignment2 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod1assignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod3assignment1 = AssignmentV1(person = notTheTestPerson, productId = 3, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod4assignment1 = AssignmentV1(person = testPerson, productId = 4, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-28"))
        val prod1assignment4 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))

        val expectedProd1 = AssignmentV2(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate= LocalDate.parse("2021-07-28"))
        val expectedProd3 = AssignmentV2(person = notTheTestPerson, productId = 3, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-06"), endDate= null)
        val expectedProd4 = AssignmentV2(person = testPerson, productId = 4, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-28"), endDate= LocalDate.parse("2021-07-30"))
        val expectedProd1Again = AssignmentV2(person = testPerson, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(prod1assignment1, prod1assignment2,prod1assignment3,prod3assignment1,prod4assignment1,prod1assignment4))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1,expectedProd3,expectedProd4,expectedProd1Again))
    }

    @Test
    fun `can distinguish between assignments in two different spaces` () {
        val testPerson1 = Person(id = 1, name = "Bugs Bunny", spaceUuid = "Outer Space")
        val testPerson2 = Person(id = 2, name = "Bugs Bunny", spaceUuid = "Inner Space")
        val prod1assignment1 = AssignmentV1(person = testPerson1, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val prod1assignment2 = AssignmentV1(person = testPerson1, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-16"))
        val prod1assignment3 = AssignmentV1(person = testPerson1, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-06-26"))
        val prod3assignment1 = AssignmentV1(person = testPerson2, productId = 3, spaceUuid = "Inner Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val prod4assignment1 = AssignmentV1(person = testPerson1, productId = 4, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-28"))
        val prod1assignment4 = AssignmentV1(person = testPerson1, productId = 1, spaceUuid = "Outer Space", effectiveDate = LocalDate.parse("2021-07-30"))

        val expectedProd1 = AssignmentV2(person = testPerson1, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-06-06"), endDate= LocalDate.parse("2021-07-28"))
        val expectedProd3 = AssignmentV2(person = testPerson2, productId = 3, spaceUuid = "Inner Space", startDate = LocalDate.parse("2021-07-06"), endDate= null)
        val expectedProd4 = AssignmentV2(person = testPerson1, productId = 4, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-28"), endDate= LocalDate.parse("2021-07-30"))
        val expectedProd1Again = AssignmentV2(person = testPerson1, productId = 1, spaceUuid = "Outer Space", startDate = LocalDate.parse("2021-07-30"), endDate= null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(prod1assignment1, prod1assignment2,prod1assignment3,prod3assignment1,prod4assignment1,prod1assignment4))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1,expectedProd3,expectedProd4,expectedProd1Again))
    }

    @Test
    fun `can put one new assignment onto an existing set` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = "Bugs Bunny", spaceUuid = spaceUuid)
        val testPerson2 = Person(id = 2, name = "Bugs Bunny", spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = null)
        val assignment2 = AssignmentV2(person=testPerson2, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = null)
        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1,
                assignment2
        )
        val expectedAssignment2 = AssignmentV2(person=testPerson2, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = LocalDate.parse("2275-01-03"))
        val expectedAssignment3 = AssignmentV2(person=testPerson2, productId = 3, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-03"), endDate = null)

        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(ProductPlaceholderPair(3,false)));
        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson2, preExistingAssignments)

        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(assignment1, expectedAssignment2, expectedAssignment3))
    }

    @Test
    fun `can put several new assignments onto an existing set` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = "Al Capone", spaceUuid = spaceUuid)
        val testPerson2 = Person(id = 2, name = "John Dillinger", spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = null)
        val assignment2 = AssignmentV2(person=testPerson2, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = null)
        val assignment3 = AssignmentV2(person=testPerson2, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = null)
        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1,
                assignment2,
                assignment3
        )
        val expectedAssignment2 = AssignmentV2(person=testPerson2, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = null)
        val expectedAssignment3 = AssignmentV2(person=testPerson2, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = LocalDate.parse("2275-01-03"))
        val expectedAssignment4 = AssignmentV2(person=testPerson2, productId = 3, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-03"), endDate = null)

        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(
                ProductPlaceholderPair(1,false),
                ProductPlaceholderPair(3,false)
        ));
        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson2, preExistingAssignments)

        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(assignment1, expectedAssignment2, expectedAssignment3, expectedAssignment4))
    }

    @Test
    fun `an assignment that is before any of their current assignments is created appropriately` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = "Luke Skywalker", spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = null)
        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1
        )
        val expectedAssignment1 = AssignmentV2(person=testPerson1, productId = 0, spaceUuid = spaceUuid, startDate = LocalDate.parse("2274-01-01"), endDate = LocalDate.parse("2275-01-01"))
        val expectedAssignment2 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-01"), endDate = null)

        val toPut = CreateAssignmentsRequest(LocalDate.parse("2274-01-01"), setOf(
                ProductPlaceholderPair(0,false)
        ));

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(expectedAssignment1, expectedAssignment2))
    }
}
