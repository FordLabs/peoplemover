package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.security.access.PermissionEvaluator
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.io.Serializable


@Component
class CustomPermissionEvaluator(
        private val userSpaceMappingRepository: UserSpaceMappingRepository,
        private val spaceRepository: SpaceRepository
) : PermissionEvaluator {
    override fun hasPermission(auth: Authentication, targetDomainObject: Any, permission: Any): Boolean {
        val mapping = userSpaceMappingRepository.findByUserIdAndSpaceId(auth.name, Integer.parseInt(targetDomainObject.toString()))
        return mapping.isPresent
    }

    override fun hasPermission(auth: Authentication, targetId: Serializable, targetType: String, permission: Any): Boolean {
        val targetIdString = targetId.toString()

        val currentSpace: Space? = getCurrentSpaceByIdOrUuid(targetType, targetIdString)

        return if (permission == "write" || permission == "modify") {
            handleWritePermissions(currentSpace, auth)
        } else if (permission == "read") {
            handleReadPermissions(currentSpace, auth)
        } else {
            false
        }
    }

    private fun handleReadPermissions(currentSpace: Space?, auth: Authentication): Boolean {
        if (currentSpace == null) throw SpaceNotExistsException()
        return if (currentSpace.currentDateViewIsPublic) true
        else userSpaceMappingRepository.findByUserIdAndSpaceId(auth.name, currentSpace.id!!).isPresent
    }

    private fun handleWritePermissions(currentSpace: Space?, auth: Authentication): Boolean {
        return if (currentSpace == null) false
        else userSpaceMappingRepository.findByUserIdAndSpaceId(auth.name, currentSpace.id!!).isPresent
    }

    private fun getCurrentSpaceByIdOrUuid(targetType: String, targetIdString: String): Space? {
        return if (targetType == "uuid") spaceRepository.findByUuid(targetIdString)
        else spaceRepository.findByIdOrNull(targetIdString.toInt())
    }
}

