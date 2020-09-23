package com.ford.internalprojects.peoplemover.auth

import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority

class JwtAuthentication(val token: String, var authenticationStatus: Boolean, val authService: AuthService) : Authentication {
    override fun getName(): String {
        return this.principal.toString()
    }

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return ArrayList()
    }

    override fun getCredentials(): Any {
        return Any()
    }

    override fun getDetails(): Any {
        return Any()
    }

    override fun getPrincipal(): Any {
        return authService.validateToken(token).sub
    }

    override fun isAuthenticated(): Boolean {
        return authenticationStatus
    }

    override fun setAuthenticated(isAuthenticated: Boolean) {
        authenticationStatus = isAuthenticated
    }
}
