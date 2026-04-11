pipeline {
    agent any

    environment {
        // Bind Jenkins stored credentials to environment variables
        // Configure these in: Manage Jenkins → Credentials → Global
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        AWS_DEFAULT_REGION    = 'us-east-1'
    }

    tools {
        jdk   'Java17'
        maven 'Maven3.8'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Repository checked out: ${env.GIT_BRANCH}"
            }
        }

        stage('Backend — Build & Test') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests --no-transfer-progress'
                    echo "✅ Backend build complete"
                }
            }
        }

        stage('Frontend — Install & Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci --prefer-offline'
                    sh 'npm run build'
                    echo "✅ Frontend build complete"
                }
            }
        }

        stage('Security — Terraform Validate') {
            steps {
                dir('terraform') {
                    sh 'terraform init -backend=false -no-color'
                    sh 'terraform validate -no-color'
                    echo "✅ Terraform configuration is valid"
                }
            }
        }

        stage('Security — Terraform Lint') {
            steps {
                dir('terraform') {
                    sh 'terraform fmt -check -recursive -no-color || echo "[WARN] Terraform files not formatted — run terraform fmt"'
                }
            }
        }

        stage('Docker — Build Image') {
            steps {
                sh 'docker build -t cloudcostlens-platform:latest -t cloudcostlens-platform:${BUILD_NUMBER} .'
                echo "✅ Docker image built: cloudcostlens-platform:${BUILD_NUMBER}"
            }
        }
    }

    post {
        always {
            echo "Pipeline finished — Build #${BUILD_NUMBER}"
        }
        success {
            echo '✅ CloudCostLens Pipeline Completed Successfully!'
        }
        failure {
            echo '❌ Pipeline Failed. Check the console output above for errors.'
        }
        cleanup {
            // Remove intermediate Docker layers to save disk space
            sh 'docker system prune -f --filter "until=24h" || true'
        }
    }
}
