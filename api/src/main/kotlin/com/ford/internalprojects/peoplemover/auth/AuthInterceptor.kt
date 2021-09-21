package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.security.access.PermissionEvaluator
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import java.io.Serializable

@Component
class CustomPermissionEvaluator(
        private val userSpaceMappingRepository: UserSpaceMappingRepository,
        private val spaceRepository: SpaceRepository
) : PermissionEvaluator {
    override fun hasPermission(auth: Authentication, targetDomainObject: Any, permission: Any): Boolean {

        if (!auth.isAuthenticated) return false
        val subject: String = getSubject(auth) ?: return false

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

    private fun getSubject(auth: Authentication): String? {
        return if((auth.name != null) && auth.name.isNotEmpty()) auth.name
        else (auth.credentials as Jwt).claims["appid"]?.toString()
    }

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

