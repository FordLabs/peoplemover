package com.ford.internalprojects.peoplemover.utilities

import javax.validation.ConstraintValidator
import javax.validation.ConstraintValidatorContext

class ListPatternValidator : ConstraintValidator<ListPattern, List<*>> {

    private lateinit var pattern: Regex
    override fun initialize(constraintAnnotation: ListPattern) {
        pattern = constraintAnnotation.value.toRegex()
    }

    override fun isValid(payload: List<*>, context: ConstraintValidatorContext): Boolean
            = payload.map { pattern.matches(it.toString()) }.all {it }

}