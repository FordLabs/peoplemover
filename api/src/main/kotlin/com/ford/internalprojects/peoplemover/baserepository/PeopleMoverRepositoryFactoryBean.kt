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

package com.ford.internalprojects.peoplemover.baserepository

import com.ford.internalprojects.peoplemover.space.SpaceComponent
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.support.JpaRepositoryFactoryBean
import org.springframework.data.repository.core.support.RepositoryFactorySupport
import java.io.Serializable
import javax.persistence.EntityManager

class PeopleMoverRepositoryFactoryBean<T : JpaRepository<S, ID>, S: SpaceComponent, ID : Serializable>(repositoryInterface: Class<T>)
    : JpaRepositoryFactoryBean<T, S, ID>(repositoryInterface) {

    @Autowired
    @Lazy
    private lateinit var spaceRepository: SpaceRepository

    override fun createRepositoryFactory(entityManager: EntityManager): RepositoryFactorySupport {
        return PeopleMoverRepositoryFactory(entityManager, spaceRepository)
    }
}
