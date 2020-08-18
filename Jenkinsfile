pipeline {
    agent none
    environment {
        BRANCH_NAME_WITHOUT_UNDERSCORES = "${env.BRANCH_NAME}".replaceAll("_", "")
        NPM_ENVIRONMENT = getNpmEnvironment(BRANCH_NAME_WITHOUT_UNDERSCORES)
        MANIFEST = getManifest(BRANCH_NAME_WITHOUT_UNDERSCORES)
        API_DEPLOY_PROPS = getAPIDeployProps(BRANCH_NAME_WITHOUT_UNDERSCORES)
        UI_APP_NAME = getUIAppName(BRANCH_NAME_WITHOUT_UNDERSCORES)
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
            when {
                branch 'master'
                branch 'stage'
            }
            agent {
                kubernetes {
                    label 'jdk11'
                    defaultContainer 'jdk11'
                }
            }
            steps {
              withCredentials([
                   usernamePassword(credentialsId: 'labsci', usernameVariable: 'CI_USER', passwordVariable: 'CI_PASSWORD'),
                   string(credentialsId: 'peoplemover_pcf_cchost', variable: 'PCF_HOST'),
                   string(credentialsId: 'peoplemover_pcf_domain', variable: 'PCF_DOMAIN'),
                   string(credentialsId: 'spring_security_oauth2_resourceserver_jwt_issuer_uri', variable: 'OAUTH_URI'),
                   string(credentialsId: 'adfs_client_id', variable: 'ADFS_CLIENT_ID'),
                   string(credentialsId: 'adfs_url_template', variable: 'ADFS_URL_TEMPLATE'),
                   string(credentialsId: 'adfs_resource_uri', variable: 'ADFS_RESOURCE_URI'),
                   string(credentialsId: 'adfs_resource', variable: 'ADFS_RESOURCE')
                             ]) {
                    dir("api") {
                        sh 'echo Pushing to Cloud Foundry'
                        sh  """./gradlew cf-push-blue-green \
                        -Pcf.ccUser=$CI_USER \
                        -Pcf.ccPassword=$CI_PASSWORD \
                        -Pcf.ccHost=$PCF_HOST \
                        -Pcf.domain=$PCF_DOMAIN ${env.API_DEPLOY_PROPS} \
                        -Pcf.environment.spring.security.oauth2.resourceserver.jwt.issuer-uri=$OAUTH_URI \
                        -Pcf.environment.adfs-resource-uri=$ADFS_RESOURCE_URI \
                        -Pcf.environment.react.app.adfs_url_template="$ADFS_URL_TEMPLATE" \
                        -Pcf.environment.react.app.adfs_client_id=$ADFS_CLIENT_ID \
                        -Pcf.environment.react.app.adfs_resource=$ADFS_RESOURCE \
                        """.stripIndent()
                        }
                }
            }
        }
        stage('UI Deploy') {
            when {
                branch 'master'
                branch 'stage'
            }
            agent {
                kubernetes {
                    label 'nodejs'
                    defaultContainer 'nodejs'
                }
            }
            steps {
                withCredentials([
                        usernamePassword(credentialsId: 'labsci', usernameVariable: 'CI_USER', passwordVariable: 'CI_PASSWORD'),
                        string(credentialsId: 'peoplemover_pcf_cchost', variable: 'PCF_HOST'),
                ]) {
                    dir("ui") {
                        sh 'echo Login to Cloud Foundry'
                        sh """cf login \
                            -a $PCF_HOST \
                            -u $CI_USER \
                            -p $CI_PASSWORD \
                            -o  FordLabs_Experiments_InternalProjects_EDC1_Prod \
                            -s  FordLabs_Experiments_InternalProjects-prod \
                                
                        """.stripIndent()
                        sh 'echo Pushing to Cloud Foundry'
                        sh """cf push \
                            ${env.UI_APP_NAME} -f ${env.MANIFEST} \
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
                -Pcf.name=PeopleMoverAPI2 \
                -Pcf.host=peoplemoverui2 \
                -Pcf.environment.react.app.url=https://peoplemover2.$peoplemover_pcf_org \
                -Pcf.environment.react.app.auth_enabled=true \
                -Pcf.environment.react.app.invite_users_to_space_enabled=true"""
    }
    else if (branchName =="stage"){
        return """-PbranchNameWithoutUnderscores=Stage \
                -Pcf.name=StagePeopleMoverAPI \
                -Pcf.host=stagepeoplemoverui \
                -Pcf.environment.react.app.url=https://stagepeoplemover.$peoplemover_pcf_org \
                -Pcf.environment.react.app.auth_enabled=true \
                -Pcf.environment.react.app.invite_users_to_space_enabled=true"""
    }
}

def getUIAppName(branchName) {
    if (branchName == "stage") {
        return "StagePeopleMoverUI"
    } else if (branchName == "master") {
        return "PeopleMoverUI2"
    }
}

def getNpmEnvironment(branchName) {
    if (branchName == "dev" || branchName == "stage") {
        return """REACT_APP_URL=https://stagepeoplemover.$peoplemover_pcf_org""".stripIndent()
    } else if (branchName == "master") {
        return """REACT_APP_URL=https://peoplemover2.$peoplemover_pcf_org""".stripIndent()
    }
}

def getManifest(branchName) {
    if (branchName == "dev") {
        return 'manifest_QA.yml'
    } else if (branchName == "stage") {
        return 'manifest_Stage.yml'
    } else if (branchName == "master"){
        return 'manifest.yml'
    }
}