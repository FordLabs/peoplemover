pipeline {
    agent any
    tools {
        jdk 'openjdk-11-jdk'
    }
    stages {
        stage('Test') {
            steps {
                sh "./gradlew clean test"
            }
        }

        stage('Build') {
            steps {
                sh "./gradlew assemble"
            }
        }

        stage('Analyze') {
            when {
                anyOf {
                    branch 'master'
                    branch 'stage'
                }
            }
            steps {
                withSonarQubeEnv('FordLabs SonarQube') {
                    sh './gradlew sonarqube'
                }
            }
        }

        stage('Deploy Stage') {
            when {
                branch 'stage'
            }
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'flipJenkins', usernameVariable: 'JENKINS_USER', passwordVariable: 'JENKINS_PASSWORD'),
                    usernamePassword(credentialsId: 'peopleMoverDB', usernameVariable: 'DB_USER', passwordVariable: 'DB_PASSWORD')
                ]) {
                    sh 'echo Pushing to Cloud Foundry'
                    sh """./gradlew cf-push-blue-green \
                            -Pcf.name=StagePeopleMover \
                            -Pcf.host=stagepeoplemover \
                            -Pcf.ccUser=$JENKINS_USER \
                            -Pcf.ccPassword=$JENKINS_PASSWORD \
                            -Pcf.environment.spring.datasource.username=$DB_USER \
                            -Pcf.environment.spring.datasource.password=$DB_PASSWORD \
                            -Pcf.environment.spring.datasource.url="jdbc:sqlserver://$peoplemover_db_ip;databaseName=PeopleMoverQA" \
                            -Pcf.environment.authquest.client_id=$authquest_qa_client_id \
                            -Pcf.environment.authquest.client_secret=$authquest_qa_client_secret \
                            -Pcf.environment.authquest.url=$authquest_qa_url \
                       """.stripIndent()
                }
            }
        }
        stage('Deploy Prod') {
            when {
                branch 'master'
            }
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'flipJenkins', usernameVariable: 'JENKINS_USER', passwordVariable: 'JENKINS_PASSWORD'),
                    usernamePassword(credentialsId: 'peopleMoverDB', usernameVariable: 'DB_USER', passwordVariable: 'DB_PASSWORD')
                ]) {
                    sh 'echo Pushing to Cloud Foundry'
                    sh """./gradlew cf-push-blue-green \
                            -Pcf.ccUser=$JENKINS_USER \
                            -Pcf.ccPassword=$JENKINS_PASSWORD \
                            -Pcf.environment.spring.datasource.username=$DB_USER \
                            -Pcf.environment.spring.datasource.password=$DB_PASSWORD \
                            -Pcf.environment.spring.datasource.url="jdbc:sqlserver://$peoplemover_db_ip;databaseName=PeopleMover" \
                            -Pcf.environment.authquest.client_id=$authquest_prod_client_id \
                            -Pcf.environment.authquest.client_secret=$authquest_prod_client_secret \
                            -Pcf.environment.authquest.url=$authquest_prod_url \
                       """.stripIndent()
                }
            }
        }
    }
}
