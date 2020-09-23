/*
 * Copyright (c) 2019 Ford Motor Company
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

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
class ReportGeneratorController(private val reportGeneratorService: ReportGeneratorService) {
    @GetMapping("/api/reports/people")
    fun getPeopleReport(
        @RequestParam(name = "spaceUuid", required = true) spaceUuid: String,
        @RequestParam(name = "requestedDate", required = true) requestedDate: String
    ): ResponseEntity<List<PeopleReportRow>> {
        val peopleReport = reportGeneratorService.createPeopleReport(spaceUuid, LocalDate.parse(requestedDate))
        return ResponseEntity.ok(peopleReport)
    }

    @GetMapping("/api/reports/space")
    fun getSpaceReport(): ResponseEntity<List<SpaceReportItem>> {
        val spaceReport = reportGeneratorService.createSpacesReport()
        return ResponseEntity.ok(spaceReport)
    }
}