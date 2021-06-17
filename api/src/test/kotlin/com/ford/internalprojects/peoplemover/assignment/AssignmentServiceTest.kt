package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.product.ProductRepository
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Ignore
import org.junit.Test

import java.time.LocalDate


class AssignmentServiceTest {
    @MockK
    lateinit var assignmentRepository: AssignmentRepository

    @MockK
    lateinit var personRepository: PersonRepository

    @MockK
    lateinit var productRepository: ProductRepository

    @MockK
    lateinit var assignmentDateHandler: AssignmentDateHandler

    private lateinit var assignmentService: AssignmentService

    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        assignmentService = AssignmentService(assignmentRepository, personRepository, productRepository, assignmentDateHandler)
    }

    @Ignore
    @Test
    fun startDateShouldBeEffectiveDate() {
        var testPerson = Person(name = "Test Person", spaceUuid = "Test Space")
        val assignment1 = Assignment(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val assignment2 = Assignment(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-07"))

        val expectedAssignment1 = Assignment(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-06"), startDate = LocalDate.parse("2021-06-06"))
        val expectedAssignment2 = Assignment(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-07"), startDate = LocalDate.parse("2021-06-07"))


        val allAssignmentsForPerson: List<Assignment> = listOf(assignment1, assignment2)
        val assignmentsToUpdate: List<Assignment> = listOf(assignment1, assignment2)

        val expectedAssignments: List<Assignment> = listOf(expectedAssignment1, expectedAssignment2)

        val actual: List<Assignment> = assignmentService.calculateStartDatesForAssignments(assignmentsToUpdate, allAssignmentsForPerson)

        assertThat(actual).isEqualTo(expectedAssignments)
    }

    @Test
    @Ignore
    fun startDateShouldBeOldestEffectiveDateWithMultipleAssignmentsInList() {
        var testPerson = Person(name = "Test Person", spaceUuid = "Test Space")
        val juneAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val julyAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-07-06"))

        val allAssignmentsForPerson: List<Assignment> = listOf(julyAssignment, juneAssignment)
        val assignmentsToUpdate: List<Assignment> = listOf(julyAssignment)

        val expectedAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-07-06"), startDate = LocalDate.parse("2021-06-06"))
        val expectedAssignments: List<Assignment> = listOf(expectedAssignment)

        val actualAssignments: List<Assignment> = assignmentService.calculateStartDatesForAssignments(assignmentsToUpdate, allAssignmentsForPerson)

        assertThat(actualAssignments).isEqualTo(expectedAssignments)
    }

    @Test
    fun newTest() {
        var testPerson = Person(name = "Test Person", spaceUuid = "Test Space")

        var juneDate = LocalDate.parse("2021-06-06")
        var julyDate = LocalDate.parse("2021-07-06")

        val juneAssignment = Assignment(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = juneDate)
        val julyAssignment = Assignment(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = julyDate)

        val allAssignmentsForPerson: List<Assignment> = listOf(julyAssignment, juneAssignment)
        val assignmentsToUpdate: List<Assignment> = listOf(julyAssignment, juneAssignment)

        val pretendStartDate: LocalDate = LocalDate.parse("2020-01-01")

        val updatedAssignmentList: List<Assignment> = listOf(
                Assignment(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = juneDate, startDate = pretendStartDate),
                Assignment(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = julyDate, startDate = pretendStartDate)
        )

        val dummyDates: List<LocalDate> = listOf(LocalDate.now())
        every { assignmentDateHandler.findUniqueDates(any()) } returns dummyDates
        every { assignmentDateHandler.findStartDate(any(), any()) } returns pretendStartDate

        val actual = assignmentService.calculateStartDatesForAssignments(assignmentsToUpdate,allAssignmentsForPerson)

        verify(exactly = 3) { assignmentDateHandler.findUniqueDates(any()) }
        verify(exactly = 2) { assignmentDateHandler.findStartDate(any(), any()) }

        assertThat(actual).containsExactlyInAnyOrderElementsOf(updatedAssignmentList)
    }
}
