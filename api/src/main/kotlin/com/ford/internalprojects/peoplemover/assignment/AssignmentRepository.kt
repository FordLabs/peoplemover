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

import com.ford.internalprojects.peoplemover.baserepository.PeopleMoverRepository
import com.ford.internalprojects.peoplemover.person.Person
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface AssignmentRepository : PeopleMoverRepository<AssignmentV1, Int> {
    fun getByPersonIdAndSpaceUuid(personId: Int, spaceUuid: String): List<AssignmentV1>
    fun findAllByPersonAndEffectiveDate(person: Person, requestedDate: LocalDate): List<AssignmentV1>
    fun findAllBySpaceUuidAndEffectiveDate(spaceUuid: String, requestedDate: LocalDate): List<AssignmentV1>

    fun findAllByEffectiveDateIsNullAndPersonId(personId: Int): List<AssignmentV1>
    fun findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(personId: Int, effectiveDate: LocalDate): List<AssignmentV1>
    fun findAllByPersonIdAndEffectiveDateGreaterThanOrderByEffectiveDateAsc(personId: Int, effectiveDate: LocalDate): List<AssignmentV1>
}
