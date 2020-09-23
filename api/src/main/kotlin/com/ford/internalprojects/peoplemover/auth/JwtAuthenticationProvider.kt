package com.ford.internalprojects.peoplemover.auth

import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component

@Component
class JwtAuthenticationProvider : AuthenticationProvider {
    override fun authenticate(authentication: Authentication?): Authentication? {
        return try {
            authentication!!.principal
            authentication.isAuthenticated = true
            authentication
        } catch (e: Exception) {
            null
        }
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return JwtAuthentication::class.java == authentication
    }

}
