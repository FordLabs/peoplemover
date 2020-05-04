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

package com.ford.internalprojects.peoplemover.auth;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AuthConfig {

    @Value("${authquest.url}")
    private String authClientUrl;

    @Value("${authquest.client_id}")
    private String clientId;

    @Value("${authquest.client_secret}")
    private String clientSecret;

    @Bean
    RestTemplate authRestTemplate() {
        return new RestTemplateBuilder().rootUri(authClientUrl).build();
    }

    @Bean
    AuthClient authClient() {
        return new AuthQuestPeopleMoverClient(authClientUrl, clientId, clientSecret);
    }

}
