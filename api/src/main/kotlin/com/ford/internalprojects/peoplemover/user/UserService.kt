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
            userIds.mapNotNull { email ->
                val userId = email.toUpperCase().trim()
                try {
                    userSpaceMappingRepository.save(UserSpaceMapping(userId = userId, spaceUuid = uuid, permission = PERMISSION_EDITOR))
                } catch (e: DataIntegrityViolationException) {
                    logger.logInfoMessage("$userId already has access to this space.")
                } catch (e: Exception) {
                    logger.logException(e)
                    email
                }
                null
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
