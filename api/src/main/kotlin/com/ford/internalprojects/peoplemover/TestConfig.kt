package com.ford.internalprojects.peoplemover

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtValidationException
import java.time.Instant
import java.util.HashMap

@Configuration
@Profile("test", "e2e-test")
class TestConfig {

    @Bean
    fun mockJwtDecoder(): JwtDecoder {
        return MockJwtDecoder()
    }
}

private class MockJwtDecoder : JwtDecoder {
    override fun decode(token: String?): Jwt {
        if (token.equals("INVALID_TOKEN")) {
            throw JwtValidationException("Bad", listOf(OAuth2Error("Bad")))
        }

        val accessToken = "valid_Token"
        val headers = HashMap<String, Any>()
        headers["typ"] = "JWT"
        val claims = HashMap<String, Any>()
        claims["sub"] = "USER_ID"
        val issuedAt = Instant.now()
        val expiresAt = Instant.now().plusSeconds(60)
        claims["expiresAt"] = expiresAt
        claims["iss"] = "https://localhost"
        return Jwt(accessToken, issuedAt, expiresAt, headers, claims)
    }
}
