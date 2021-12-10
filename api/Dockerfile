### STAGE 1: Build ###
FROM gradle:jdk11 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle clean assemble -x generateGitProperties

### STAGE 2: Run ###
FROM openjdk:11-jre-slim
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]