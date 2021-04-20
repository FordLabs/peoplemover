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

package com.ford.internalprojects.peoplemover.report

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.ZoneOffset
import kotlin.streams.toList

@Service
class ReportGeneratorService(
    private val spaceRepository: SpaceRepository,
    private val productService: ProductService,
    private val assignmentService: AssignmentService,
    private val userSpaceMappingRepository: UserSpaceMappingRepository
) {
    fun createPeopleReport(spaceUuid: String, requestedDate: LocalDate): List<PeopleReportRow> {
        val assignments = assignmentService.getAssignmentsByDate(spaceUuid, requestedDate)
        val products = productService.findAllBySpaceUuidAndDate(spaceUuid, requestedDate)

        val peopleReport: MutableList<PeopleReportRow> = mutableListOf()
        assignments.forEach { assignment ->
            peopleReport.add(PeopleReportRow(
                productName = products.find { it.id == assignment.productId }?.name ?: "Product doesn't exist for id: ${assignment.productId}",
                personName = assignment.person.name,
                personRole = assignment.person.spaceRole?.name ?: "",
                personNote = assignment.person.notes ?: ""
            ))
        }
        return peopleReport.sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.personName })
                .sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.productName })
    }

    fun createSpacesReport(): List<SpaceReportItem> {
        val allSpaces = spaceRepository.findAll().toList()
        val userSpaceMappings = userSpaceMappingRepository.findAll().toList()

        val spaceReport = allSpaces.stream().map { space ->
            val users: List<String?> = mapUsersToSpace(userSpaceMappings, space)
            SpaceReportItem(space.name, space.createdBy, space.createdDate, users)
        }.toList().sortedWith(compareByDescending {it.createdDate?.toEpochSecond(ZoneOffset.UTC)})

        return spaceReport
    }

    private fun mapUsersToSpace(userSpaceMappings: List<UserSpaceMapping>, space: Space): List<String?> {
        return userSpaceMappings.stream()
                .filter { filterSpaceMapping -> filterSpaceMapping.spaceUuid == space.uuid }
                .map { mapSpaceMapping -> mapSpaceMapping.userId }.toList()
    }

    fun createUsersReport(): List<String> {
        return userSpaceMappingRepository.findAll()
                .distinctBy{ it.userId!! }
                .map{ it.userId!! }
    }
}
