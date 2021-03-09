package com.ford.internalprojects.peoplemover.user

import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityNotExistsException
import com.ford.internalprojects.peoplemover.user.exceptions.CannotDeleteOwnerException
import com.ford.internalprojects.peoplemover.user.exceptions.InvalidUserModification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(private val userSpaceMappingRepository: UserSpaceMappingRepository) {


    fun getUsersForSpace(uuid: String): List<UserSpaceMapping> {
        return userSpaceMappingRepository.findAllBySpaceUuid(uuid)
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