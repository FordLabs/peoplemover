/*
 * Copyright (c) 2020 Ford Motor Company
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

import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
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

    @PreAuthorize("hasPermission(#spaceUuid, 'uuid', 'modify')")
    @GetMapping(path = ["/api/assignment/dates/{spaceUuid}"])
    fun getAllEffectiveDates(@PathVariable spaceUuid: String): ResponseEntity<Set<LocalDate>> {
        val dates = assignmentService.getEffectiveDates(spaceUuid)
        logger.logInfoMessage("All effective dates retrieved for space with uuid: [$spaceUuid].")
        return ResponseEntity.ok(dates)
    }

    @GetMapping(path = ["/api/reassignment/{spaceUuid}/{requestedDate}"])
    fun getReassignmentsByExactDate(@PathVariable spaceUuid: String, @PathVariable requestedDate: String): ResponseEntity<List<Reassignment>> {
        val reassignmentsByExactDate = assignmentService.getReassignmentsByExactDate(spaceUuid, LocalDate.parse(requestedDate))
        logger.logInfoMessage("All reassignments retrieved for space with uuid: [$spaceUuid] on date: [$requestedDate].")
        return ResponseEntity.ok(reassignmentsByExactDate)
    }

    @PreAuthorize("hasPermission(#createAssignmentRequest.person.spaceId, 'id', 'modify')")
    @PostMapping(path = ["/api/assignment/create"])
    fun createAssignmentsForDate(@RequestBody createAssignmentRequest: CreateAssignmentsRequest): ResponseEntity<Set<Assignment>> {
        val assignmentsCreated: Set<Assignment> = assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(createAssignmentRequest)
        logger.logInfoMessage("[${assignmentsCreated.size}] assignment(s) created " +
                "for person with id: [${assignmentsCreated.first().person.id}] " +
                "with effective date: [${assignmentsCreated.first().effectiveDate}]")
        return ResponseEntity.ok(assignmentsCreated)
    }


    @PreAuthorize("hasPermission(#assigmentToDelete.spaceId, 'id', 'modify')")
    @DeleteMapping(path = ["/api/assignment/delete"])
    fun deleteAssignment(@RequestBody assigmentToDelete: Assignment): ResponseEntity<Unit> {
        assignmentService.deleteOneAssignment(assigmentToDelete)
        logger.logInfoMessage("assignment deleted " +
                "for person with id: [${assigmentToDelete.person.id}] " +
                "for product with id: [${assigmentToDelete.productId}] " +
                "with effective date: [${assigmentToDelete.effectiveDate}]")
        return ResponseEntity.ok().build()
    }

    @PreAuthorize("hasPermission(#person.spaceId, 'id', 'modify')")
    @DeleteMapping(path = ["/api/assignment/delete/{requestedDate}"])
    fun deleteAssignmentForDate(@PathVariable requestedDate: String, @RequestBody person: Person): ResponseEntity<Unit> {
        assignmentService.revertAssignmentsForDate(LocalDate.parse(requestedDate), person)
        logger.logInfoMessage("assignment deleted " +
                "for person with id: [${person.id}] " +
                "with effective date: [${requestedDate}]")
        return ResponseEntity.ok().build()
    }
}
