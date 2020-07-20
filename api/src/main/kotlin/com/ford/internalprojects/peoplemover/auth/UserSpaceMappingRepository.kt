package com.ford.internalprojects.peoplemover.auth

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserSpaceMappingRepository : JpaRepository<UserSpaceMapping, Int> {
    fun findAllByUserId(userId: String): List<UserSpaceMapping>
}