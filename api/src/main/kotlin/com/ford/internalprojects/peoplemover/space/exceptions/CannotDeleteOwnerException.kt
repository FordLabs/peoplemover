package com.ford.internalprojects.peoplemover.space.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import java.lang.RuntimeException

@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
class CannotDeleteOwnerException : RuntimeException("Owners cannot be deleted ")
