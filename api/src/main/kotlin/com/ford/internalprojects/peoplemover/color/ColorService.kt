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

package com.ford.internalprojects.peoplemover.color

import com.ford.internalprojects.peoplemover.color.exceptions.ColorAlreadyExistsException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service

@Service
class ColorService(private val colorRepository: ColorRepository) {
    fun addColors(colors: List<String>) {
        try {
            colors.forEach { color: String -> colorRepository.save(Color(color = color.trim())) }
        } catch (e: DataIntegrityViolationException) {
            throw ColorAlreadyExistsException()
        }
    }

    fun getColors(): List<Color> {
        return colorRepository.findAllByOrderByIdAsc()
    }
}
