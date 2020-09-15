package com.ford.internalprojects.peoplemover.auth

import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter

@Configuration
@EnableWebSecurity
class AuthConfiguration : WebSecurityConfigurerAdapter() {
    override fun configure(http: HttpSecurity) {
        // uncomment when running H2 console
        // http.headers().frameOptions().sameOrigin();
        http.authorizeRequests().anyRequest().permitAll().and().csrf().disable()
    }
}