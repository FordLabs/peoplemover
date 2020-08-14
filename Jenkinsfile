pipeline {
    agent none
    environment {
        BRANCH_NAME_WITHOUT_UNDERSCORES = "${env.BRANCH_NAME}".replaceAll("_", "")
        NPM_ENVIRONMENT = getNpmEnvironment(BRANCH_NAME_WITHOUT_UNDERSCORES)
        MANIFEST = getManifest(BRANCH_NAME_WITHOUT_UNDERSCORES)
        API_DEPLOY_PROPS = getAPIDeployProps(BRANCH_NAME_WITHOUT_UNDERSCORES)
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
                        stage('NPM Install') {
                            steps {
                                dir("ui") {
                                    sh "npm install"
                                }
                            }
                        }
                        stage('UI Test') {
                            steps {
                                dir("ui") {
                                    sh "npm run test:ci"
                                }
                            }
                        }
                        stage('UI Build') {
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
                        stage('API Test') {
                            steps {
                                dir("api") {
                                    sh "./gradlew test"
                                }
                            }
                        }
                        stage('API Build') {
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
        stage('API Deploy') {
            agent {
                kubernetes {
                    label 'jdk11'
                    defaultContainer 'jdk11'
                }
            }
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'labsci', usernameVariable: 'CI_USER', passwordVariable: 'CI_PASSWORD')
                ]) {
                    dir("api") {
                        sh 'echo Pushing to Cloud Foundry'
                        sh  """./gradlew cf-push-blue-green \
                        -Pcf.ccUser=$CI_USER \
                        -Pcf.ccPassword=$CI_PASSWORD \
                        -Pcf.ccHost=$peoplemover_pcf_cchost \
                        -Pcf.domain=$peoplemover_pcf_domain ${env.API_DEPLOY_PROPS} \
                        -Pcf.environment.spring.security.oauth2.resourceserver.jwt.issuer-uri=$spring_security_oauth2_resourceserver_jwt_issuer_uri \
                        -Pcf.environment.adfs-resource-uri=$adfs_resource_uri \
                        -Pcf.environment.react.app.adfs_url_template="$adfs_url_template" \
                        -Pcf.environment.react.app.adfs_client_id=$adfs_client_id \
                        -Pcf.environment.react.app.adfs_resource=$adfs_resource \
                        """.stripIndent()
                    }
                }
            }
        }
        stage('UI Deploy') {
            agent {
                kubernetes {
                    label 'nodejs'
                    defaultContainer 'nodejs'
                }
            }
            steps {
                withCredentials([
                        usernamePassword(credentialsId: 'labsci', usernameVariable: 'CI_USER', passwordVariable: 'CI_PASSWORD')
                ]) {
                    dir("ui") {
                        sh 'echo Login to Cloud Foundry'
                        sh """cf login \
                            -a $peoplemover_pcf_cchost \
                            -u $CI_USER \
                            -p $CI_PASSWORD \
                            -o  FordLabs_Experiments_InternalProjects_EDC1_Prod \
                            -s  FordLabs_Experiments_InternalProjects-prod \
                                
                        """.stripIndent()
                        sh 'echo Pushing to Cloud Foundry'
                        sh """cf push \
                            ${env.BRANCH_NAME_WITHOUT_UNDERSCORES}UI \
                            -f ${env.MANIFEST} \

                        """.stripIndent()
                    }
                }
            }
        }
    }
}

def getAPIDeployProps(branchName) {
    if(branchName == "master"){
        return """-PbranchNameWithoutUnderscores=Prod \
                -Pcf.name=PeopleMover2 \
                -Pcf.host=peoplemover2 \
                -Pcf.environment.react.app.url=https://peoplemover2.$peoplemover_pcf_org \
                -Pcf.environment.react.app.auth_enabled=true \
                -Pcf.environment.react.app.invite_users_to_space_enabled=true"""
    }
    else if (branchName =="stage"){
        return """-PbranchNameWithoutUnderscores=Stage \
                -Pcf.name=StagePeopleMover \
                -Pcf.host=stagepeoplemover \
                -Pcf.environment.react.app.url=https://stagepeoplemover.$peoplemover_pcf_org \
                -Pcf.environment.react.app.auth_enabled=true \
                -Pcf.environment.react.app.invite_users_to_space_enabled=true"""
    }
    else{
        return """-PbranchNameWithoutUnderscores=Branch \
                -Pcf.name=$branchName \
                -Pcf.host=$branchName \
                -Pcf.environment.react.app.url=https://$branchName.$peoplemover_pcf_org \
                -Pcf.environment.react.app.auth_enabled=false \
                -Pcf.environment.react.app.invite_users_to_space_enabled=true"""
    }
}

def getNpmEnvironment(branchName) {
    if (branchName == "dev" || branchName == "stage") {
        return """REACT_APP_URL=https://stagepeoplemover.$peoplemover_pcf_org""".stripIndent()
    } else if (branchName == "master") {
        return """REACT_APP_URL=https://peoplemover2.$peoplemover_pcf_org""".stripIndent()
    } else {
        return """REACT_APP_URL=https://$branchName.$peoplemover_pcf_org""".stripIndent()
    }
}

def getManifest(branchName) {
    if (branchName == "dev") {
        return 'manifest_QA.yml'
    } else if (branchName == "stage") {
        return 'manifest_Stage.yml'
    } else if (branchName == "master"){
        return 'manifest.yml'
    } else {
        return 'manifest_QA.yml'
    }
}