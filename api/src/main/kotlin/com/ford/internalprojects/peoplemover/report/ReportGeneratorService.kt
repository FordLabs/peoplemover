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

package com.ford.internalprojects.peoplemover.report

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class ReportGeneratorService(
        private val spaceRepository: SpaceRepository,
        private val productService: ProductService,
        private val assignmentService: AssignmentService
) {
    fun getReportWithNames(spaceName: String, requestedDate: LocalDate): List<ReportGenerator> {
        val space = spaceRepository.findByNameIgnoreCase(spaceName) ?: throw SpaceNotExistsException(spaceName)

        val assignments = assignmentService.getAssignmentsByDate(space.id!!, requestedDate)
        val products = productService.findAllBySpaceIdAndDate(space.id, requestedDate)

        val reportGenerators: MutableList<ReportGenerator> = mutableListOf()
        assignments.forEach { assignment ->
            reportGenerators.add(ReportGenerator(
                    productName = products.find { it.id == assignment.productId }!!.name,
                    personName = assignment.person.name,
                    personRole = assignment.person.spaceRole?.name ?: ""
            ))
        }
        return reportGenerators.sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.personName })
                .sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.productName })
    }
}
