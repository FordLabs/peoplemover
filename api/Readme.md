# PeopleMover Server
This is the back-end server for PeopleMover.

## Building

### Getting Started
These instructions will get you a copy of the backend up and running on your local machine for development and testing purposes.
PeopleMover is written primarily in [Kotlin](https://kotlinlang.org/).

Once you have a copy of the backend up and running, head over to the [UI README](../ui/README.md) to start up the frontend for local development and testing.

### Dependencies
- [Java 11](https://openjdk.java.net/projects/jdk/11/)
- [Docker](https://www.docker.com/products/docker-desktop) optional if using local MySql

### Build with Gradle
1. Build the project with the following command: `./gradlew clean build`. This will run the backend tests.
2. If you do not wish to run the tests and only want to build the application, use `./gradlew clean assemble`

## Testing

This product uses JUnit tests.
```
./gradlew test
```

## Running
Running the application locally can be done with either an [H2](https://www.h2database.com/html/main.html) in-memory 
database or a [MySQL](https://www.mysql.com/) database.

Our deployed backend currently relies on our Corporate ADFS system; 
the `e2e-test` profile replaces it with a simplified auth system for testing.

### H2 In-Memory Database
The simplest way to get the application spun up is by using the in-memory database via Gradle:
```
SPRING_PROFILES_ACTIVE=e2e-test ./gradlew bootRun
```

### Docker MySql Database
```
docker-compose up -d

SPRING_PROFILES_ACTIVE=e2e-test,mysql ./gradlew bootRun
```

## License

PeopleMover is licensed under the Apache 2.0 license.
