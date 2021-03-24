package com.ford.internalprojects.peoplemover.user.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import java.lang.RuntimeException

@ResponseStatus(HttpStatus.BAD_REQUEST)
class InvalidUserModification : RuntimeException("Failed to update user permissions in database")
