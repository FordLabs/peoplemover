package com.ford.internalprojects.peoplemover.auth

import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus.UNAUTHORIZED
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.builders.WebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.web.access.expression.DefaultWebSecurityExpressionHandler
import org.springframework.security.web.authentication.HttpStatusEntryPoint


@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
class AuthConfiguration(private val customPermissionEvaluator: CustomPermissionEvaluator) : WebSecurityConfigurerAdapter() {

    override fun configure(http: HttpSecurity) {
        http.authorizeRequests()
                .antMatchers("/", "/error", "/api/config", "/h2-console", "/api/reset/**").permitAll()
                .anyRequest().authenticated()
                .and().exceptionHandling().authenticationEntryPoint(HttpStatusEntryPoint(UNAUTHORIZED))
                .and().csrf().disable()
                .oauth2ResourceServer().jwt()

        displayH2ConsoleToDevs(http)
    }

    private fun displayH2ConsoleToDevs(httpSecurity: HttpSecurity) {
        httpSecurity.headers().frameOptions().sameOrigin()
    }

    override fun configure(web: WebSecurity) {
        web.expressionHandler(
                DefaultWebSecurityExpressionHandler()
                        .apply {
                            setPermissionEvaluator(customPermissionEvaluator)
                        })
    }
}
