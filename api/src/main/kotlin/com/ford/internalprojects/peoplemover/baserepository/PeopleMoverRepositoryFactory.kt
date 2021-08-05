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
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory
import org.springframework.data.jpa.repository.support.JpaRepositoryImplementation
import org.springframework.data.repository.core.RepositoryInformation
import javax.persistence.EntityManager

class PeopleMoverRepositoryFactory(
        entityManager: EntityManager,
        private val spaceRepository: SpaceRepository
) : JpaRepositoryFactory(entityManager) {

    override fun getTargetRepository(
            information: RepositoryInformation,
            entityManager: EntityManager
    ): JpaRepositoryImplementation<*, *> {
        @Suppress("UNCHECKED_CAST") val entityInformation = getEntityInformation<SpaceComponent, Any>(information.domainType as Class<SpaceComponent>)
        return PeopleMoverRepositoryImpl<SpaceComponent, Int>(
                entityInformation,
                entityManager,
                spaceRepository
        )
    }
}
