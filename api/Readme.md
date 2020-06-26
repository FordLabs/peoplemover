# PeopleMover Server
This is the back-end server for PeopleMover.

## Building

### Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Dependencies
PeopleMover is written primarily in [Kotlin](https://kotlinlang.org/). It also has some code written in 
[Java 11](https://openjdk.java.net/projects/jdk/11/).

### Build with Gradle
1. Build the project with the following command: `./gradlew clean build` This will trigger the backend tests to run.
2. If you do not wish to run the tests and only want to build the application, use `./gradlew clean assemble`

## Running
Running the application locally can be done with either an H2 in-memory database or a Microsoft SQLServer database.

### In-Memory
The simplest way to get the application spun up is by using the in-memory database via Gradle:
```
./gradlew bootRun
```
If you would like some pre-populated data to appear for evaluation, you can use the `local` configuration.
```
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```
The schema produced for H2 may not conform exactly to the Microsoft SQLServer schema used in production.

### Microsoft SQLServer
You can use a deployed Microsoft SQLServer with PeopleMover.

Either add these fields to the `application-cloud.properties` file:
```
spring.datasource.url=jdbc:sqlserver://db_url;databaseName=PeopleMover
spring.datasource.username=db_user
spring.datasource.password=db_password
```
and then use the cloud config:
```
SPRING_PROFILES_ACTIVE=cloud ./gradlew bootRun
```
or inlined:
```
SPRING_PROFILES_ACTIVE=cloud SPRING_DATASOURCE_USERNAME=db_user SPRING_DATASOURCE_PASSWORD=db_pw SPRING_DATASOURCE_URL="jdbc:sqlserver://db_url;databaseName=PeopleMover" ./gradlew bootRun
```

### Tests

This product uses JUnit tests.
```
./gradlew test
```

## Auth
PeopleMover can be used without any form of Auth. However, to take advantage of features such as unique users, you'll
need to provide an auth client.

### AuthQuest
In production, PeopleMover uses a proprietary auth client called AuthQuest. To use AuthQuest, you'll need to:
1. create a client_id for your instance of PeopleMover on AuthQuest
2. fill in the following values in application.properties:
```
authquest.client_id=AQ:client_id
authquest.client_secret=client_secret
authquest.url=https://authquest-url
```
A `libauthquest.jar` is provided in the `./libs` directory to make integration easy.

### Alternative Auth Clients
You can integrate an alternative auth client by making it implement the AuthClient Interface provided at
`kotlin/com/ford/internalprojects/peoplemover/auth/AuthClient.kt`. Then, you can create a custom configuration file to
 use it similar to `java/com/ford/internalprojects/peoplemover/auth/AuthConfig.java`.
 
## License

PeopleMover is licensed under the Apache 2.0 license.
