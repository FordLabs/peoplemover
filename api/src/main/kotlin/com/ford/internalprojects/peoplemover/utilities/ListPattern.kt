package com.ford.internalprojects.peoplemover.utilities

import javax.validation.Constraint
import javax.validation.ConstraintValidator
import javax.validation.ConstraintValidatorContext
import kotlin.reflect.KClass
import kotlin.annotation.AnnotationTarget.*

@Constraint(validatedBy = [ListPatternValidator::class])
@Target(FUNCTION, PROPERTY_GETTER, PROPERTY_SETTER, FIELD, ANNOTATION_CLASS, CONSTRUCTOR, VALUE_PARAMETER)
@kotlin.annotation.Retention(AnnotationRetention.RUNTIME)
annotation class ListPattern( val value: String,
                              val message: String = "{}",
                              val groups: Array<KClass<*>> = [],
                              val payload: Array<KClass<*>> = [])


class ListPatternValidator : ConstraintValidator<ListPattern, List<*>> {

    private lateinit var pattern: Regex
    override fun initialize(constraintAnnotation: ListPattern) {
        pattern = constraintAnnotation.value.toRegex()
    }

    override fun isValid(payload: List<*>, context: ConstraintValidatorContext): Boolean
            = payload.map { pattern.matches(it.toString()) }.all {it }

}