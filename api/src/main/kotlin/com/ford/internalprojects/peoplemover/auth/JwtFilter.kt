package com.ford.internalprojects.peoplemover.auth

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class JwtFilter(val authService: AuthService) : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val authHeader = request.getHeader("Authorization")
        if (authHeader != null) {
            val token = authHeader.replace("Bearer ".toRegex(), "")
            if (!token.isEmpty()) {
                SecurityContextHolder.getContext().authentication = JwtAuthentication(token, false, authService)
            }
        }

        filterChain.doFilter(request, response)
    }
}