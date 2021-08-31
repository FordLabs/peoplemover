/*
 * Copyright (c) 2021 Ford Motor Company
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

import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityNotExistsException
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.person.exceptions.PersonNotExistsException
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class AssignmentService(
        private val assignmentRepository: AssignmentRepository,
        private val personRepository: PersonRepository,
        private val productRepository: ProductRepository,
        private val assignmentDateHandler: AssignmentDateHandler
) {
    fun getAssignmentsForTheGivenPersonIdAndDate(personId: Int, date: LocalDate): List<AssignmentV1> {
        val previousAndCurrentAssignmentsForPerson: List<AssignmentV1> = assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(personId, date)
        val futureAssignmentsForPerson: List<AssignmentV1> = assignmentRepository.findAllByPersonIdAndEffectiveDateGreaterThanOrderByEffectiveDateAsc(personId, date)
        val currentAssignments: List<AssignmentV1> = getAllAssignmentsForPersonOnDate(personId, previousAndCurrentAssignmentsForPerson)
        return calculateStartAndEndDatesForAssignments(currentAssignments, previousAndCurrentAssignmentsForPerson, futureAssignmentsForPerson)
    }

    fun getAssignmentsForSpace(spaceUuid: String) : List<AssignmentV1>{
        return assignmentRepository.findAllBySpaceUuid(spaceUuid);
    }

    fun getAssignmentsByDate(spaceUuid: String, requestedDate: LocalDate): List<AssignmentV1> {
        val people: List<Person> = personRepository.findAllBySpaceUuid(spaceUuid)
        val allAssignments: MutableList<AssignmentV1> = mutableListOf()
        people.forEach { person ->
            allAssignments.addAll(getAssignmentsForTheGivenPersonIdAndDate(person.id!!, requestedDate))
        }

        return allAssignments.toList()
    }

    fun calculateStartAndEndDatesForAssignments(assignments: List<AssignmentV1>, previousAndCurrentAssignmentsSorted: List<AssignmentV1>, futureAssignmentsSorted: List<AssignmentV1>): List<AssignmentV1> {
        val returnValue: MutableList<AssignmentV1> = mutableListOf()

        val allImportantPreviousAndCurrentDates = assignmentDateHandler.findUniqueDates(previousAndCurrentAssignmentsSorted)
        val allImportantFutureDates = assignmentDateHandler.findUniqueDates(futureAssignmentsSorted)
        assignments.forEach { assignment ->
            val importantPreviousAndCurrentDatesForProduct = assignmentDateHandler.findUniqueDates(previousAndCurrentAssignmentsSorted.filter{ all -> all.productId == assignment.productId})
            val importantFutureDatesForProduct = assignmentDateHandler.findUniqueDates(futureAssignmentsSorted.filter{ all -> all.productId == assignment.productId})
                returnValue.add(
                        AssignmentV1(
                                id = assignment.id,
                                placeholder = assignment.placeholder,
                                person = assignment.person,
                                effectiveDate = assignment.effectiveDate,
                                productId = assignment.productId,
                                spaceUuid = assignment.spaceUuid,
                                startDate = assignmentDateHandler.findStartDate(importantPreviousAndCurrentDatesForProduct, allImportantPreviousAndCurrentDates),
                                endDate = assignmentDateHandler.findEndDate(importantFutureDatesForProduct, allImportantFutureDates)
                        ))
        }
        return returnValue.toList()
    }

    fun getEffectiveDates(spaceUuid: String): Set<LocalDate> {
        val people: List<Person> = personRepository.findAllBySpaceUuid(spaceUuid)
        val allAssignments: MutableList<AssignmentV1> = mutableListOf()
        people.forEach { person ->
            val assignmentsForPerson: List<AssignmentV1> = assignmentRepository.getByPersonIdAndSpaceUuid(person.id!!, spaceUuid)
            allAssignments.addAll(assignmentsForPerson)
        }

        val uniqueEffectiveDates = allAssignments.mapNotNull { it.effectiveDate }.toSet()

        return uniqueEffectiveDates.filterNot { effectiveDate -> getReassignmentsByExactDate(spaceUuid, effectiveDate).isNullOrEmpty() }.toSet()
    }

    fun getEffectiveDates2(spaceUuid: String): Set<LocalDate> {
        val uniqueEffectiveDates = mutableSetOf<LocalDate>()
        val people: List<Person> = personRepository.findAllBySpaceUuid(spaceUuid)
        // Gather information person by person
        people.map { person ->
            val assignmentsForPerson: List<AssignmentV1> = assignmentRepository.getByPersonIdAndSpaceUuid(person.id!!, spaceUuid)
            val assignmentsByDate = mutableMapOf<LocalDate, MutableSet<Int>>()
            // Group a person's assignments by date
            assignmentsForPerson.map { assignment ->
                if(assignment.effectiveDate != null) {
                    if(assignmentsByDate.containsKey(assignment.effectiveDate)) {
                        assignmentsByDate[assignment.effectiveDate]!!.add(assignment.productId)
                    } else {
                        assignmentsByDate[assignment.effectiveDate] = mutableSetOf(assignment.productId)
                    }
                }
            }
            // Remember previous set of products for a particular date
            var previousSetOfProducts = mutableSetOf<Int>()
            // Sort the dates and iterate over them
            assignmentsByDate.toSortedMap().keys.map { date ->
                // Ignore dates we've already saved (from previous people)
                if(!uniqueEffectiveDates.contains(date)) {
                    // Ignore dates that have a set of products for this person that we've already seen (duplicates)
                    if(!assignmentsByDate[date]!!.containsAll(previousSetOfProducts)) {
                        // Haven't seen this before. Save the date, save the set of assignments
                        uniqueEffectiveDates.add(date)
                        previousSetOfProducts = assignmentsByDate[date]!!
                    }
                }
            }
        }
        return uniqueEffectiveDates.toSet()
    }

    fun getReassignmentsByExactDate(spaceUuid: String, requestedDate: LocalDate): List<Reassignment>? {
        val assignmentsWithExactDate = assignmentRepository.findAllBySpaceUuidAndEffectiveDate(spaceUuid = spaceUuid, requestedDate = requestedDate).sortedWith(compareByDescending { it.id })
        val assignmentsWithPreviousDate = getAssignmentsWithPreviousDate(assignmentsWithExactDate, requestedDate)

        return createReassignments(assignmentsWithExactDate, assignmentsWithPreviousDate)
    }

    fun createAssignmentFromCreateAssignmentsRequestForDate(assignmentRequest: CreateAssignmentsRequest, spaceUuid: String, personId: Int): Set<AssignmentV1> {
        val person = personRepository.findByIdAndSpaceUuid(personId, spaceUuid) ?: throw PersonNotExistsException()
        deleteAssignmentsForDate(assignmentRequest.requestedDate, person)
        return if (assignmentRequest.products.isNullOrEmpty() || requestOnlyContainsUnassigned(assignmentRequest, spaceUuid)) {
            setOf(createUnassignmentForDate(assignmentRequest.requestedDate, person))
        } else {
            createAssignmentsForDate(assignmentRequest, spaceUuid, person)
        }
    }

    fun changeProductStartDateForOneAssignment(assignment: AssignmentV1, updatedDate: LocalDate) {
        val currentAssignments = getAssignmentsForTheGivenPersonIdAndDate(assignment.person.id!!, updatedDate)
        val currentAssignmentIds = currentAssignments.map { it.id }.toSet()
        deleteOneAssignment(assignment)

        if (currentAssignmentIds.contains(assignment.id)) {
            val updatedAssignment = assignment.copy(id = null, effectiveDate = updatedDate)
            val allAssignments = assignmentRepository.findAllByPersonAndEffectiveDate(assignment.person, assignment.effectiveDate!!)
                    .map { it.copy(id = null, effectiveDate = updatedDate) }
                    .plus(updatedAssignment)
            assignmentRepository.saveAll(allAssignments)
        }
    }

    fun revertAssignmentsForDate(requestedDate: LocalDate, spaceUuid: String, personId: Int) {
        val person = personRepository.findByIdAndSpaceUuid(personId, spaceUuid) ?: throw PersonNotExistsException()
        deleteAssignmentsForDate(requestedDate, person)
        val existingAssignments = assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(person.id!!, requestedDate)
        if (existingAssignments.isNullOrEmpty()) {
            createUnassignmentForDate(requestedDate, person)
        }
    }

    fun deleteOneAssignment(assignmentToDelete: AssignmentV1) {
        assignmentRepository.deleteEntityAndUpdateSpaceLastModified(assignmentToDelete.id!!, assignmentToDelete.spaceUuid)
    }

    fun deleteAssignmentsForDate(requestedDate: LocalDate, person: Person) {
        personRepository.findByIdAndSpaceUuid(person.id!!, person.spaceUuid) ?: throw PersonNotExistsException()

        val assignments: List<AssignmentV1> = assignmentRepository.findAllByPersonAndEffectiveDate(
                person,
                requestedDate
        )
        assignments.forEach { deleteOneAssignment(it) }
    }

    private fun getAllAssignmentsForPersonOnDate(personId: Int, sortedAssignmentsForPerson: List<AssignmentV1>): List<AssignmentV1> {
        return if (sortedAssignmentsForPerson.isNotEmpty()) {
            val lastDate: LocalDate = sortedAssignmentsForPerson.last().effectiveDate!!
            sortedAssignmentsForPerson.filter { it.effectiveDate == lastDate }
        } else {
            assignmentRepository.findAllByEffectiveDateIsNullAndPersonId(personId)
        }
    }

    private fun getAssignmentsWithPreviousDate(assignmentsWithExactDate: List<AssignmentV1>, requestedLocalDate: LocalDate): List<AssignmentV1> {
        val personIdsWithExactDate = assignmentsWithExactDate.map { assignment -> assignment.person.id }.toSet()

        var assignmentsWithPreviousDate: MutableList<AssignmentV1> = mutableListOf()
        val previousRequestedLocalDate = requestedLocalDate.minusDays(1)
        personIdsWithExactDate.forEach { personId ->
            val assignmentsForPerson: List<AssignmentV1> =
                    assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(
                            personId = personId!!,
                            effectiveDate = previousRequestedLocalDate!!
                    )
            assignmentsWithPreviousDate.addAll(getAllAssignmentsForPersonOnDate(personId, assignmentsForPerson))
        }
        return assignmentsWithPreviousDate
    }

    private fun createReassignments(assignmentsWithExactDate: List<AssignmentV1>, assignmentsWithPreviousDate: List<AssignmentV1>): List<Reassignment> {
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
        }.filterNot {  reassignment ->  reassignment.toProductName == "unassigned" && reassignment.fromProductName.isNullOrEmpty() }
    }

    private fun requestOnlyContainsUnassigned(assignmentRequest: CreateAssignmentsRequest, spaceUuid: String): Boolean {
        val unassignedProduct: Product? = productRepository.findProductByNameAndSpaceUuid("unassigned", spaceUuid)
        return (assignmentRequest.products.size == 1 && assignmentRequest.products.first().productId == unassignedProduct!!.id)
    }

    private fun createUnassignmentForDate(requestedDate: LocalDate, person: Person): AssignmentV1 {
        val unassignedProduct: Product? = productRepository.findProductByNameAndSpaceUuid("unassigned", person.spaceUuid)
        return assignmentRepository.saveAndUpdateSpaceLastModified(
                AssignmentV1(
                        person = person,
                        placeholder = false,
                        productId = unassignedProduct!!.id!!,
                        effectiveDate = requestedDate,
                        spaceUuid = person.spaceUuid
                )
        )
    }

    private fun createAssignmentsForDate(assignmentRequest: CreateAssignmentsRequest, spaceUuid: String, person: Person): Set<AssignmentV1> {
        val createdAssignments = hashSetOf<AssignmentV1>()
        val unassignedProduct: Product? = productRepository.findProductByNameAndSpaceUuid("unassigned", spaceUuid)

        assignmentRequest.products.forEach { product ->
            productRepository.findByIdOrNull(product.productId) ?: throw EntityNotExistsException()

            if(product.productId != unassignedProduct!!.id) {
                val assignment = assignmentRepository.saveAndUpdateSpaceLastModified(
                        AssignmentV1(
                                person = person,
                                placeholder = product.placeholder,
                                productId = product.productId,
                                effectiveDate = assignmentRequest.requestedDate,
                                spaceUuid = spaceUuid
                        )
                )
                createdAssignments.add(assignment)
            }
        }
        return createdAssignments
    }

    private fun removeDuplicatePersonsAndProducts(assignmentsWithExactDate: List<AssignmentV1>, assignmentsWithPreviousDate: List<AssignmentV1>): Pair<List<AssignmentV1>, MutableList<AssignmentV1>> {
        var assignmentsWithExactDate1 = assignmentsWithExactDate
        var assignmentsWithPreviousDate1 = assignmentsWithPreviousDate
        val personIdProductIdPairsWithExactDate = assignmentsWithExactDate1.map { Pair(it.person.id, it.productId) }
        val personIdProductIdPairsForPreviousDate = assignmentsWithPreviousDate1.map { Pair(it.person.id, it.productId) }
        val commonPersonIdProductIdPairs = personIdProductIdPairsWithExactDate intersect personIdProductIdPairsForPreviousDate

        assignmentsWithExactDate1 = assignmentsWithExactDate1.filter { !commonPersonIdProductIdPairs.contains(Pair(it.person.id, it.productId)) }
        assignmentsWithPreviousDate1 = assignmentsWithPreviousDate1.filter { !commonPersonIdProductIdPairs.contains(Pair(it.person.id, it.productId)) }.toMutableList()
        return Pair(assignmentsWithExactDate1, assignmentsWithPreviousDate1)
    }

    private fun getUniqueSetOfPeopleFromAssignments(assignmentsWithExactDateWithoutDuplicates: List<AssignmentV1>, assignmentsWithPreviousDateWithoutDuplicates: MutableList<AssignmentV1>): MutableList<Person> {
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

    fun updateAssignment(assignmentToUpdate: AssignmentV1) {
        assignmentRepository.updateEntityAndUpdateSpaceLastModified(assignmentToUpdate)
    }
}
