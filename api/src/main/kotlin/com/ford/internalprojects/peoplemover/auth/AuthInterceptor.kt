package com.ford.internalprojects.peoplemover.auth

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.PermissionEvaluator
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.io.Serializable


@Component
class CustomPermissionEvaluator(private val userSpaceMappingRepository: UserSpaceMappingRepository) : PermissionEvaluator {
    override fun hasPermission(
            auth: Authentication, targetDomainObject: Any, permission: Any): Boolean {
        println("Auth: ${auth.name}, Target: $targetDomainObject, Permission: $permission")
        println("repo: $userSpaceMappingRepository")

        val mapping = userSpaceMappingRepository.findByUserIdAndSpaceId(auth.name, Integer.parseInt(targetDomainObject.toString()))
        return mapping.isPresent
    }

    override fun hasPermission(
            auth: Authentication, targetId: Serializable, targetType: String, permission: Any): Boolean {
        println("Auth: ${auth.name}, TargetId: $targetId, TargetType: $targetType, Permission: $permission")
        println("repo: $userSpaceMappingRepository")
        val mapping = userSpaceMappingRepository.findByUserIdAndSpaceId(auth.name, Integer.parseInt(targetId.toString()))
        return mapping.isPresent

    }
}

