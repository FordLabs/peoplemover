package com.ford.internalprojects.peoplemover.auth

import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus.UNAUTHORIZED
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.session.ConcurrentSessionFilter

@Configuration
@EnableWebSecurity
class AuthConfiguration(val jwtFilter: JwtFilter, val jwtAuthenticationProvider: JwtAuthenticationProvider) : WebSecurityConfigurerAdapter()
{

    override fun configure(http: HttpSecurity) {
        http.authorizeRequests()
                .antMatchers("/", "/error", "/api/config", "/h2-console").permitAll()
                .anyRequest().authenticated()
            .and().exceptionHandling().authenticationEntryPoint(HttpStatusEntryPoint(UNAUTHORIZED))
            .and().addFilterAfter(jwtFilter, ConcurrentSessionFilter::class.java)
            .csrf().disable()

        displayH2ConsoleToDevs(http)
    }

    @Throws(Exception::class)
    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(jwtAuthenticationProvider)
    }

    private fun displayH2ConsoleToDevs(httpSecurity: HttpSecurity) {
        httpSecurity.headers().frameOptions().sameOrigin()
    }
}
