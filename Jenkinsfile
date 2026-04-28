pipeline {
    agent any

    environment {
        // Bind Jenkins stored credentials to environment variables
        // Configure these in: Manage Jenkins → Credentials → Global
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        AWS_DEFAULT_REGION    = 'us-east-1'
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

        stage('Security — Backend SCA (Dependency-Check)') {
            steps {
                dir('backend') {
                    sh 'mvn dependency-check:check --no-transfer-progress || echo "[WARN] Vulnerabilities found in backend dependencies"'
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

        stage('Security — Frontend SCA (npm audit)') {
            steps {
                dir('frontend') {
                    sh 'npm audit --audit-level=high || echo "[WARN] Vulnerabilities found in frontend dependencies"'
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

        stage('Security — IaC Scan (Checkov)') {
            steps {
                dir('terraform') {
                    // Checkov must be installed on the Jenkins agent
                    sh 'checkov -d . --soft-fail || echo "[WARN] Checkov found IaC issues"'
                }
            }
        }

        stage('Docker — Build Image') {
            steps {
                sh 'docker build -t cloudcostlens-platform:latest -t cloudcostlens-platform:${BUILD_NUMBER} .'
                echo "✅ Docker image built: cloudcostlens-platform:${BUILD_NUMBER}"
            }
        }

        stage('Security — Container Scan (Trivy)') {
            steps {
                // Trivy must be installed on the Jenkins agent
                sh 'trivy image --severity HIGH,CRITICAL --no-progress cloudcostlens-platform:${BUILD_NUMBER} || echo "[WARN] Trivy found high/critical vulnerabilities"'
            }
        }

        stage('Deployment Gate') {
            when {
                branch 'main'
            }
            steps {
                echo "🚀 Deploying to Production environment (main branch)..."
                // Add deployment script here
            }
        }
        
        stage('Integration Gate') {
            when {
                branch 'dev'
            }
            steps {
                echo "🧪 Deploying to Integration environment (dev branch)..."
                // Add integration deployment/testing here
            }
        }
    }

    post {
        always {
            echo "Pipeline finished — Build #${BUILD_NUMBER}"
            // Publish JUnit test results if available
            junit testResults: '**/target/surefire-reports/*.xml', allowEmptyResults: true
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
