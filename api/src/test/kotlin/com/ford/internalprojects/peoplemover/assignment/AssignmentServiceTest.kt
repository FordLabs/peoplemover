package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.utilities.AssignmentV1ToAssignmentV2Converter
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

import java.time.LocalDate

@ExtendWith(MockKExtension::class)
class AssignmentServiceTest {
    @MockK
    lateinit var assignmentRepository: AssignmentRepository

    @MockK
    lateinit var personRepository: PersonRepository

    @MockK
    lateinit var productRepository: ProductRepository

    @MockK
    lateinit var assignmentDateHandler: AssignmentDateHandler

    private var assignmentConverter: AssignmentV1ToAssignmentV2Converter = AssignmentV1ToAssignmentV2Converter()

    private lateinit var assignmentService: AssignmentService

    private val testSpaceUuid = "Test Space"
    private val personName = "Test Person"
    private val juneAssignmentDate= LocalDate.parse("2021-06-06")
    private val juneAssignmentDate2= LocalDate.parse("2021-06-07")
    private val julyAssignmentDate = LocalDate.parse("2021-07-06")

    @BeforeEach
    fun setUp() {
        MockKAnnotations.init(this)
        assignmentService = AssignmentService(assignmentRepository, personRepository, productRepository, assignmentConverter, assignmentDateHandler)
    }

    @Test
    fun `calculateStartDatesForAssignments should return effectiveDate`() {
        val testPerson = Person(name = personName, spaceUuid = testSpaceUuid)
        val assignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = testSpaceUuid, effectiveDate = juneAssignmentDate)
        val assignment2 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = testSpaceUuid, effectiveDate = juneAssignmentDate2)
        val assignment3 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = testSpaceUuid, effectiveDate = juneAssignmentDate2)

        val expectedAssignment1 = AssignmentV1(person = testPerson, productId = 1, spaceUuid = testSpaceUuid, effectiveDate = juneAssignmentDate2, startDate = juneAssignmentDate)
        val expectedAssignment2 = AssignmentV1(person = testPerson, productId = 2, spaceUuid = testSpaceUuid, effectiveDate = juneAssignmentDate2, startDate = LocalDate.parse("2021-06-07"))

        val allAssignmentsForPerson: List<AssignmentV1> = listOf(assignment1, assignment2, assignment3)
        val assignmentsToUpdate: List<AssignmentV1> = listOf(assignment2, assignment3)

        val expectedAssignments: List<AssignmentV1> = listOf(expectedAssignment1, expectedAssignment2)

        val localAssignmentService = AssignmentService(assignmentRepository, personRepository, productRepository, assignmentConverter, AssignmentDateHandler())
        val actual: List<AssignmentV1> = localAssignmentService.calculateStartDatesForAssignments(assignmentsToUpdate, allAssignmentsForPerson)

        assertThat(actual).containsExactlyInAnyOrderElementsOf(expectedAssignments)
    }

    @Test
    fun `calculateStartDatesForAssignments should return oldest effectiveDate with multiple assignments`() {
        val testPerson = Person(name = personName, spaceUuid = testSpaceUuid)
        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = testSpaceUuid, effectiveDate = juneAssignmentDate)
        val julyAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = testSpaceUuid, effectiveDate = julyAssignmentDate)

        val allAssignmentsForPerson: List<AssignmentV1> = listOf(julyAssignment, juneAssignment)
        val assignmentsToUpdate: List<AssignmentV1> = listOf(julyAssignment)

        val expectedAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = testSpaceUuid, effectiveDate = julyAssignmentDate, startDate = juneAssignmentDate)
        val expectedAssignments: List<AssignmentV1> = listOf(expectedAssignment)

        val localAssignmentService = AssignmentService(assignmentRepository, personRepository, productRepository, assignmentConverter, AssignmentDateHandler())
        val actualAssignments: List<AssignmentV1> = localAssignmentService.calculateStartDatesForAssignments(assignmentsToUpdate, allAssignmentsForPerson)

        assertThat(actualAssignments).containsExactlyInAnyOrderElementsOf(expectedAssignments)
    }

    @Test
    fun `calculateStartDatesForAssignments should call dependencies`() {
        val testPerson = Person(name = personName, spaceUuid = testSpaceUuid)

        val juneAssignment = AssignmentV1(person = testPerson, productId = 1, spaceUuid = testSpaceUuid, effectiveDate = juneAssignmentDate)
        val julyAssignment = AssignmentV1(person = testPerson, productId = 2, spaceUuid = testSpaceUuid, effectiveDate = julyAssignmentDate)

        val allAssignmentsForPerson: List<AssignmentV1> = listOf(julyAssignment, juneAssignment)
        val assignmentsToUpdate: List<AssignmentV1> = listOf(julyAssignment, juneAssignment)

        val pretendStartDate: LocalDate = LocalDate.parse("2020-01-01")

        val updatedAssignmentList: List<AssignmentV1> = listOf(
                AssignmentV1(person = testPerson, productId = 1, spaceUuid = testSpaceUuid, effectiveDate = juneAssignmentDate, startDate = pretendStartDate),
                AssignmentV1(person = testPerson, productId = 2, spaceUuid = testSpaceUuid, effectiveDate = julyAssignmentDate, startDate = pretendStartDate)
        )

        val dummyDates: List<LocalDate> = listOf(LocalDate.now())
        every { assignmentDateHandler.findUniqueDates(any()) } returns dummyDates
        every { assignmentDateHandler.findStartDate(any(), any()) } returns pretendStartDate

        val actual = assignmentService.calculateStartDatesForAssignments(assignmentsToUpdate,allAssignmentsForPerson)

        verify(exactly = 3) { assignmentDateHandler.findUniqueDates(any()) }
        verify(exactly = 2) { assignmentDateHandler.findStartDate(any(), any()) }

        assertThat(actual).containsExactlyInAnyOrderElementsOf(updatedAssignmentList)
    }

    @Test
    fun `isUnassigned says 'yes' and does not throw exceptions if the person has 0 assignments`() {
        val date = LocalDate.now()
        val product = Product(100, "unassigned", testSpaceUuid)
        val testPerson = Person(id =  101, name = personName, spaceUuid = testSpaceUuid)
        every{productRepository.findProductByNameAndSpaceUuid("unassigned", testSpaceUuid)} returns product
        every{assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(101, date)} returns emptyList()
        every{assignmentRepository.findAllByEffectiveDateIsNullAndPersonId(101)} returns emptyList()
        val underTest = assignmentService.isUnassigned(testPerson, date)
        assertThat(underTest).isTrue()
    }
}
