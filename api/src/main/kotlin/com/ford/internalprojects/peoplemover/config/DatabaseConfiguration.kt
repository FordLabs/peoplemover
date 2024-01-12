package com.ford.internalprojects.peoplemover.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.jdbc.DataSourceBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.io.ClassPathResource
import java.io.IOException
import javax.sql.DataSource

@Profile("db")
@Configuration
class DatabaseConfiguration(
    @Value("\${db.host}") private var dbHost: String?,
    @Value("\${db.port}") private var dbPort: String?,
    @Value("\${db.name}") private var dbName: String?,
    @Value("\${db.username}") private var username: String?,
    @Value("\${db.password}") private var password: String?,
    @Value("\${db.driver}") private var driver: String?,
    @Value("\${db.sslMode}") private var sslMode: String?,
    @Value("\${db.certFileName}") private var certFileName: String?,
    @Value("\${db.keyFileName}") private var keyFileName: String?
) {

    @Bean
    @Throws(IOException::class)
    fun getDataSource(): DataSource {

        var url = ("jdbc:postgresql://$dbHost:$dbPort/$dbName")

        if(!sslMode.equals("disable")) {
            val certResource = ClassPathResource(certFileName!!)
            val certFile = certResource.file
            val keyResource = ClassPathResource(keyFileName!!)
            val keyFile = keyResource.file
            url = (url + "?sslMode=" + sslMode
                    + "&sslcert=" + certFile.path
                    + "&sslkey=" + keyFile.path)
        }

        return DataSourceBuilder.create()
            .url(url)
            .username(username)
            .password(password)
            .driverClassName(driver)
            .build()
    }
}