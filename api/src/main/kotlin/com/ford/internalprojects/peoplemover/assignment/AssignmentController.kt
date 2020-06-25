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

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
class AssignmentController(
        private val assignmentService: AssignmentService,
        private val logger: BasicLogger
) {
    @GetMapping("/api/person/{personId}/assignments/date/{requestedDate}")
    fun getAssignmentsByPersonIdForDate(@PathVariable personId: Int, @PathVariable requestedDate: String): ResponseEntity<List<Assignment>> {
        val assignmentsForPerson = assignmentService.getAssignmentsForTheGivenPersonIdAndDate(personId, LocalDate.parse(requestedDate))
        logger.logInfoMessage("All assignments retrieved for person with id: [$personId] on date: [$requestedDate].")
        return ResponseEntity.ok(assignmentsForPerson)
    }

    @GetMapping(path = ["/api/assignment/{spaceId}/{requestedDate}"])
    fun getAssignmentsByDate(@PathVariable spaceId: Int, @PathVariable requestedDate: String): ResponseEntity<List<Assignment>> {
        val assignmentsByDate = assignmentService.getAssignmentsByDate(spaceId, requestedDate)
        logger.logInfoMessage("All assignments retrieved for space with id: [$spaceId] on date: [$requestedDate].")
        return ResponseEntity.ok(assignmentsByDate)
    }

    @GetMapping(path = ["/api/assignment/dates/{spaceId}"])
    fun getAllEffectiveDates(@PathVariable spaceId: Int): ResponseEntity<Set<LocalDate>> {
        val dates = assignmentService.getEffectiveDates(spaceId)
        logger.logInfoMessage("All effective dates retrieved for space with id: [$spaceId].")
        return ResponseEntity.ok(dates)
    }

    @PostMapping(path = ["/api/assignment/create"])
    fun createAssignmentsForDate(@RequestBody createAssignmentRequest: CreateAssignmentsRequest): ResponseEntity<Set<Assignment>> {
        val assignmentsCreated: Set<Assignment> = assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(createAssignmentRequest)
        logger.logInfoMessage("[${assignmentsCreated.size}] assignment(s) created " +
                "for person with id: [${assignmentsCreated.first().person.id}] " +
                "with effective date: [${assignmentsCreated.first().effectiveDate}]")
        return ResponseEntity.ok(assignmentsCreated)
    }

    @DeleteMapping(path = ["/api/assignment/delete"])
    fun deleteAssignment(@RequestBody assigmentToDelete: Assignment): ResponseEntity<Unit> {
        assignmentService.deleteOneAssignment(assigmentToDelete)
        logger.logInfoMessage("assignment deleted " +
                "for person with id: [${assigmentToDelete.person.id}] " +
                "for product with id: [${assigmentToDelete.productId}] " +
                "with effective date: [${assigmentToDelete.effectiveDate}]")
        return ResponseEntity.ok().build()
    }

    @GetMapping(path = ["/api/reassignment/{spaceId}/{requestedDate}"])
    fun getReassignmentsByExactDate(@PathVariable spaceId: Int, @PathVariable requestedDate: String): ResponseEntity<List<Reassignment>> {
        val reassignmentsByExactDate = assignmentService.getReassignmentsByExactDate(spaceId, requestedDate)
        logger.logInfoMessage("All reassignments retrieved for space with id: [$spaceId] on date: [$requestedDate].")
        return ResponseEntity.ok(reassignmentsByExactDate)
    }
}