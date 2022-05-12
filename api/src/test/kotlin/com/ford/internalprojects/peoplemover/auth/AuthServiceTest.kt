package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.auth.exceptions.InvalidTokenException
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtException
import java.time.Instant

@SpringBootTest
class AuthServiceTest {
    @Autowired
    lateinit var authservice: AuthService

    @MockBean
    lateinit var jwtDecoder: JwtDecoder

    @Test
    fun `validateToken - should return token if valid in ADFS`() {
        val fakeJwt = createMockJwt(true)
        val authVerifyResponse = OAuthVerifyResponse(
            "USER_ID",
            emptyList(),
            fakeJwt.expiresAt!!.toEpochMilli(),
            "https://localhost",
            "USER_ID"
        )
        `when`(jwtDecoder.decode("token")).thenReturn(fakeJwt)

        val actual = authservice.validateToken("token")

        assertThat(actual).isEqualTo(authVerifyResponse)
    }

    @Test
    fun `validateToken - should throw token exception if not valid in any provider`() {
        val accessToken = "valid_Token"
        `when`(jwtDecoder.decode(accessToken)).thenThrow(JwtException("INVALID JWT"))

        assertThatThrownBy { this.authservice.validateToken(accessToken) }
            .isInstanceOf(InvalidTokenException::class.java)
    }
}

fun createMockJwt(isUserToken: Boolean): Jwt {
    val headers = HashMap<String, Any>()
    headers["typ"] = "JWT"
    val claims = HashMap<String, Any>()
    if (isUserToken) {
        claims["sub"] = "USER_ID"
    } else {
        claims["appid"] = "APP_ID"
    }
    val issuedAt = Instant.MIN
    val expiredAt = Instant.now()
    claims["expiresAt"] = expiredAt
    claims["iss"] = "https://localhost"
    return Jwt("token", issuedAt, expiredAt, headers, claims)
}
