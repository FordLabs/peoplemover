/*
 * Copyright (c) 2020 Ford Motor Company
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

package com.ford.internalprojects.peoplemover.location

import javax.validation.constraints.Min
import javax.validation.constraints.NotEmpty
import javax.validation.constraints.NotNull
import javax.validation.constraints.Size

data class LocationEditRequest (
    @field:NotNull(message = "Id is required.")
    @field:Min(1, message = "Id must be positive.")
    val id: Int,

    @field:NotEmpty(message = "Name is required.")
    @field:Size(max = 255, message = "Name must be less than 255 characters.")
    val name: String
)

fun LocationEditRequest.toSpaceLocation(spaceUuid: String) : SpaceLocation =
        SpaceLocation(id = this.id, name = this.name, spaceUuid = spaceUuid)