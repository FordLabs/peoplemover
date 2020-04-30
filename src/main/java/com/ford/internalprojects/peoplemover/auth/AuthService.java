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

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
class AuthQuestAccessTokenRequest {
    private String client_id;
    private String client_secret;
    private String access_code;
}

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
class AuthQuestAccessTokenResponse {
    private String user_id;
    private String access_token;
}

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
class AuthQuestValidateAccessTokenRequest {
    private String access_token;
}

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
class AuthQuestRefreshTokenRequest {
    private String client_id;
    private String client_secret;
    private String access_token;
}

@Service
public class AuthService {

    private final RestTemplate authRestTemplate;

    private final String clientId;
    private final String clientSecret;

    public AuthService(

            @Value("${authquest.client_id}")
                    String clientId,

            @Value("${authquest.client_secret}")
                    String clientSecret,

            RestTemplate authRestTemplate

    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.authRestTemplate = authRestTemplate;
    }

    public AccessTokenResponse getAccessToken(String accessCode) {

        AuthQuestAccessTokenRequest requestBody = AuthQuestAccessTokenRequest.builder()
                .client_id(clientId)
                .client_secret(clientSecret)
                .access_code(accessCode)
                .build();

        AuthQuestAccessTokenResponse response = authRestTemplate.postForObject("/api/oauth/access_token", requestBody, AuthQuestAccessTokenResponse.class);
        return AccessTokenResponse.builder().accessToken(response.getAccess_token()).build();
    }

    public ResponseEntity<AuthQuestJWT> validateAccessToken(ValidateTokenRequest validateTokenRequest) {

        var request = AuthQuestValidateAccessTokenRequest.builder().access_token(validateTokenRequest.getAccessToken()).build();

        return authRestTemplate.postForEntity("/api/oauth/access_token/validate", request, AuthQuestJWT.class);
    }

    public AuthQuestAccessTokenResponse getRefreshToken(RefreshTokenRequest refreshTokenRequest) {

        AuthQuestRefreshTokenRequest request = AuthQuestRefreshTokenRequest.builder()
                .client_id(clientId)
                .client_secret(clientSecret)
                .access_token(refreshTokenRequest.getAccessToken()).build();

        return authRestTemplate.postForObject("/api/oauth/access_token/refresh", request, AuthQuestAccessTokenResponse.class);
    }

    public AuthRoleResponse updateUserRole(UserRoleRequest roleRequest) {
        var request = AuthRoleRequest.builder()
                .client_secret(clientSecret)
                .client_id(clientId)
                .access_token(roleRequest.getToken())
                .role(roleRequest.getSpaceName())
                .build();

        return authRestTemplate.exchange("/api/client/user/role", HttpMethod.PUT, new HttpEntity<>(request), AuthRoleResponse.class).getBody();
    }

    public boolean authenticateScope(AuthQuestJWT decodedToken, String spaceName) {
        var scopes = decodedToken.getScopes().stream().map(String::toLowerCase).collect(Collectors.toList());
        return scopes.contains(spaceName.toLowerCase());
    }

    public ResponseEntity<Void> inviteUsersToScope(String spaceName, List<String> emails) {

        AuthQuestInviteScopesRequest request = AuthQuestInviteScopesRequest.builder()
                .client_id(clientId)
                .client_secret(clientSecret)
                .user_emails(emails)
                .scope(spaceName)
        .build();

        return authRestTemplate.exchange(
                "/api/invite/scope",
                HttpMethod.PUT,
                new HttpEntity<>(request),
                Void.class
        );
    }
}
