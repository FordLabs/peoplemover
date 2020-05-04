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

import org.junit.Before;
import org.junit.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

public class AuthServiceTest {

    private RestTemplate authRestTemplate;

    private AuthService authService;

    private String fakeAccessCode = "CODE_ABC123";
    private String fakeAccessToken = "TOKEN_123";

    private String fakeClientId = "CLIENT_ID_123";
    private String fakeClientSecret = "CLIENT_SECRET_123";

    @Before
    public void setup() {

        authRestTemplate = mock(RestTemplate.class);

        AuthQuestAccessTokenRequest requestBody = AuthQuestAccessTokenRequest.builder()
                .access_code(fakeAccessCode)
                .client_id(fakeClientId)
                .client_secret(fakeClientSecret)
                .build();

        when(authRestTemplate.postForObject("/api/oauth/access_token", requestBody, AuthQuestAccessTokenResponse.class))
                .thenReturn(AuthQuestAccessTokenResponse.builder()
                        .user_id("USER_ID123")
                        .access_token(fakeAccessToken)
                        .build());

        authService = new AuthService(fakeClientId, fakeClientSecret, authRestTemplate);
    }

    @Test
    public void shouldReturnAnAuthTokenForAValidAccessCode() {

        AccessTokenResponse response = authService.getAccessToken(fakeAccessCode);

        assertThat(response.getAccessToken()).isEqualTo(fakeAccessToken);
    }

    @Test
    public void shouldReturn200IfAccessTokenIsValid() {

        var validateTokenRequest = new ValidateTokenRequest("123");

        var authQuestValidateAccessTokenRequest = AuthQuestValidateAccessTokenRequest.builder().access_token("123").build();

        when(authRestTemplate.postForEntity("/api/oauth/access_token/validate", authQuestValidateAccessTokenRequest, AuthQuestJWT.class))
                .thenReturn(ResponseEntity.ok().build());

        assertThat(authService.validateAccessToken(validateTokenRequest)).isEqualTo(ResponseEntity.ok().build());

        verify(authRestTemplate).postForEntity("/api/oauth/access_token/validate", authQuestValidateAccessTokenRequest, AuthQuestJWT.class);
    }

    @Test
    public void shouldReturnRefreshedTokenForAValidAccessToken(){
        AuthQuestRefreshTokenRequest request = AuthQuestRefreshTokenRequest.builder()
                .client_secret(fakeClientSecret)
                .client_id(fakeClientId)
                .access_token(fakeAccessToken)
                .build();

        AuthQuestAccessTokenResponse response = AuthQuestAccessTokenResponse.builder().access_token("newToken").build();
        when(authRestTemplate.postForObject("/api/oauth/access_token/refresh", request, AuthQuestAccessTokenResponse.class)).thenReturn(response);

        RefreshTokenRequest refreshTokenRequest = new RefreshTokenRequest(fakeAccessToken);

        AuthQuestAccessTokenResponse actual = authService.getRefreshToken(refreshTokenRequest);

        verify(authRestTemplate).postForObject("/api/oauth/access_token/refresh", request, AuthQuestAccessTokenResponse.class);
        assertThat(actual).isEqualTo(response);

    }

    @Test
    public void shouldReturnTrueIfSpaceNameIsIncludedInScopes(){
        AuthQuestJWT jwt = new AuthQuestJWT(
                "",
                asList("spacetwo", "spacethree"),
                "",
                "",
                ""
        );

        boolean actual = authService.authenticateScope(jwt, "SpaceTwo");

        assertThat(actual).isTrue();
    }

    @Test
    public void shouldReturnFalseIfSpaceNameIsNotIncludedInScopes() {
        AuthQuestJWT jwt = new AuthQuestJWT(
                "",
                asList("spacetwo", "spacethree"),
                "",
                "",
                ""
        );

        boolean actual = authService.authenticateScope(jwt, "Space");

        assertThat(actual).isFalse();
    }


}
