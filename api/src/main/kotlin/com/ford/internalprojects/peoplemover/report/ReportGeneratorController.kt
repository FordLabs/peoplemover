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

package com.ford.internalprojects.peoplemover.report

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate


@RequestMapping("/api/reports")
@RestController
class ReportGeneratorController(private val reportGeneratorService: ReportGeneratorService) {
    @Value("\${com.ford.people-mover.secured-report.users}")
    protected val users: String = "none"

    @GetMapping("/people")
    fun getPeopleReport(
        @RequestParam(name = "spaceUuid", required = true) spaceUuid: String,
        @RequestParam(name = "requestedDate", required = true) requestedDate: String
    ): ResponseEntity<List<PeopleReportRow>> {
        val peopleReport = reportGeneratorService.createPeopleReport(spaceUuid, LocalDate.parse(requestedDate))
        return ResponseEntity.ok(peopleReport)
    }

    @GetMapping("/space")
    fun getSpaceReport(): ResponseEntity<List<SpaceReportItem>> {
        val userName: String = SecurityContextHolder.getContext().authentication.name.toLowerCase()

        val authorizedUsers = users.toLowerCase().split(",")
        val isAuthorizedUser = authorizedUsers.contains(userName)
        if (isAuthorizedUser) {
            val spaceReport = reportGeneratorService.createSpacesReport()
            return ResponseEntity.ok(spaceReport)
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
    }

    @GetMapping("/user")
    fun getUserReport():ResponseEntity<List<String>> {
        val userName: String = SecurityContextHolder.getContext().authentication.name.toLowerCase()

        val authorizedUsers = users.toLowerCase().split(",")
        val isAuthorizedUser = authorizedUsers.contains(userName)
        if (isAuthorizedUser) {
            val userReport = reportGeneratorService.createUsersReport()
            return ResponseEntity.ok(userReport)
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
    }
}