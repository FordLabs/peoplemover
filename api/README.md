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

This repository uses a Gradle multi-module build. All Gradle commands should be run from the root of the repository.

Build the project with the following command: `./gradlew api:build`. This will run the backend tests.

## Testing

This product uses JUnit tests.
```
./gradlew api:test
```

## Running
Running the application locally can be done with either an [H2](https://www.h2database.com/html/main.html) in-memory 
database or a [MySQL](https://www.mysql.com/) database.

Our deployed backend currently relies on our Corporate ADFS system; 
the `e2e-test` profile replaces it with a simplified auth system for testing.

### H2 In-Memory Database
The simplest way to get the application spun up is by using the in-memory database via Gradle:
```
SPRING_PROFILES_ACTIVE=e2e-test,h2 ./gradlew api:bootRun
```

### Docker MySql Database
```
docker-compose up -d

SPRING_PROFILES_ACTIVE=e2e-test,mysql ./gradlew api:bootRun
```

## License

PeopleMover is licensed under the Apache 2.0 license.
