package com.ford.internalprojects.peoplemover.environmentconfiguration

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("api/config")
class EnvironmentConfigurationController(private val environmentConfiguration: EnvironmentConfiguration) {

    @GetMapping
    fun getConfiguration(): EnvironmentConfiguration? {
        return environmentConfiguration
    }
}

