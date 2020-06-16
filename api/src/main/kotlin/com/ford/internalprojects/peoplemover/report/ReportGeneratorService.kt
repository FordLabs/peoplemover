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

import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.stereotype.Service
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Service
class ReportGeneratorService(
        private val spaceRepository: SpaceRepository,
        @field:PersistenceContext private val entityManager: EntityManager
) {
    fun getReportWithNames(spaceName: String): List<ReportGenerator> {
        spaceRepository.findByNameIgnoreCase(spaceName) ?: throw SpaceNotExistsException(spaceName)

        val nativeQuery = entityManager.createQuery(reportGeneratorQuery, Array<Any?>::class.java)

        val results = nativeQuery.resultList

        val reportGenerators: MutableList<ReportGenerator> = mutableListOf()
        results.forEach { result ->
            reportGenerators.add(ReportGenerator(
                    productName = result[0].toString(),
                    personName = result[1].toString(),
                    personRole = result[2]?.toString() ?: ""
            ))
        }
        return reportGenerators
    }

    companion object {
        private const val reportGeneratorQuery = "select pt.name as ProductName, pn.name as PersonName, sr.name as PersonRole " +
                "from Space s join Product pt " +
                "on s.id=pt.spaceId " +
                "join Assignment a " +
                "on pt.id= a.productId " +
                "join Person pn " +
                "on pn.id=a.person.id " +
                "left join SpaceRole sr " +
                "on sr.id = pn.spaceRole.id "
    }
}
