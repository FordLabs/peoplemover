pipeline {
    agent none
    environment {
        BRANCH_NAME_WITHOUT_UNDERSCORES = "${env.BRANCH_NAME}".replaceAll("_", "")
    }
    stages {
        stage('Build & Test') {
            parallel {
                stage('Web') {
                    agent {
                        kubernetes {
                            label 'nodejs'
                            defaultContainer 'nodejs'
                        }
                    }
                    stages {
                        stage('Install') {
                            steps {
                                dir("ui") {
                                    sh "npm install"
                                }
                            }
                        }
                        stage('Test') {
                            steps {
                                dir("ui") {
                                    sh "npm run test:ci"
                                }
                            }
                        }
                        stage('Build') {
                            steps {
                                dir("ui") {
                                    sh "npm run build"
                                }
                            }
                        }
                    }
                }
                stage('API') {
                    agent {
                        kubernetes {
                            label 'jdk11'
                            defaultContainer 'jdk11'
                        }
                    }
                    stages {
                        stage('Test') {
                            steps {
                                dir("api") {
                                    sh "./gradlew test"
                                }
                            }
                        }
                        stage('Build') {
                            steps {
                                dir("api") {
                                    sh "./gradlew assemble"
                                }
                            }
                        }
                    }
                }
            }
        }
        stage('API Deploy Branch') {
            agent {
                kubernetes {
                    label 'jdk11'
                    defaultContainer 'jdk11'
                }
            }
            when {
                not {
                    anyOf {
                        branch 'master';
                        branch 'stage'
                    }
                }
            }
            steps {
                withCredentials([
                        usernamePassword(credentialsId: 'labsci', usernameVariable: 'CI_USER', passwordVariable: 'CI_PASSWORD')
                ]) {
                    dir("api") {
                        sh 'echo Pushing to Cloud Foundry'
                        sh """./gradlew cf-push-blue-green \
                                -PbranchNameWithoutUnderscores=Branch \
                                -Pcf.name=${env.BRANCH_NAME_WITHOUT_UNDERSCORES} \
                                -Pcf.host=${env.BRANCH_NAME_WITHOUT_UNDERSCORES} \
                                -Pcf.ccHost=$peoplemover_pcf_cchost \
                                -Pcf.domain=$peoplemover_pcf_domain \
                                -Pcf.ccUser=$CI_USER \
                                -Pcf.ccPassword=$CI_PASSWORD \
                                -Pcf.environment.spring.security.oauth2.resourceserver.jwt.issuer-uri=$spring_security_oauth2_resourceserver_jwt_issuer_uri \
                                -Pcf.environment.adfs-resource-uri=$adfs_resource_uri \
                                -Pcf.environment.react.app.url=https://${env.BRANCH_NAME_WITHOUT_UNDERSCORES}.$peoplemover_pcf_org \
                                -Pcf.environment.react.app.auth_enabled=false \
                                -Pcf.environment.react.app.invite_users_to_space_enabled=true \
                                -Pcf.environment.react.app.adfs_url_template="$adfs_url_template" \
                                -Pcf.environment.react.app.adfs_client_id=$adfs_client_id \
                                -Pcf.environment.react.app.adfs_resource=$adfs_resource \
                        """.stripIndent()
                    }
                }
            }
        }
    }
}