pipeline {
    agent none
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
                                    sh "npm run test --runInBand"
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
    }
}