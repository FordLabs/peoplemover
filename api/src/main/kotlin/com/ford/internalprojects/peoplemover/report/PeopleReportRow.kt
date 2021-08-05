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

package com.ford.internalprojects.peoplemover.report

data class PeopleReportRow (
    val productName: String,
    val personName: String,
    val customField1: String?,
    val personRole: String,
    val personNote: String,
    val personTags: String,
    val productLocation: String,
    val productTags: String
) {
    override fun equals(other: Any?): Boolean {
        return when (other) {
            is PeopleReportRow -> {
                val otherPersonTags = other.personTags.split(",").toHashSet()
                val thisPersonTags = this.personTags.split(",").toHashSet()
                val otherProductTags = other.productTags.split(",").toHashSet()
                val thisProductTags = this.productTags.split(",").toHashSet()

                (this.productName == other.productName
                        && this.personName == other.personName
                        && this.customField1 == other.customField1
                        && this.personRole == other.personRole
                        && this.personNote == other.personNote
                        && this.productLocation == other.productLocation
                        && thisProductTags == otherProductTags
                        && thisPersonTags == otherPersonTags)
            }
            else -> false
        }
    }
}
