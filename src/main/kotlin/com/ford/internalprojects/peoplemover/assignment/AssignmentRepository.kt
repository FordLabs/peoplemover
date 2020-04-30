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

import com.ford.internalprojects.peoplemover.baserepository.PeopleMoverRepository
import com.ford.internalprojects.peoplemover.person.Person
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface AssignmentRepository : PeopleMoverRepository<Assignment, Int> {
    fun deleteByProductId(id: Int)
    fun getByPersonId(personId: Int): List<Assignment>
    fun findAllByPersonAndEffectiveDate(person: Person, requestedDate: LocalDate): List<Assignment>

    fun findAllByEffectiveDateLessThanEqualAndPersonOrderByEffectiveDateAsc(requestedDate: LocalDate, person: Person): List<Assignment>
    fun findAllByEffectiveDateIsNullAndPerson(person: Person): Set<Assignment>
}