/*
 * Copyright (c) 2019 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.assignment.exceptions.AssignmentAlreadyExistsException
import com.ford.internalprojects.peoplemover.assignment.exceptions.AssignmentNotExistsException
import com.ford.internalprojects.peoplemover.assignment.exceptions.InvalidDateFormatException
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.person.exceptions.PersonNotExistsException
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.product.exceptions.ProductNotExistsException
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeParseException
import javax.transaction.Transactional

@Service
class AssignmentService(
        private val assignmentRepository: AssignmentRepository,
        private val personRepository: PersonRepository,
        private val productRepository: ProductRepository,
        private val spaceRepository: SpaceRepository
) {
    fun deleteAssignmentIfPersonIsUnassigned(personId: Int, productIdForCreatedAssignment: Int) {
        val assignmentsForPerson: List<Assignment> = getAssignmentsForTheGivenPersonId(personId)
        assignmentsForPerson.forEach { assignment ->
            productRepository.findByIdOrNull(assignment.productId)
                    ?.let { product ->
                        val thisIsNotNewlyCreatedAssignment = product.id != productIdForCreatedAssignment
                        if (thisIsNotNewlyCreatedAssignment && product.name == "unassigned") {
                            deleteOneAssignment(assignment)
                        }
                    }
        }
    }

    @Throws(AssignmentNotExistsException::class, ProductNotExistsException::class)
    fun updateAssignment(assignmentToUpdate: Assignment) {
        assignmentRepository.findByIdOrNull(assignmentToUpdate.id!!) ?: throw AssignmentNotExistsException()
        productRepository.findByIdOrNull(assignmentToUpdate.productId) ?: throw ProductNotExistsException()

        assignmentRepository.saveAndUpdateSpaceLastModified(assignmentToUpdate)
    }

    fun updateAssignment(assignmentId: Int, assignmentRequest: AssignmentRequest): Assignment {
        val assignmentToBeUpdated: Assignment = assignmentRepository.findByIdOrNull(assignmentId)
                ?: throw AssignmentNotExistsException()
        assignmentToBeUpdated.placeholder = assignmentRequest.placeholder

        return assignmentRepository.saveAndUpdateSpaceLastModified(assignmentToBeUpdated)
    }

    fun updateAssignments(assignments: Set<Assignment>) {
        assignmentRepository.saveAll(assignments)
    }

    @Transactional
    fun deleteOneAssignment(assignmentToDelete: Assignment) {
        assignmentRepository.deleteAndUpdateSpaceLastModified(assignmentToDelete)
    }

    @Transactional
    fun deleteForProductId(productId: Int) {
        assignmentRepository.deleteByProductId(productId)
    }

    fun getAssignmentsForTheGivenPersonId(personId: Int): List<Assignment> {
        return assignmentRepository.getByPersonId(personId)
    }

    fun getAssignmentsForTheGivenPersonIdAndDate(personId: Int, date: LocalDate): List<Assignment> {
        val allAssignmentsBeforeOrOnDate = assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(personId, date)
        return getAllAssignmentsForPersonOnDate(personId, allAssignmentsBeforeOrOnDate)
    }

    fun deleteAllAssignments(personId: Int) {
        val assignments: List<Assignment> = getAssignmentsForTheGivenPersonId(personId)
        assignments.forEach { deleteOneAssignment(it) }
    }

    fun createAssignmentFromAssignmentRequest(assignmentRequest: AssignmentRequest): Assignment {
        val person: Person = getPersonIfValidAssignmentRequest(assignmentRequest)
        val assignment = Assignment(
                person = person,
                placeholder = assignmentRequest.placeholder,
                productId = assignmentRequest.productId,
                spaceId = person.spaceId
        )
        return createAssignment(assignment)
    }

    @Transactional
    fun createAssignment(assignment: Assignment): Assignment {
        val createdAssignment: Assignment = assignmentRepository.saveAndUpdateSpaceLastModified(assignment)
        deleteAssignmentIfPersonIsUnassigned(assignment.person.id!!, createdAssignment.productId)
        return createdAssignment
    }

    private fun getPersonIfValidAssignmentRequest(assignmentRequest: AssignmentRequest): Person {
        productRepository.findByIdOrNull(assignmentRequest.productId)
                ?: throw ProductNotExistsException()
        throwIfAssignmentAlreadyExists(assignmentRequest.productId, assignmentRequest.personId)
        return personRepository.findByIdOrNull(assignmentRequest.personId)
                ?: throw PersonNotExistsException()
    }

    @Throws(AssignmentAlreadyExistsException::class)
    private fun throwIfAssignmentAlreadyExists(productId: Int, personId: Int) {
        val assignmentAlreadyExists: Boolean = assignmentRepository.getByPersonId(personId)
                .any { assignment -> assignment.productId == productId }

        if (assignmentAlreadyExists) {
            throw AssignmentAlreadyExistsException()
        }
    }

    fun getAssignmentsByDate(spaceId: Int, requestedDate: String): List<Assignment> {
        spaceRepository.findByIdOrNull(spaceId) ?: throw SpaceNotExistsException()

        val requestedLocalDate = parseLocalDate(requestedDate)

        val people: List<Person> = personRepository.findAllBySpaceId(spaceId)
        val allAssignments: MutableList<Assignment> = mutableListOf()
        people.forEach { person ->
            val assignmentsForPerson: List<Assignment> = assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(person.id!!, requestedLocalDate)
            allAssignments.addAll(getAllAssignmentsForPersonOnDate(person.id, assignmentsForPerson))
        }

        return allAssignments
    }

    private fun getAllAssignmentsForPersonOnDate(personId: Int, sortedAssignmentsForPerson: List<Assignment>): List<Assignment> {
        return if (sortedAssignmentsForPerson.isNotEmpty()) {
            val lastDate: LocalDate = sortedAssignmentsForPerson.last().effectiveDate!!
            sortedAssignmentsForPerson.filter { it.effectiveDate == lastDate }
        } else {
            assignmentRepository.findAllByEffectiveDateIsNullAndPersonId(personId)
        }
    }

    private fun requestOnlyContainsUnassigned(assignmentRequest: CreateAssignmentsRequest): Boolean {
        val unassignedProduct: Product? = productRepository.findProductByNameAndSpaceId("unassigned", assignmentRequest.person.spaceId)
        return (assignmentRequest.products.size == 1 && assignmentRequest.products.first().productId == unassignedProduct!!.id)
    }

    fun createAssignmentFromCreateAssignmentsRequestForDate(assignmentRequest: CreateAssignmentsRequest): Set<Assignment> {
        deleteAllAssignmentsForDate(assignmentRequest)
        return if (assignmentRequest.products.isNullOrEmpty() || requestOnlyContainsUnassigned(assignmentRequest)) {
            setOf(createUnassignmentForDate(assignmentRequest))
        } else {
            createAssignmentsForDate(assignmentRequest)
        }
    }

    private fun createUnassignmentForDate(assignmentRequest: CreateAssignmentsRequest): Assignment {
        val unassignedProduct: Product? = productRepository.findProductByNameAndSpaceId("unassigned", assignmentRequest.person.spaceId)
        return assignmentRepository.save(
                Assignment(
                        person = assignmentRequest.person,
                        placeholder = false,
                        productId = unassignedProduct!!.id!!,
                        spaceId = assignmentRequest.person.spaceId,
                        effectiveDate = assignmentRequest.requestedDate
                )
        )
    }

    private fun createAssignmentsForDate(assignmentRequest: CreateAssignmentsRequest): Set<Assignment> {
        val space = spaceRepository.findByIdOrNull(assignmentRequest.person.spaceId) ?: throw SpaceNotExistsException()

        val createdAssignments = hashSetOf<Assignment>()
        val unassignedProduct: Product? = productRepository.findProductByNameAndSpaceId("unassigned", assignmentRequest.person.spaceId)

        assignmentRequest.products.forEach { product ->
            productRepository.findByIdOrNull(product.productId) ?: throw ProductNotExistsException()

            if(product.productId != unassignedProduct!!.id) {
                val assignment = assignmentRepository.save(
                        Assignment(
                                person = assignmentRequest.person,
                                placeholder = product.placeholder,
                                productId = product.productId,
                                spaceId = space.id!!,
                                effectiveDate = assignmentRequest.requestedDate
                        )
                )
                createdAssignments.add(assignment)
            }
        }
        return createdAssignments
    }

    private fun deleteAllAssignmentsForDate(assignmentRequest: CreateAssignmentsRequest) {
        personRepository.findByIdOrNull(assignmentRequest.person.id!!) ?: throw PersonNotExistsException()

        val assignments: List<Assignment> = assignmentRepository.findAllByPersonAndEffectiveDate(
                assignmentRequest.person,
                assignmentRequest.requestedDate
        )
        assignments.forEach { deleteOneAssignment(it) }
    }

    fun getEffectiveDates(spaceId: Int): Set<LocalDate> {
        spaceRepository.findByIdOrNull(spaceId) ?: throw SpaceNotExistsException()

        val people: List<Person> = personRepository.findAllBySpaceId(spaceId)
        val allAssignments: MutableList<Assignment> = mutableListOf()
        people.forEach { person ->
            val assignmentsForPerson: List<Assignment> = assignmentRepository.getByPersonId(person.id!!)
            allAssignments.addAll(assignmentsForPerson)
        }

        return allAssignments.mapNotNull { it.effectiveDate }.toSet()
    }

    fun getReassignmentsByExactDate(spaceId: Int, requestedDate: String): List<Reassignment>? {
        val requestedLocalDate = parseLocalDate(requestedDate)

        var assignmentsWithExactDate = assignmentRepository.findAllBySpaceIdAndEffectiveDate(spaceId = spaceId, requestedDate = requestedLocalDate)
        var assignmentsWithPreviousDate: MutableList<Assignment> = getAssignmentsWithPreviousDate(assignmentsWithExactDate, requestedLocalDate)

        return createReassignments(assignmentsWithExactDate, assignmentsWithPreviousDate)
    }

    private fun createReassignments(assignmentsWithExactDate: List<Assignment>, assignmentsWithPreviousDate: MutableList<Assignment>): List<Reassignment> {
        val pair = removeDuplicatePersonsAndProducts(assignmentsWithExactDate, assignmentsWithPreviousDate)
        val assignmentsWithExactDateWithoutDuplicates = pair.first
        val assignmentsWithPreviousDateWithoutDuplicates = pair.second

        val peopleFromAssignments: Set<Person> = getUniqueSetOfPeopleFromAssignments(assignmentsWithExactDateWithoutDuplicates, assignmentsWithPreviousDateWithoutDuplicates).toSet()

        return peopleFromAssignments.map { person ->
            val exactAssignmentsForPerson = assignmentsWithExactDateWithoutDuplicates.filter { assignment ->
                person.id === assignment.person.id
            }
            val previousAssignmentsForPerson = assignmentsWithPreviousDateWithoutDuplicates.filter { assignment ->
                person.id === assignment.person.id
            }

            val toProductName: String = exactAssignmentsForPerson.map { assignment ->  productRepository.findById(assignment.productId).get().name}.joinToString(" & ")
            val fromProductName: String = previousAssignmentsForPerson.map { assignment ->  productRepository.findById(assignment.productId).get().name}.joinToString(" & ")
            Reassignment(
                    person = person,
                    fromProductName = fromProductName,
                    toProductName = toProductName
            )
        }
    }

    private fun getUniqueSetOfPeopleFromAssignments(assignmentsWithExactDateWithoutDuplicates: List<Assignment>, assignmentsWithPreviousDateWithoutDuplicates: MutableList<Assignment>): MutableList<Person> {
        val peopleFromAssignments: MutableList<Person> = mutableListOf()
        peopleFromAssignments.addAll(
                assignmentsWithExactDateWithoutDuplicates.map { assignment ->
                    assignment.person
                }
        )
        peopleFromAssignments.addAll(
                assignmentsWithPreviousDateWithoutDuplicates.map { assignment ->
                    assignment.person
                }
        )
        return peopleFromAssignments
    }

    private fun removeDuplicatePersonsAndProducts(assignmentsWithExactDate: List<Assignment>, assignmentsWithPreviousDate: MutableList<Assignment>): Pair<List<Assignment>, MutableList<Assignment>> {
        var assignmentsWithExactDate1 = assignmentsWithExactDate
        var assignmentsWithPreviousDate1 = assignmentsWithPreviousDate
        val personIdProductIdPairsWithExactDate = assignmentsWithExactDate1.map { Pair(it.person.id, it.productId) }
        val personIdProductIdPairsForPreviousDate = assignmentsWithPreviousDate1.map { Pair(it.person.id, it.productId) }
        val commonPersonIdProductIdPairs = personIdProductIdPairsWithExactDate intersect personIdProductIdPairsForPreviousDate

        assignmentsWithExactDate1 = assignmentsWithExactDate1.filter { !commonPersonIdProductIdPairs.contains(Pair(it.person.id, it.productId)) }
        assignmentsWithPreviousDate1 = assignmentsWithPreviousDate1.filter { !commonPersonIdProductIdPairs.contains(Pair(it.person.id, it.productId)) }.toMutableList()
        return Pair(assignmentsWithExactDate1, assignmentsWithPreviousDate1)
    }

    private fun getAssignmentsWithPreviousDate(assignmentsWithExactDate: List<Assignment>, requestedLocalDate: LocalDate): MutableList<Assignment> {
        val personIdsWithExactDate = assignmentsWithExactDate.map { assignment -> assignment.person.id }.toSet()

        var assignmentsWithPreviousDate: MutableList<Assignment> = mutableListOf()
        val previousRequestedLocalDate = requestedLocalDate.minusDays(1)
        personIdsWithExactDate.forEach { personId ->
            val assignmentsForPerson: List<Assignment> =
                    assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(
                            personId = personId!!,
                            effectiveDate = previousRequestedLocalDate!!
                    )
            assignmentsWithPreviousDate.addAll(getAllAssignmentsForPersonOnDate(personId, assignmentsForPerson))
        }
        return assignmentsWithPreviousDate
    }

    private fun parseLocalDate(requestedDate: String): LocalDate {
        try {
            return LocalDate.parse(requestedDate)
        } catch (e: DateTimeParseException) {
            throw InvalidDateFormatException()
        }
    }
}