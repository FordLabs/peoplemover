package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test

import java.time.LocalDate
import java.util.*


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

    @Test
    fun `calculateStartDatesForAssignments should return effectiveDate`() {
        var testPerson = Person(name = "Test Person", spaceUuid = "Test Space")
        val assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val assignment2 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-07"))
        val assignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-07"))
        val assignment4 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-07-07"))

        val expectedAssignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-07"), startDate = LocalDate.parse("2021-06-06"))
        val expectedAssignment2 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-07"), startDate = LocalDate.parse("2021-06-07"), endDate = LocalDate.parse("2021-07-06"))

        val allAssignmentsForPerson: List<AssignmentV1> = listOf(assignment1, assignment2, assignment3)
        val allFutureAssignmentsForPerson: List<AssignmentV1> = listOf(assignment4)
        val assignmentsToUpdate: List<AssignmentV1> = listOf(assignment2, assignment3)

        val expectedAssignments: List<AssignmentV1> = listOf(expectedAssignment1, expectedAssignment2)

        val localAssignmentService = AssignmentService(assignmentRepository, personRepository, productRepository, AssignmentDateHandler())
        val actual: List<AssignmentV1> = localAssignmentService.calculateStartAndEndDatesForAssignments(assignmentsToUpdate, allAssignmentsForPerson, allFutureAssignmentsForPerson)

        assertThat(actual).containsExactlyInAnyOrderElementsOf(expectedAssignments)
    }

    @Test
    fun `calculateStartDatesForAssignments should return oldest effectiveDate with multiple assignments`() {
        var testPerson = Person(name = "Test Person", spaceUuid = "Test Space")
        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val julyAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val augAssignment = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-08-06"))

        val allAssignmentsForPerson: List<AssignmentV1> = listOf(julyAssignment, juneAssignment)
        val allFutureAssignmentsForPerson: List<AssignmentV1> = listOf(augAssignment)
        val assignmentsToUpdate: List<AssignmentV1> = listOf(julyAssignment)

        val expectedAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-07-06"), startDate = LocalDate.parse("2021-06-06"), endDate = LocalDate.parse("2021-08-05"))
        val expectedAssignments: List<AssignmentV1> = listOf(expectedAssignment)

        val localAssignmentService = AssignmentService(assignmentRepository, personRepository, productRepository, AssignmentDateHandler())
        val actualAssignments: List<AssignmentV1> = localAssignmentService.calculateStartAndEndDatesForAssignments(assignmentsToUpdate, allAssignmentsForPerson, allFutureAssignmentsForPerson)

        assertThat(actualAssignments).containsExactlyInAnyOrderElementsOf(expectedAssignments)
    }

    @Test
    fun `calculateStartDatesForAssignments should call dependencies`() {
        var testPerson = Person(name = "Test Person", spaceUuid = "Test Space")

        var juneDate = LocalDate.parse("2021-06-06")
        var julyDate = LocalDate.parse("2021-07-06")

        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = juneDate)
        val julyAssignment = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = julyDate)

        val allAssignmentsForPerson: List<AssignmentV1> = listOf(julyAssignment, juneAssignment)
        val assignmentsToUpdate: List<AssignmentV1> = listOf(julyAssignment, juneAssignment)

        val pretendStartDate: LocalDate = LocalDate.parse("2020-01-01")

        val updatedAssignmentList: List<AssignmentV1> = listOf(
                AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = juneDate, startDate = pretendStartDate),
                AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = julyDate, startDate = pretendStartDate)
        )

        val dummyDates: List<LocalDate> = listOf(LocalDate.now())
        every { assignmentDateHandler.findUniqueDates(any()) } returns dummyDates
        every { assignmentDateHandler.findStartDate(any(), any()) } returns pretendStartDate
        every { assignmentDateHandler.findEndDate(any(), any()) } returns null

        val actual = assignmentService.calculateStartAndEndDatesForAssignments(assignmentsToUpdate,allAssignmentsForPerson, listOf<AssignmentV1>())

        verify(exactly = 6) { assignmentDateHandler.findUniqueDates(any()) }
        verify(exactly = 2) { assignmentDateHandler.findStartDate(any(), any()) }

        assertThat(actual).containsExactlyInAnyOrderElementsOf(updatedAssignmentList)
    }

    @Test
    fun `getAssignmentHistoryForPerson should return combined history, overlapping assignments, ignoring duplicates`() {
        var testPerson = Person(id = 1, name = "Test Person", spaceUuid = "Test Space")
        val assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val assignment2 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-07"))
        val assignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-07"))
        val assignment4 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-09"))
        val assignment5 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-09"))
        val assignment6 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-07-07"))

        val allAssignmentsForPerson: List<AssignmentV1> = listOf(assignment1, assignment2, assignment3, assignment4, assignment5, assignment6)

        val expectedAssignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = null, startDate = LocalDate.parse("2021-06-06"), endDate = null)
        val expectedAssignment2 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = "Test Space", effectiveDate = null, startDate = LocalDate.parse("2021-06-07"), endDate = LocalDate.parse("2021-07-06"))
        val expectedAssignments: List<AssignmentV1> = listOf(expectedAssignment1, expectedAssignment2)

        val localAssignmentService = AssignmentService(assignmentRepository, personRepository, productRepository, AssignmentDateHandler())
        val actual: List<AssignmentV1> = localAssignmentService.getAssignmentHistoryForPerson(testPerson, allAssignmentsForPerson)

        assertThat(actual).containsExactlyInAnyOrderElementsOf(expectedAssignments)
    }

    @Test
    fun `getAssignmentHistoryForPerson should return combined history, no overlapping assignments`() {
        var testPerson = Person(name = "Test Person", spaceUuid = "Test Space")
        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val julyAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-07-06"))
        val augAssignment = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-08-06"))

        val allAssignmentsForPerson: List<AssignmentV1> = listOf(julyAssignment, juneAssignment, augAssignment)

        val expectedAssignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = null, startDate = LocalDate.parse("2021-06-06"), endDate = LocalDate.parse("2021-08-05"))
        val expectedAssignment2 = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = null, startDate = LocalDate.parse("2021-08-06"), endDate = null)
        val expectedAssignments: List<AssignmentV1> = listOf(expectedAssignment1, expectedAssignment2)

        val localAssignmentService = AssignmentService(assignmentRepository, personRepository, productRepository, AssignmentDateHandler())
        val actualAssignments: List<AssignmentV1> = localAssignmentService.getAssignmentHistoryForPerson(testPerson, allAssignmentsForPerson)

        assertThat(actualAssignments).containsExactlyInAnyOrderElementsOf(expectedAssignments)
    }

    @Test
    fun `getAssignmentHistoryForPerson should return combined history, assignments separated in time, ignoring duplicates`() {
        var testPerson = Person(name = "Test Person", spaceUuid = "Test Space")
        val assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val assignment2 = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-13"))
        val assignment3 = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-14"))
        val assignment4 = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-15"))
        val assignment5 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-07-06"))

        val allAssignmentsForPerson: List<AssignmentV1> = listOf(assignment1, assignment2, assignment3, assignment4, assignment5)

        val expectedAssignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = null, startDate = LocalDate.parse("2021-06-06"), endDate = LocalDate.parse("2021-06-12"))
        val expectedAssignment2 = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = null, startDate = LocalDate.parse("2021-06-13"), endDate = LocalDate.parse("2021-07-05"))
        val expectedAssignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = null, startDate = LocalDate.parse("2021-07-06"), endDate = null)
        val expectedAssignments: List<AssignmentV1> = listOf(expectedAssignment1, expectedAssignment2, expectedAssignment3)

        val localAssignmentService = AssignmentService(assignmentRepository, personRepository, productRepository, AssignmentDateHandler())
        val actualAssignments: List<AssignmentV1> = localAssignmentService.getAssignmentHistoryForPerson(testPerson, allAssignmentsForPerson)

        assertThat(actualAssignments).containsExactlyInAnyOrderElementsOf(expectedAssignments)
    }

    @Test
    fun `getEffectiveDates should return a set of unique dates for a set of assignments`() {
        val testPerson = Person(id = 1, name = "Test Person", spaceUuid = "Test Space")
        val assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-06"))
        val assignment2 = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-13"))
        val assignment3 = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-14"))
        val assignment4 = AssignmentV1(person = testPerson, productId = 0, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-06-15"))
        val assignment5 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = "Test Space", effectiveDate = LocalDate.parse("2021-07-06"))

        every { personRepository.findAllBySpaceUuid(any()) } returns listOf(testPerson)
        every { assignmentRepository.getByPersonIdAndSpaceUuid(any(), any()) } returns listOf(assignment1, assignment2, assignment3, assignment4, assignment5)
        every { assignmentRepository.findAllBySpaceUuidAndEffectiveDate(any(), requestedDate = LocalDate.parse("2021-06-06")) } returns listOf(assignment1)
        every { assignmentRepository.findAllBySpaceUuidAndEffectiveDate(any(), requestedDate = LocalDate.parse("2021-06-13")) } returns listOf(assignment2)
        every { assignmentRepository.findAllBySpaceUuidAndEffectiveDate(any(), requestedDate = LocalDate.parse("2021-06-14")) } returns listOf(assignment3)
        every { assignmentRepository.findAllBySpaceUuidAndEffectiveDate(any(), requestedDate = LocalDate.parse("2021-06-15")) } returns listOf(assignment4)
        every { assignmentRepository.findAllBySpaceUuidAndEffectiveDate(any(), requestedDate = LocalDate.parse("2021-07-06")) } returns listOf(assignment5)
        every { assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(any(), effectiveDate = LocalDate.parse("2021-06-05")) } returns listOf()
        every { assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(any(), effectiveDate = LocalDate.parse("2021-06-12")) } returns listOf(assignment1)
        every { assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(any(), effectiveDate = LocalDate.parse("2021-06-13")) } returns listOf(assignment1, assignment2)
        every { assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(any(), effectiveDate = LocalDate.parse("2021-06-14")) } returns listOf(assignment1, assignment2, assignment3)
        every { assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(any(), effectiveDate = LocalDate.parse("2021-07-05")) } returns listOf(assignment1, assignment2, assignment3, assignment4)
        every { assignmentRepository.findAllByEffectiveDateIsNullAndPersonId(any()) } returns listOf()

        every { productRepository.findById(0) } returns Optional.of(Product(id=0, name="zero", spaceUuid = "Test Space"))
        every { productRepository.findById(1) } returns Optional.of(Product(id=1, name = "one", spaceUuid = "Test Space"))

        val dates1 = assignmentService.getEffectiveDates(testPerson.spaceUuid)
        val dates2 = assignmentService.getEffectiveDates2(testPerson.spaceUuid)

        assertThat(dates1).containsExactlyInAnyOrderElementsOf(dates2)
    }
}
