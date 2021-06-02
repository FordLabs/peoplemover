package com.ford.internalprojects.peoplemover.environmentconfiguration

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "react.app")
class EnvironmentConfiguration {
    var auth_enabled: Boolean = false
    var ford_labs_url: String = ""
    var invite_users_to_space_enabled: Boolean = false
    var adfs_url_template: String = ""
    var adfs_client_id: String = ""
    var adfs_resource: String = ""
    var flagsmith_url: String = ""
    var flagsmith_environment_id : String = ""
}
