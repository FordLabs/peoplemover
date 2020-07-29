package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.auth.exceptions.InvalidTokenException
import com.ford.labs.authquest.oauth.OAuthVerifyResponse
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.stereotype.Service

@Service
class AuthService (
        private val authClient: AuthClient,
        private val jwtDecoder: JwtDecoder
){
    fun validateToken(accessToken: String): OAuthVerifyResponse {
        return try {
            val jwt = jwtDecoder.decode(accessToken)
            OAuthVerifyResponse(jwt.subject, emptyList(), jwt.expiresAt!!.toEpochMilli(), jwt.issuer.toString(), jwt.subject)
        } catch (e: Exception) {
            try {
                authClient.validateAccessToken(accessToken).get()
            } catch (e: Exception) {
                throw InvalidTokenException()
            }
        }
    }
}