package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.auth.exceptions.InvalidTokenException
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtException
import org.springframework.test.context.junit4.SpringRunner
import java.time.Instant
import java.util.*

@RunWith(SpringRunner::class)
@SpringBootTest
class AuthServiceTest {
    @Autowired
    lateinit var authservice: AuthService

    @MockBean
    lateinit var jwtDecoder: JwtDecoder

    @Test
    fun `validateToken - should return token if valid in ADFS`() {
        val accessToken = "valid_Token"
        val headers = HashMap<String, Any>()
        headers["typ"] = "JWT"
        val claims = HashMap<String, Any>()
        claims["sub"] = "USER_ID"
        val issuedAt = Instant.MIN
        val expiredAt = Instant.now()
        claims["expiresAt"] = expiredAt
        claims["iss"] = "https://localhost"
        val fakeJwt = Jwt(accessToken, issuedAt, expiredAt, headers, claims)
        val authVerifyResponse = OAuthVerifyResponse("USER_ID", emptyList(), expiredAt.toEpochMilli(), "https://localhost", "USER_ID")
        `when`(jwtDecoder.decode(accessToken)).thenReturn(fakeJwt)

        val actual = authservice.validateToken(accessToken)

        assertThat(actual).isEqualTo(authVerifyResponse)
    }

    @Test(expected = InvalidTokenException::class)
    fun `validateToken - should throw token exception if not valid in any provider`() {
        val accessToken = "valid_Token"
        `when`(jwtDecoder.decode(accessToken)).thenThrow(JwtException("INVALID JWT"))

        authservice.validateToken(accessToken)
    }
}
