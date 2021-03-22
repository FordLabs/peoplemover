/*
 * Copyright (c) 2021 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    override fun initialize(listPattern: ListPattern) {
        pattern = listPattern.value.toRegex()
    }

    override fun isValid(payload: List<*>, context: ConstraintValidatorContext): Boolean
            = payload.all { pattern.matches(it.toString()) }

}
