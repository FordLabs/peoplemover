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
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
class AssignmentController(
        private val assignmentService: AssignmentService,
        private val logger: BasicLogger
) {
    @GetMapping(path = ["/api/person/{personId}/assignments"])
    fun getAssignmentsByPersonId(@PathVariable personId: Int): ResponseEntity<List<Assignment>> {
        val assignmentsForTheGivenPersonId = assignmentService.getAssignmentsForTheGivenPersonId(personId)
        logger.logInfoMessage("All assignments retrieved for person with id: [$personId].")
        return ResponseEntity.ok(assignmentsForTheGivenPersonId)
    }

    @GetMapping(path = ["/api/assignment/{spaceId}/{requestedDate}"])
    fun getAssignmentsByDate(@PathVariable spaceId: Int, @PathVariable requestedDate: String): ResponseEntity<Set<Assignment>> {
        val assignmentsByDate = assignmentService.getAssignmentsByDate(spaceId, requestedDate)
        logger.logInfoMessage("All assignments retrieved for space with id: [$spaceId] on date: [$requestedDate].")
        return ResponseEntity.ok(assignmentsByDate)
    }

    @PostMapping(path = ["/api/assignment/create"])
    fun createAssignmentsForDate(@RequestBody createAssignmentRequest: CreateAssignmentsRequest): ResponseEntity<Set<Assignment>> {
        val assignmentsCreated: Set<Assignment> = assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(createAssignmentRequest)
        logger.logInfoMessage("[${assignmentsCreated.size}] assignment(s) created " +
                "for person with id: [${assignmentsCreated.first().person.id}] " +
                "with effective date: [${assignmentsCreated.first().effectiveDate}]")
        return ResponseEntity.ok(assignmentsCreated)
    }

    @PostMapping("/api/assignment")
    fun createAssignment(@RequestBody assignmentRequest: AssignmentRequest): ResponseEntity<Assignment> {
        val assignmentCreated: Assignment = assignmentService.createAssignmentFromAssignmentRequest(assignmentRequest)
        logger.logInfoMessage("Assignment created with id: [${assignmentCreated.id}] " +
                "assigning person with id: [${assignmentCreated.person.id}] to product " +
                "with id: [${assignmentRequest.productId}].")
        return ResponseEntity.ok(assignmentCreated)
    }

    @PutMapping(path = ["/api/assignment/{assignmentId}"])
    fun editAssignment(@PathVariable assignmentId: Int, @RequestBody assignmentRequest: AssignmentRequest): ResponseEntity<Assignment> {
        val updatedAssignment = assignmentService.updateAssignment(assignmentId, assignmentRequest)
        logger.logInfoMessage("Assignment with id: [${updatedAssignment.id}] updated.")
        return ResponseEntity.ok(updatedAssignment)
    }

    @DeleteMapping(path = ["/api/assignment/{assignmentId}"])
    @Throws(Exception::class)
    fun deleteAssignment(@PathVariable assignmentId: Int): ResponseEntity<Unit> {
        assignmentService.deleteAndUnassign(assignmentId)
        logger.logInfoMessage("Assignment with id: [$assignmentId] deleted.")
        return ResponseEntity(HttpStatus.NO_CONTENT)
    }

}