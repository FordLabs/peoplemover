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

package com.ford.internalprojects.peoplemover.baserepository

import com.ford.internalprojects.peoplemover.space.SpaceComponent
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.NoRepositoryBean


@NoRepositoryBean
interface PeopleMoverRepository<T: SpaceComponent, Int> : CrudRepository<T, Int> {
    fun <S : T> saveAndUpdateSpaceLastModified(entity: S): S
    fun <S : T> createEntityAndUpdateSpaceLastModified(entity: S): S
    fun <S : T> updateEntityAndUpdateSpaceLastModified(entity: S): S
    fun deleteEntityAndUpdateSpaceLastModified(id: Int, spaceUuid: String)
}
