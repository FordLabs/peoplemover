package com.ford.internalprojects.peoplemover.auth

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserSpaceMappingRepository : JpaRepository<UserSpaceMapping, Int> {
    fun findAllByUserId(userId: String): List<UserSpaceMapping>
    fun findByUserIdAndSpaceUuid(userId: String, spaceUuid: String): Optional<UserSpaceMapping>
    fun findAllBySpaceUuid(uuid: String): List<UserSpaceMapping>
}
