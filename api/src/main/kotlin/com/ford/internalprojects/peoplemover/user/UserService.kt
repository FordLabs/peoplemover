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

package com.ford.internalprojects.peoplemover.user

import com.ford.internalprojects.peoplemover.auth.PERMISSION_EDITOR
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityNotExistsException
import com.ford.internalprojects.peoplemover.user.exceptions.CannotDeleteOwnerException
import com.ford.internalprojects.peoplemover.user.exceptions.InvalidUserModification
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
        private val logger: BasicLogger,
        private val userSpaceMappingRepository: UserSpaceMappingRepository) {


    fun getUsersForSpace(uuid: String): List<UserSpaceMapping> {
        return userSpaceMappingRepository.findAllBySpaceUuid(uuid)
    }

    fun addUsersToSpace(userIds: List<String>, uuid: String): List<String> =
            userIds.mapNotNull { rawUserId ->
                val userId = rawUserId.uppercase().trim()
                try {
                    userSpaceMappingRepository.save(UserSpaceMapping(userId = userId, spaceUuid = uuid, permission = PERMISSION_EDITOR))
                    null
                } catch (e: DataIntegrityViolationException) {
                    logger.logInfoMessage("$userId already has access to this space.")
                    null
                } catch (e: Exception) {
                    logger.logException(e)
                    rawUserId
                }
            }

    @Transactional
    fun deleteUserFromSpace(uuid: String, userId: String) {
        val user = userSpaceMappingRepository.findByUserIdAndSpaceUuid(userId, uuid)
                .orElseThrow{ EntityNotExistsException() }
        if(user.permission == PERMISSION_OWNER) throw CannotDeleteOwnerException()
        userSpaceMappingRepository.delete(user)
    }

    @Transactional
    fun modifyUserPermission(uuid: String, userId: String) {
        val editorResult = userSpaceMappingRepository.setOwnerToEditor(spaceUuid = uuid)
        val ownerResult = userSpaceMappingRepository.setEditorToOwner(spaceUuid = uuid, userId = userId)

        if (editorResult != 1 || ownerResult != 1) {
            throw InvalidUserModification()
        }
    }

}
