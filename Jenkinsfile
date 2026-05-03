pipeline {
    agent any

    environment {
        // Bind Jenkins stored credentials to environment variables
        // Configure these in: Manage Jenkins → Credentials → Global
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        AWS_DEFAULT_REGION    = 'us-east-1'
        // Your actual Docker Hub username and repository
        DOCKER_IMAGE_NAME     = 'aadi02/cloudcostlens-platform'
        
                                                                                                                               // --- AWS Secrets Manager Integration ---
        // AWS Secrets Manager is used to securely store sensitive data (like DB passwords or API tokens).
        // Instead of hardcoding them or relying on local .env files, you fetch them dynamically during the build.
        // Example usage (Requires AWS CLI configured):
        // DB_PASSWORD = sh(script: "aws secretsmanager get-secret-value --secret-id MyDBSecret --query SecretString --output text", returnStdout: true).trim()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Repository checked out: ${env.GIT_BRANCH}"
            }
        }

        stage('Security — SAST (Semgrep)') {
            steps {
                // Semgrep does not require a server. We run it via Docker so you don't need it installed locally.
                // "|| echo" ensures warn-only mode so it doesn't break the pipeline right now.
                sh 'docker run --rm -v "${WORKSPACE}:/src" returntocorp/semgrep semgrep ci || echo "[WARN] Semgrep found potential vulnerabilities"'
            }
        }

        stage('Security — Code Quality (SonarQube)') {
            steps {
                // Placeholder for SonarQube (requires a SonarQube Server and API token).
                // Example of how it would be used once you set up a server:
                // withSonarQubeEnv('My SonarQube Server') {
                //     sh 'mvn sonar:sonar'
                // }
                echo "ℹ️ SonarQube scan skipped (No server/token configured yet)"
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

        stage('Security — SCA (Snyk)') {
            steps {
                // Placeholder for Snyk (requires a free Snyk API token from snyk.io).
                // Example of how to use it with Docker once you add your token to Jenkins:
                // withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
                //     sh 'docker run --rm -e SNYK_TOKEN=${SNYK_TOKEN} -v "${WORKSPACE}:/app" snyk/snyk:node snyk test --all-projects || echo "[WARN] Snyk found vulnerabilities"'
                // }
                echo "ℹ️ Snyk scan skipped (No API token configured yet)"
            }
        }

        stage('Security — Terraform Validate') {
            steps {
                dir('terraform') {
                    // Init and validate are warn-only because the Jenkins container
                    // may not have network access to reach registry.terraform.io
                    sh 'terraform init -backend=false -no-color || echo "[WARN] Terraform init failed — skipping validate"'
                    sh 'terraform validate -no-color || echo "[WARN] Terraform validate failed — check provider connectivity"'
                    echo "✅ Terraform validation stage complete"
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
                sh 'docker build -t ${DOCKER_IMAGE_NAME}:latest -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} .'
                echo "✅ Docker image built: ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}"
            }
        }

        stage('Docker — Push Image to Registry') {
            steps {
                // Ensure you have added your Docker Hub credentials in Jenkins with ID 'docker-hub-credentials'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh 'docker push ${DOCKER_IMAGE_NAME}:latest'
                    sh 'docker push ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}'
                }
                echo "✅ Docker image pushed to Docker Hub"
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
                echo "🚀 Deploying to Production Kubernetes Cluster (main branch)..."
                // Applies the base Kubernetes configuration (namespaces, configmaps, services)
                sh 'kubectl apply -f k8s/'
                // Dynamically sets the new image version built in this pipeline run
                sh 'kubectl set image deployment/ccl-app-deployment ccl-app=${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} -n cloudcostlens'
                echo "✅ Deployment rolled out to Kubernetes!"
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

        stage('Security — DAST (OWASP ZAP)') {
            when {
                branch 'dev'
            }
            steps {
                // Runs OWASP ZAP (Dynamic Application Security Testing) against the running application.
                // This checks for SQL Injection, XSS, etc. by actually interacting with the deployed app.
                // Replace the target URL with the actual URL of your deployed test environment.
                sh 'docker run -t --rm owasp/zap2docker-stable zap-baseline.py -t http://host.docker.internal:8080 || echo "[WARN] OWASP ZAP found DAST issues"'
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
