package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.springframework.security.access.PermissionEvaluator
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.io.Serializable


@Component
class CustomPermissionEvaluator(
        private val userSpaceMappingRepository: UserSpaceMappingRepository,
        private val spaceRepository: SpaceRepository
) : PermissionEvaluator {

    @Value("\${read-only-off-flag:false}")
    private val readOnlyOff: Boolean = false


    override fun hasPermission(
            auth: Authentication, targetDomainObject: Any, permission: Any): Boolean {
        val mapping = userSpaceMappingRepository.findByUserIdAndSpaceId(auth.name, Integer.parseInt(targetDomainObject.toString()))
        return mapping.isPresent
    }

    override fun hasPermission(
            auth: Authentication, targetId: Serializable, targetType: String, permission: Any): Boolean {
        val targetIdString = targetId.toString()

        return if (permission == "write" || (permission == "read" && readOnlyOff)) {
            val spaceId = if (targetType == "uuid") {
                spaceRepository.findByUuid(targetIdString)?.id ?: return false
            } else {
                targetIdString.toInt()
            }
            return userSpaceMappingRepository.findByUserIdAndSpaceId(auth.name, spaceId).isPresent
        } else return true

    }
}

