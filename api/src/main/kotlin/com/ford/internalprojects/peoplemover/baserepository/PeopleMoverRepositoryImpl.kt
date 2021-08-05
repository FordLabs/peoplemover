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

import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityAlreadyExistsException
import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityNotExistsException
import com.ford.internalprojects.peoplemover.space.SpaceComponent
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.jpa.repository.support.JpaEntityInformation
import org.springframework.data.jpa.repository.support.SimpleJpaRepository
import org.springframework.data.repository.findByIdOrNull
import java.sql.Timestamp
import java.util.*
import javax.persistence.EntityManager
import javax.transaction.Transactional

class PeopleMoverRepositoryImpl<T : SpaceComponent, ID>(
        entityInformation: JpaEntityInformation<T, *>,
        entityManager: EntityManager,
        private val spaceRepository: SpaceRepository
) : SimpleJpaRepository<T, Int>(entityInformation, entityManager), PeopleMoverRepository<T, Int> {

    @Transactional
    override fun <S : T> saveAndUpdateSpaceLastModified(entity: S): S {
        updateSpaceLastModified(entity.spaceUuid)
        return save(entity)
    }

    @Transactional
    override fun <S : T> createEntityAndUpdateSpaceLastModified(entity: S): S {
        if (entity.id != null) {
            throw EntityAlreadyExistsException()
        } else {
            updateSpaceLastModified(entity.spaceUuid)
            return save(entity)
        }
    }

    @Transactional
    override fun <S : T> updateEntityAndUpdateSpaceLastModified(entity: S): S {
        val entityToUpdate =  findByIdOrNull(entity.id!!)
        if(entityToUpdate == null || entityToUpdate.spaceUuid != entity.spaceUuid) {
            throw EntityNotExistsException()
        }
        updateSpaceLastModified(entity.spaceUuid)
        return save(entity)
    }

    @Transactional
    override fun deleteEntityAndUpdateSpaceLastModified(id: Int, spaceUuid: String) {
        val entityToDelete =  findByIdOrNull(id)
        if(entityToDelete == null || entityToDelete.spaceUuid != spaceUuid) {
            throw EntityNotExistsException()
        }
        updateSpaceLastModified(spaceUuid)
        delete(entityToDelete)
    }

    private fun updateSpaceLastModified(spaceUuid: String) {
        val space = spaceRepository.findByUuid(spaceUuid) ?: throw SpaceNotExistsException()
        space.lastModifiedDate = Timestamp(Date().time)
        spaceRepository.save(space)
    }
}
