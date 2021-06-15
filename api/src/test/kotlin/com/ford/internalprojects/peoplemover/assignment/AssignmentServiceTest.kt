package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.product.ProductRepository
import io.mockk.MockKAnnotations
import io.mockk.impl.annotations.MockK
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test

import java.time.LocalDate


class AssignmentServiceTest {
    @MockK
    lateinit var assignmentRepository: AssignmentRepository

    @MockK
    lateinit var personRepository: PersonRepository

    @MockK
    lateinit var productRepository: ProductRepository

    private lateinit var assignmentService: AssignmentService

    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        assignmentService = AssignmentService(assignmentRepository, personRepository, productRepository)
    }

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
}
