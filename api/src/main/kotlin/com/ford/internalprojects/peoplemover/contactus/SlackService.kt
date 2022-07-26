/*
 * Copyright (c) 2022 Ford Motor Company
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

package com.ford.internalprojects.peoplemover.contactus

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.net.URI
import java.net.URISyntaxException

@Service
class SlackService {

    @Value("\${slack.url}")
    var slackURL: String? = null

    fun postToSlackChannel(newFormResponse: ContactFormDTO) {
        if (slackURL == null){return}
        var uri: URI? = null
        try {
            uri = URI(slackURL)
        } catch (e: URISyntaxException) {
            e.printStackTrace()
        }
        val contactInformation = ContactForm(
            newFormResponse.name,
            newFormResponse.email,
            newFormResponse.userType,
            newFormResponse.message
        )
        val body: HttpEntity<String> = HttpEntity(contactInformation.createStringForSlack(), null)
        val restTemplate = RestTemplate()
        try {
            val response = restTemplate.exchange(
                uri!!,
                HttpMethod.POST,
                body,
                Void::class.java
            )
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

}
