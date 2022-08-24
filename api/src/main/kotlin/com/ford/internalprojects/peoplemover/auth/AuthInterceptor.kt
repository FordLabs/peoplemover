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

package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.security.access.PermissionEvaluator
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.io.Serializable

@Component
class CustomPermissionEvaluator(
        private val userSpaceMappingRepository: UserSpaceMappingRepository,
        private val spaceRepository: SpaceRepository
) : PermissionEvaluator {
    override fun hasPermission(auth: Authentication, targetDomainObject: Any, permission: Any): Boolean {

        if (!auth.isAuthenticated) return false
        val subject: String = getUsernameOrAppName(auth) ?: return false

        val targetIdString = targetDomainObject.toString()
        val currentSpace: Space? = getCurrentSpace(targetIdString)

        return when(permission) {
            "write","modify" -> handleWritePermissions(currentSpace, subject)
            "read" -> handleReadPermissions(currentSpace, subject)
            "owner" -> handleOwnerPermissions(currentSpace, subject)
            else -> false
        }
    }

    override fun hasPermission(auth: Authentication, targetId: Serializable, targetType: String, permission: Any): Boolean
        = hasPermission(auth, targetId, permission)

    private fun getCurrentSpace(uuid: String): Space? {
        return spaceRepository.findByUuid(uuid)
    }

    private fun handleReadPermissions(currentSpace: Space?, subject: String): Boolean {
        if (currentSpace == null) throw SpaceNotExistsException()
        if (currentSpace.todayViewIsPublic) return true
        return userSpaceMappingRepository.findByUserIdAndSpaceUuid(subject, currentSpace.uuid).isPresent
    }

    private fun handleWritePermissions(currentSpace: Space?, subject: String): Boolean {
        if (currentSpace == null) return false
        return userSpaceMappingRepository.findByUserIdAndSpaceUuid(subject, currentSpace.uuid).isPresent
    }

    private fun handleOwnerPermissions(currentSpace: Space?, subject: String): Boolean {
        if (currentSpace == null) throw SpaceNotExistsException()
        return userSpaceMappingRepository.findByUserIdAndSpaceUuidAndPermission(subject, currentSpace.uuid, PERMISSION_OWNER).isPresent
    }
}

