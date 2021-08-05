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

import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@SpringBootTest(properties = ["com.ford.people-mover.secured-report.users=SPACE_REPORT_UNAUTHORIZED"])
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ReportGeneratorControllerUnauthorizedUserTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    val mar1 = "2019-03-01"

    private val baseReportsUrl = "/api/reports"
    private val baseSpaceReportsUrl = "$baseReportsUrl/space"
    private val baseUserReportsUrl = "$baseReportsUrl/user"

    @Test
    fun `GET should return unauthorized if user is not authorized for space reports`() {
        mockMvc.perform(get(baseSpaceReportsUrl)
            .header("Authorization", "Bearer GOOD_TOKEN"))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `GET should return unauthorized if user is not authorized for user reports`() {
        mockMvc.perform(get(baseUserReportsUrl)
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isForbidden)
    }
}
