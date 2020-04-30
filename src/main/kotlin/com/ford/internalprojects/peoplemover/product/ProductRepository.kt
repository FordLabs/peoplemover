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

package com.ford.internalprojects.peoplemover.product

import com.ford.internalprojects.peoplemover.baserepository.PeopleMoverRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ProductRepository : PeopleMoverRepository<Product, Int> {
    fun findByName(name: String): Product?
    fun findAllByBoardId(boardId: Int): List<Product>
    fun deleteAllByBoardId(boardId: Int)
    fun findProductByNameAndBoardId(name: String, boardId: Int): Product?

    @Query("SELECT p FROM Product p WHERE p.spaceId = ?1 " +
            "AND (p.startDate = NULL OR p.startDate <= ?2) AND (p.endDate = NULL or p.endDate >= ?2)")
    fun findAllBySpaceIdAndDate(spaceId: Int, date: LocalDate): Set<Product>
}