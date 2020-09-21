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

package com.ford.internalprojects.peoplemover.baserepository

import com.ford.internalprojects.peoplemover.space.SpaceComponent
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.jpa.repository.support.JpaEntityInformation
import org.springframework.data.jpa.repository.support.SimpleJpaRepository
import java.io.Serializable
import java.sql.Timestamp
import java.util.*
import javax.persistence.EntityManager
import javax.transaction.Transactional

class PeopleMoverRepositoryImpl<T: SpaceComponent, ID : Serializable>(
        entityInformation: JpaEntityInformation<T, *>,
        entityManager: EntityManager,
        private val spaceRepository: SpaceRepository
) : SimpleJpaRepository<T, ID>(entityInformation, entityManager), PeopleMoverRepository<T, ID> {

    @Transactional
    override fun <S : T> saveAndUpdateSpaceLastModified(entity: S): S {
        updateSpaceLastModified(entity.spaceId)
        return save(entity)
    }

    @Transactional
    override fun <S : T> deleteAndUpdateSpaceLastModified(entity: S) {
        updateSpaceLastModified(entity.spaceId)
        delete(entity)
    }

    private fun updateSpaceLastModified(spaceId: Int) {
        val space = spaceRepository.findById(spaceId).orElseThrow { SpaceNotExistsException() }
        space.lastModifiedDate = Timestamp(Date().time)
        spaceRepository.save(space)
    }

}