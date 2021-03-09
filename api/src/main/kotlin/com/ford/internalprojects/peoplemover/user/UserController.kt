package com.ford.internalprojects.peoplemover.user

import com.ford.internalprojects.peoplemover.auth.PERMISSION_EDITOR
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.user.exceptions.InvalidUserModification
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RequestMapping("/api/spaces")
@RestController
class UserController(
        private val logger: BasicLogger,
        private val userSpaceMappingRepository: UserSpaceMappingRepository,
        private val userService: UserService
) {

    @PreAuthorize("hasPermission(#uuid, 'modify')")
    @GetMapping("/{uuid}/users")
    fun getAllUsers(@PathVariable uuid: String): List<UserSpaceMapping> {
        return userService.getUsersForSpace(uuid)
    }

    @PreAuthorize("hasPermission(#uuid, 'modify')")
    @DeleteMapping("/{uuid}/users/{userId}")
    fun deleteUserFromSpace(@PathVariable uuid: String, @PathVariable userId: String) {
        userService.deleteUserFromSpace(uuid, userId)
    }

    @PreAuthorize("hasPermission(#uuid, 'owner')")
    @PutMapping("/{uuid}/users/{userId}")
    fun updateUserForSpace(@PathVariable uuid: String, @PathVariable userId: String) {
        userService.modifyUserPermission(uuid, userId)
    }

    @PreAuthorize("hasPermission(#uuid, 'modify')")
    @Deprecated("Delete ME use new POST /users endpoint")
    @PutMapping("/{uuid}:invite")
    fun oldInviteUsersToSpace(
            @RequestBody request: OldAuthInviteUsersToSpaceRequest,
            @PathVariable uuid: String
    ): ResponseEntity<ArrayList<String>> {
        val filteredEmails = AuthInviteUsersToSpaceRequest(
                request.emails
                        .map { it.substringBefore("@") }
                        .filter { it.isNotBlank() })
        if (filteredEmails.userIds.isEmpty())
            throw InvalidUserModification()
        return inviteUsersToSpace(filteredEmails, uuid)
    }


    @PreAuthorize("hasPermission(#uuid, 'modify')")
    @PostMapping("/{uuid}/users")
    fun inviteUsersToSpace(
            @Valid @RequestBody request: AuthInviteUsersToSpaceRequest,
            @PathVariable uuid: String
    ): ResponseEntity<ArrayList<String>> {
        val failures = arrayListOf<String>()
        request.userIds.forEach { email ->
            val userId = email.toUpperCase().trim()
            try {
                userSpaceMappingRepository.save(UserSpaceMapping(userId = userId, spaceUuid = uuid, permission = PERMISSION_EDITOR))
            } catch (e: DataIntegrityViolationException) {
                logger.logInfoMessage("$userId already has access to this space.")
            } catch (e: Exception) {
                failures.add(email)
                logger.logException(e)
            }
        }
        return ResponseEntity.ok(failures)
    }
}
