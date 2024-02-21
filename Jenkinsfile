pipeline {
    agent any

    parameters {
        string(name: 'RELEASE_VERSION', defaultValue: 'latest', description: 'Release version to deploy')
    }

    environment {
        DOCKER_REGISTRY = "registry.digitalocean.com/jenkins-test-repository"
        DOCKER_IMAGE_NAME = "nginx-simple"
        KUBE_DEPLOYMENT_NAMES = "nginx-deployment nginx-canary-deployment" // Update to include all deployment names
        PREVIOUS_IMAGE_VERSIONS = [:] // Map to store previous image versions for rollback
    }

    stages {
        stage('Deploy to Production') {
            steps {
                script {
                    // Save current image version for rollback
                    for (deploymentName in KUBE_DEPLOYMENT_NAMES.split()) {
                        PREVIOUS_IMAGE_VERSIONS[deploymentName] = sh(
                            script: "kubectl get deployment/${deploymentName} -o=jsonpath='{.spec.template.spec.containers[?(@.name==\"${DOCKER_IMAGE_NAME}\")].image}'",
                            returnStdout: true
                        ).trim()

                        // Perform a rollout update for the Kubernetes deployment
                        sh "kubectl set image deployment/${deploymentName} ${DOCKER_IMAGE_NAME}=${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${RELEASE_VERSION}"
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    try {
                        // Verify deployment
                        for (deploymentName in KUBE_DEPLOYMENT_NAMES.split()) {
                            sh "kubectl rollout status deployment/${deploymentName}"
                        }
                    } catch (Exception e) {
                        echo "Deployment verification failed: ${e.message}"
                        rollBackDeployment()
                        currentBuild.result = 'FAILURE'
                        error "Deployment verification failed"
                    }
                }
            }
        }

        stage('Verify Endpoint') {
            steps {
                script {
                    try {
                        // Verify endpoint availability
                        sh 'curl -I http://spicy.kebab.solutions:31000 | grep -q "200 OK"'
                    } catch (Exception e) {
                        echo "Endpoint verification failed: ${e.message}"
                        rollBackDeployment()
                        currentBuild.result = 'FAILURE'
                        error "Pipeline failed due to endpoint verification failure"
                    }
                }
            }
        }
    }
}

def rollBackDeployment() {
    // Rollback deployment to previous image versions
    for (deploymentName in KUBE_DEPLOYMENT_NAMES.split()) {
        sh "kubectl set image deployment/${deploymentName} ${DOCKER_IMAGE_NAME}=${PREVIOUS_IMAGE_VERSIONS[deploymentName]}"
    }
}
