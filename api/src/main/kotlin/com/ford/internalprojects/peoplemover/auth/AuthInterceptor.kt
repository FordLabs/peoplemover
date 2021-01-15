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
        val targetIdString = targetDomainObject.toString()

        val currentSpace: Space? = spaceRepository.findByUuid(targetIdString)

        return if (permission == "write" || permission == "modify") {
            handleWritePermissions(currentSpace, auth)
        } else if (permission == "read") {
            handleReadPermissions(currentSpace, auth)
        } else {
            false
        }
    }

    override fun hasPermission(auth: Authentication, targetId: Serializable, targetType: String, permission: Any): Boolean
        = hasPermission(auth, targetId, permission)

    private fun handleReadPermissions(currentSpace: Space?, auth: Authentication): Boolean {
        if (currentSpace == null) throw SpaceNotExistsException()
        return if (currentSpace.todayViewIsPublic) true
        else userSpaceMappingRepository.findByUserIdAndSpaceUuid(auth.name, currentSpace.uuid).isPresent
    }

    private fun handleWritePermissions(currentSpace: Space?, auth: Authentication): Boolean {
        return if (currentSpace == null) false
        else userSpaceMappingRepository.findByUserIdAndSpaceUuid(auth.name, currentSpace.uuid).isPresent
    }

}

