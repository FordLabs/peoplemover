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

        val currentSpace: Space? = if (targetType == "uuid") {
            spaceRepository.findByUuid(targetIdString)
        } else {
            spaceRepository.findByIdOrNull(targetIdString.toInt())
        }

        if (permission == "write" || permission == "modify") {
            if (currentSpace == null) {
                return false
            }
            return userSpaceMappingRepository.findByUserIdAndSpaceId(auth.name, currentSpace.id!!).isPresent
        } else if (permission == "read") {
            if (currentSpace == null) {
                throw SpaceNotExistsException()
            }
            return if (currentSpace.currentDateViewIsPublic) {
                true
            } else {
                userSpaceMappingRepository.findByUserIdAndSpaceId(auth.name, currentSpace.id!!).isPresent
            }
        } else {
            return false
        }
    }
}

