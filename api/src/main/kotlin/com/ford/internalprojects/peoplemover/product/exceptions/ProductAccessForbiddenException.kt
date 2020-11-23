package com.ford.internalprojects.peoplemover.product.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus


@ResponseStatus(value = HttpStatus.FORBIDDEN)
class ProductAccessForbiddenException : RuntimeException()