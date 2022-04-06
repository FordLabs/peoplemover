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

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.read.ListAppender
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.oauth2.jwt.JwtDecoder

@SpringBootTest
class BasicLoggerTest {
    @Autowired
    private lateinit var basicLogger: BasicLogger

    @MockBean
    lateinit var jwtDecoder: JwtDecoder

    @Test
    fun whenAnExceptionIsLogged_TheErrorIsRecordedInTheErrorLog() {
        val testAppender: ListAppender<ILoggingEvent> = testAppender()
        basicLogger.logException(RuntimeException("ABC easy as 123"))
        assertLogged(testAppender.list, Level.ERROR, "ABC easy as 123")
    }

    companion object {
        @JvmStatic
        fun testAppender(): ListAppender<ILoggingEvent> {
            val logger: Logger = LoggerFactory.getLogger(BasicLogger::class.java) as Logger
            val listAppender = ListAppender<ILoggingEvent>()
            listAppender.start()
            logger.addAppender(listAppender)
            return listAppender
        }

        @JvmStatic
        fun assertLogged(eventList: List<ILoggingEvent>, level: Level?, message: String?) {
            assertThat(eventList).isNotEmpty()
            assertThat(message).isEqualTo(eventList[0].message)
            assertThat(level).isEqualTo(eventList[0].level)
        }
    }
}
