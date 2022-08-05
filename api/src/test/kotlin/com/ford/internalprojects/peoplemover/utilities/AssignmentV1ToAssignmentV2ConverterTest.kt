package com.ford.internalprojects.peoplemover.utilities

import com.ford.internalprojects.peoplemover.assignment.AssignmentV1
import com.ford.internalprojects.peoplemover.assignment.AssignmentV2
import com.ford.internalprojects.peoplemover.assignment.CreateAssignmentsRequest
import com.ford.internalprojects.peoplemover.assignment.ProductPlaceholderPair
import com.ford.internalprojects.peoplemover.person.Person
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.LocalDate

internal class AssignmentV1ToAssignmentV2ConverterTest {

    private val spaceName = "Bugs Bunny"
    private val spaceUuid = "Outer Space"
    private val personName = "Luke Skywalker"

    private val july6th2021 = LocalDate.parse("2021-07-06")
    private val july16th2021 = LocalDate.parse("2021-07-16")
    private val july30th2021 = LocalDate.parse("2021-07-30")
    private val july28th2028 =  LocalDate.parse("2021-07-28")
    private val june6th2016 = LocalDate.parse("2021-06-16")
    private val june6th2021 = LocalDate.parse("2021-06-06")
    private val june26th2026 = LocalDate.parse("2021-06-26")


    @Test
    fun `convert can convert one old assignment to new one with no end date`() {
        val testPerson = Person(id = 1, name = spaceName, spaceUuid = spaceUuid)
        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2021)

        val expectedNewAssignment = AssignmentV2(person = testPerson, productId = 1, spaceUuid = spaceUuid, startDate = june6th2021, endDate=null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(juneAssignment))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedNewAssignment))
    }

    @Test
    fun `convert can merge two old assignments to the same product that are contiguous`() {
        val testPerson = Person(id = 1, name = spaceName, spaceUuid = spaceUuid)
        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2021)
        val julyAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = july6th2021)

        val expectedNewAssignment = AssignmentV2(person = testPerson, productId = 1, spaceUuid = spaceUuid, startDate = june6th2021, endDate=null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(juneAssignment, julyAssignment))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedNewAssignment))
    }

    @Test
    fun `convert can merge two old assignments to the same product that are contiguous when there's one that isn't the same product`() {
        val testPerson = Person(id = 1, name = spaceName, spaceUuid = spaceUuid)
        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2021)
        val date = LocalDate.parse("2021-06-12");
        val assignment4 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = spaceUuid, effectiveDate = date)
        val julyAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = july6th2021)

        val expectedJunAssignment = AssignmentV2(person = testPerson, productId = 1, spaceUuid = spaceUuid, startDate = june6th2021, endDate= date)
        val expectedInBetweenAssignment = AssignmentV2(person = testPerson, productId = 2, spaceUuid = spaceUuid, startDate = date, endDate=july6th2021)
        val expectedJulAssignment = AssignmentV2(person = testPerson, productId = 1, spaceUuid = spaceUuid, startDate = july6th2021, endDate=null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(juneAssignment, julyAssignment, assignment4))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedJunAssignment, expectedInBetweenAssignment, expectedJulAssignment))
    }

    @Test
    fun `convert can merge with multiple concomitant assignments` () {
        val testPerson = Person(id = 1, name = spaceName, spaceUuid = spaceUuid)
        val prod1assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2021)
        val prod1assignment2 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2016)
        val prod2assignment1 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = spaceUuid, effectiveDate = june6th2016)
        val prod1assignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june26th2026)
        val prod2assignment2 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = spaceUuid, effectiveDate = june26th2026)
        val prod2assignment3 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = spaceUuid, effectiveDate = july6th2021)
        val prod3assignment1 = AssignmentV1(person = testPerson, productId = 3, spaceUuid = spaceUuid, effectiveDate = july6th2021)
        val prod3assignment2 = AssignmentV1(person = testPerson, productId = 3, spaceUuid = spaceUuid, effectiveDate = july16th2021)
        val prod3assignment3 = AssignmentV1(person = testPerson, productId = 3, spaceUuid = spaceUuid, effectiveDate = LocalDate.parse("2021-07-26"))
        val prod4assignment1 = AssignmentV1(person = testPerson, productId = 4, spaceUuid = spaceUuid, effectiveDate = july30th2021)

        val expectedProd1 = AssignmentV2(person = testPerson, productId = 1, spaceUuid = spaceUuid, startDate = june6th2021, endDate= july6th2021)
        val expectedProd2 = AssignmentV2(person = testPerson, productId = 2, spaceUuid = spaceUuid, startDate = june6th2016, endDate= july16th2021)
        val expectedProd3 = AssignmentV2(person = testPerson, productId = 3, spaceUuid = spaceUuid, startDate = july6th2021, endDate= july30th2021)
        val expectedProd4 = AssignmentV2(person = testPerson, productId = 4, spaceUuid = spaceUuid, startDate = july30th2021, endDate= null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(prod1assignment1, prod1assignment2, prod2assignment1,prod1assignment3,prod2assignment2,prod2assignment3,prod3assignment1,prod3assignment2,prod3assignment3,prod4assignment1 ))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1, expectedProd2, expectedProd3,expectedProd4))
    }

    @Test
    fun `convert can handle non-contiguous assignments to one project` () {
        val testPerson = Person(id = 1, name = spaceName, spaceUuid = spaceUuid)
        val prod1assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2021)
        val prod1assignment2 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2016)
        val prod1assignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june26th2026)
        val prod3assignment1 = AssignmentV1(person = testPerson, productId = 3, spaceUuid = spaceUuid, effectiveDate = july6th2021)
        val prod4assignment1 = AssignmentV1(person = testPerson, productId = 4, spaceUuid = spaceUuid, effectiveDate = july30th2021)
        val prod1assignment4 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = july30th2021)

        val expectedProd1 = AssignmentV2(person = testPerson, productId = 1, spaceUuid = spaceUuid, startDate = june6th2021, endDate= july6th2021)
        val expectedProd3 = AssignmentV2(person = testPerson, productId = 3, spaceUuid = spaceUuid, startDate = july6th2021, endDate= july30th2021)
        val expectedProd4 = AssignmentV2(person = testPerson, productId = 4, spaceUuid = spaceUuid, startDate = july30th2021, endDate= null)
        val expectedProd1Again = AssignmentV2(person = testPerson, productId = 1, spaceUuid = spaceUuid, startDate = july30th2021, endDate= null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(prod1assignment1, prod1assignment2,prod1assignment3,prod3assignment1,prod4assignment1,prod1assignment4))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1,expectedProd3,expectedProd4,expectedProd1Again))
    }

    @Test
    fun `convert can distinguish between assignments of two different people` () {
        val testPerson = Person(id = 1, name = spaceName, spaceUuid = spaceUuid)
        val notTheTestPerson = Person(id = 2, name = "Roger Rabbit", spaceUuid = spaceUuid)
        val prod1assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2021)
        val prod1assignment2 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2016)
        val prod1assignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = june26th2026)
        val prod3assignment1 = AssignmentV1(person = notTheTestPerson, productId = 3, spaceUuid = spaceUuid, effectiveDate = july6th2021)
        val prod4assignment1 = AssignmentV1(person = testPerson, productId = 4, spaceUuid = spaceUuid, effectiveDate = july28th2028)
        val prod1assignment4 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = spaceUuid, effectiveDate = july30th2021)

        val expectedProd1 = AssignmentV2(person = testPerson, productId = 1, spaceUuid = spaceUuid, startDate = june6th2021, endDate= july28th2028)
        val expectedProd3 = AssignmentV2(person = notTheTestPerson, productId = 3, spaceUuid = spaceUuid, startDate = july6th2021, endDate= null)
        val expectedProd4 = AssignmentV2(person = testPerson, productId = 4, spaceUuid = spaceUuid, startDate = july28th2028, endDate= july30th2021)
        val expectedProd1Again = AssignmentV2(person = testPerson, productId = 1, spaceUuid = spaceUuid, startDate = july30th2021, endDate= null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(prod1assignment1, prod1assignment2,prod1assignment3,prod3assignment1,prod4assignment1,prod1assignment4))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1,expectedProd3,expectedProd4,expectedProd1Again))
    }

    @Test
    fun `convert can distinguish between assignments in two different spaces` () {
        val space2Uuid = "Inner Space"
        val testPerson1 = Person(id = 1, name = spaceName, spaceUuid = spaceUuid)
        val testPerson2 = Person(id = 2, name = spaceName, spaceUuid = space2Uuid)
        val prod1assignment1 = AssignmentV1(person = testPerson1, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2021)
        val prod1assignment2 = AssignmentV1(person = testPerson1, productId = 1, spaceUuid = spaceUuid, effectiveDate = june6th2016)
        val prod1assignment3 = AssignmentV1(person = testPerson1, productId = 1, spaceUuid = spaceUuid, effectiveDate = june26th2026)
        val prod3assignment1 = AssignmentV1(person = testPerson2, productId = 3, spaceUuid = space2Uuid, effectiveDate = july6th2021)
        val prod4assignment1 = AssignmentV1(person = testPerson1, productId = 4, spaceUuid = spaceUuid, effectiveDate = july28th2028)
        val prod1assignment4 = AssignmentV1(person = testPerson1, productId = 1, spaceUuid = spaceUuid, effectiveDate = july30th2021)

        val expectedProd1 = AssignmentV2(person = testPerson1, productId = 1, spaceUuid = spaceUuid, startDate = june6th2021, endDate= july28th2028)
        val expectedProd3 = AssignmentV2(person = testPerson2, productId = 3, spaceUuid = space2Uuid, startDate = july6th2021, endDate= null)
        val expectedProd4 = AssignmentV2(person = testPerson1, productId = 4, spaceUuid = spaceUuid, startDate = july28th2028, endDate= july30th2021)
        val expectedProd1Again = AssignmentV2(person = testPerson1, productId = 1, spaceUuid = spaceUuid, startDate = july30th2021, endDate= null)

        val conversionResult : List<AssignmentV2> = AssignmentV1ToAssignmentV2Converter().convert(listOf(prod1assignment1, prod1assignment2,prod1assignment3,prod3assignment1,prod4assignment1,prod1assignment4))
        assertThat(conversionResult).containsExactlyInAnyOrderElementsOf(listOf(expectedProd1,expectedProd3,expectedProd4,expectedProd1Again))
    }

    @Test
    fun `put can add one new assignment onto an existing set` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = spaceName, spaceUuid = spaceUuid)
        val testPerson2 = Person(id = 2, name = spaceName, spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = null)
        val assignment2 = AssignmentV2(person=testPerson2, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = null)
        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1,
                assignment2
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(
                ProductPlaceholderPair(3,false)))
        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson2, preExistingAssignments)

        val expectedAssignment2 = AssignmentV2(person=testPerson2, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = LocalDate.parse("2275-01-03"))
        val expectedAssignment3 = AssignmentV2(person=testPerson2, productId = 3, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-03"), endDate = null)
        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(assignment1, expectedAssignment2, expectedAssignment3))
    }

    @Test
    fun `put can add several new assignments onto an existing set` () {
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
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(
                ProductPlaceholderPair(1,false),
                ProductPlaceholderPair(3,false)
        ))
        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson2, preExistingAssignments)

        val expectedAssignment2 = AssignmentV2(person=testPerson2, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = null)
        val expectedAssignment3 = AssignmentV2(person=testPerson2, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-02"), endDate = LocalDate.parse("2275-01-03"))
        val expectedAssignment4 = AssignmentV2(person=testPerson2, productId = 3, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-03"), endDate = null)
        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(assignment1, expectedAssignment2, expectedAssignment3, expectedAssignment4))
    }

    @Test
    fun `put can make an assignment that is before any of their current assignments is created appropriately` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = personName, spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = null)
        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2274-01-01"), setOf(
                ProductPlaceholderPair(0,false)
        ))

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        val expectedAssignment1 = AssignmentV2(person=testPerson1, productId = 0, spaceUuid = spaceUuid, startDate = LocalDate.parse("2274-01-01"), endDate = LocalDate.parse("2275-01-01"))
        val expectedAssignment2 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-01"), endDate = null)
        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(expectedAssignment1, expectedAssignment2))
    }

    @Test
    fun `put can merge two assignments because of an incoming assignment` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = personName, spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-02"))
        val assignment3 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-04"), endDate = LocalDate.parse("2275-01-05"))
        val assignmentToAnotherProduct = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-10"))

        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1,assignment3,assignmentToAnotherProduct
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(
                ProductPlaceholderPair(1,false)
        ))

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        val expectedAssignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-05"))
        val expectedAssignmentToAnotherProduct = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-03"))
        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(expectedAssignment1, expectedAssignmentToAnotherProduct))
    }

    @Test
    fun `put can merge two assignments separated by any length of time because of an incoming assignment` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = personName, spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-02"))
        val assignment3 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-14"), endDate = LocalDate.parse("2275-01-15"))
        val assignmentToAnotherProduct = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-10"))

        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1,assignment3,assignmentToAnotherProduct
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(
                ProductPlaceholderPair(1,false),
                ProductPlaceholderPair(2,false)
        ))

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        val expectedAssignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-15"))
        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(expectedAssignment1, assignmentToAnotherProduct))
    }

    @Test
    fun `put can unassign by omitting a product from the request` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = personName, spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-02"))
        val assignment3 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-14"), endDate = LocalDate.parse("2275-01-15"))
        val assignmentToProduct2 = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-10"))

        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1,assignment3,assignmentToProduct2
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(
                ProductPlaceholderPair(1,false)
        ))

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        val expectedAssignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-15"))
        val expectedAssignmentToProduct2 = AssignmentV2(person=testPerson1, productId=2, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-03"))

        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(expectedAssignment1, expectedAssignmentToProduct2))
    }

    @Test
    fun `put does not transform input` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = "Darth Vader", spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-02"))
        val assignment3 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-14"), endDate = LocalDate.parse("2275-01-15"))
        val assignmentToProduct2 = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-10"))

        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1,assignment3,assignmentToProduct2
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(
                ProductPlaceholderPair(1,false)
        ))

        AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        assertThat(assignmentToProduct2).isEqualTo( AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-10")))
    }

    @Test
    fun `put can merge with a later assignment` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = personName, spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-05"))
        val assignment2 = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-03"), endDate = LocalDate.parse("2275-01-05"))
        val assignment3 = AssignmentV2(person=testPerson1, productId = 3, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-04"))

        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1,assignment2,assignment3
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-02"), setOf(
                ProductPlaceholderPair(1,false),
                ProductPlaceholderPair(2,false),
                ProductPlaceholderPair(3,false)
        ))

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        val expectedMergedAssignment = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-02"), endDate = LocalDate.parse("2275-01-05"))
        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(assignment1, expectedMergedAssignment, assignment3))
    }

    @Test
    fun `put can insert a set of assignments, skipping and merging as necessary` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = "Han Solo", spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-10"))
        val assignment2a = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-02"))
        val assignment2b = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-06"), endDate = LocalDate.parse("2275-01-10"))
        val assignment3 = AssignmentV2(person=testPerson1, productId = 3, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-04"))

        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1, assignment2a, assignment2b,assignment3
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-04"), setOf(
                ProductPlaceholderPair(1,false),
                ProductPlaceholderPair(2,false),
                ProductPlaceholderPair(3,false)
        ))

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        val expectedMergedAssignment = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-04"), endDate = LocalDate.parse("2275-01-10"))
        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(assignment1, assignment2a, expectedMergedAssignment, assignment3))
    }

    @Test
    fun `put can ignore assignment requests that cause no change to existing assignments` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = "Kylo Ren", spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-10"))
        val assignment2 = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-03"), endDate = LocalDate.parse("2275-01-10"))
        val assignment3 = AssignmentV2(person=testPerson1, productId = 3, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-03"))

        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1, assignment2,assignment3
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(
                ProductPlaceholderPair(1,false),
                ProductPlaceholderPair(2,false),
                ProductPlaceholderPair(3,false)
        ))

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(assignment1, assignment2, assignment3))
    }

    @Test
    fun `put can extend the start date of a product if it needs to start earlier` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = "BB8", spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person=testPerson1, productId = 1, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-10"))
        val assignment2 = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-10"))
        val assignment3 = AssignmentV2(person=testPerson1, productId = 3, spaceUuid = spaceUuid, startDate=LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-02"))

        val preExistingAssignments : List<AssignmentV2> = listOf(
                assignment1, assignment2,assignment3
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2274-12-01"), setOf(
                ProductPlaceholderPair(2,false)
        ))

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        val expectedMergedAssignment = AssignmentV2(person=testPerson1, productId = 2, spaceUuid = spaceUuid, startDate = LocalDate.parse("2274-12-01"), endDate = LocalDate.parse("2275-01-10"))
        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(assignment1, expectedMergedAssignment, assignment3))
    }

    @Test
    fun `put can end an assignment and then start a new assignment` () {
        val spaceUuid = "doesntmatter"
        val testPerson1 = Person(id = 1, name = "C3PO", spaceUuid = spaceUuid)
        val assignment1 = AssignmentV2(person = testPerson1, productId = 1, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-01"), endDate = null)

        val preExistingAssignments: List<AssignmentV2> = listOf(
                assignment1
        )
        val toPut = CreateAssignmentsRequest(LocalDate.parse("2275-01-03"), setOf(
                ProductPlaceholderPair(2, false)
        ))

        val result = AssignmentV1ToAssignmentV2Converter().put(toPut, testPerson1, preExistingAssignments)

        val expectedAssignment1 = AssignmentV2(person = testPerson1, productId = 1, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-01"), endDate = LocalDate.parse("2275-01-03"))
        val expectedAssignment2 = AssignmentV2(person = testPerson1, productId = 2, spaceUuid = spaceUuid, startDate = LocalDate.parse("2275-01-03"), endDate = null)
        assertThat(result).containsExactlyInAnyOrderElementsOf(listOf(expectedAssignment1, expectedAssignment2))
    }
}
