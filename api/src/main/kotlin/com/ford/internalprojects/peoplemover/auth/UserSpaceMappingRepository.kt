package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.space.Space
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserSpaceMappingRepository : JpaRepository<UserSpaceMapping, Int> {
    fun findAllByUserId(userId: String): List<UserSpaceMapping>
    fun findByUserIdAndSpaceId(userId: String, spaceId: Int): Optional<UserSpaceMapping>
}