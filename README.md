# CloudCostLens: AWS Service Recommendation & Cost Planning Tool

A full-stack DevOps portfolio project that recommends AWS architectures based on predefined rules and constraints.

## 🚀 Live Demo
**[Link to Live Demo](https://cloudcostlens.onrender.com)**
*(Note: Initial load may take up to 50s as Render spins up the free tier container)*

## 🎯 Project Overview
CloudCostLens is a tool designed to help developers and architects estimate costs and select appropriate AWS services for their applications. Unlike black-box AI tools, this system uses a transparent, rule-based decision engine to ensure recommendations are explainable and consistent.

The project demonstrates a **Cloud-Native & DevOps-focused** approach, showcasing how to containerize a full-stack application, automate validation with CI, and structure Infrastructure as Code (IaC) for design purposes.

## ✨ Learning Outcomes
This project serves as a practical demonstration of:
- **Full-Stack Containerization**: Packaging React and Spring Boot into a single Docker image for simple deployment.
- **CI Automation**: Using GitHub Actions to validate builds and check Terraform code quality.
- **Infrastructure as Code**: Using Terraform to model cloud resources (Design-only).
- **Cloud Architecture**: Designing scalable serverless and container-based solutions.

## 🏗️ Architecture
The application follows a monolithic container pattern to maximize free-tier hosting efficiency:

```
Frontend (React) ←→ Backend (Spring Boot) ←→ Knowledge Base (JSON)
       |                     |
       └─────────┬───────────┘
                 ↓
          Docker Container
```

- **Frontend**: React (Vite) for the UI.
- **Backend**: Spring Boot 3 for logic and APIs.
- **Deployment**: Both run inside a single Docker container, with the backend serving the frontend static assets.

## 🚀 Deployment & DevOps

### Dockerization
The project uses a multi-stage `Dockerfile` to optimize the image size:
1.  **Build Frontend**: Compiles React code to static assets.
2.  **Build Backend**: Compiles Java Spring Boot application.
3.  **Run**: Packages the JAR (with embedded frontend) into a lightweight OpenJDK image.

### Cloud Deployment (Render)
The application is deployed on **Render** using their Docker runtime. This showcases portability—the exact same container runs locally and in the cloud.

### Continuous Integration (CI)
GitHub Actions is configured to ensure code quality on every push:
- **Build Validation**: Compiles the backend to ensure no compilation errors.
- **Terraform Validation**: Runs `terraform validate` to ensure IaC syntax is correct.

## ☁️ Infrastructure as Code (Terraform)
Terraform is included in the `terraform/` directory to demonstrate **Infrastructure as Design**.
*   **Purpose**: To model what the production infrastructure *would* look like on AWS (ECS, RDS, Load Balancers – conceptual design).
*   **State**: Local-only (No remote state).
*   **Execution**: Used for `terraform plan` and validation only. **No real resources are provisioned** to avoid cloud costs.

## 📋 Prerequisites

### Backend
- Java 17 or higher
- Maven 3.6+ (or use included Maven wrapper)

### Frontend
- Node.js 16+ and npm

Note: In production and demo environments, the application is run as a single Docker container. Separate frontend/backend runs are for local development convenience only.
## 💻 Local Development

### 1. Start the Backend

**Windows Users**: Simply double-click or run the included batch script from the root directory:
```cmd
start-backend.bat
```
*(This script will verify your Java & Maven installation and launch the backend.)*

**Manual Approach (All Platforms)**:
```bash
cd backend

# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Using Maven Wrapper (if Maven not installed)
./mvnw spring-boot:run    # Linux/Mac
mvnw.cmd spring-boot:run  # Windows
```
Backend will start on `http://localhost:8080`

### 2. Start the Frontend

**Windows Users**: Simply double-click or run the included batch script from the root directory:
```cmd
start-frontend.bat
```

**Manual Approach (All Platforms)**:
```bash
cd frontend
npm install  # First time only
npm run dev
```
Frontend will start on `http://localhost:5173`

### 3. Access the Application
Open your browser and navigate to `http://localhost:5173`

## 🧪 Testing the System

### Test Scenario 1: Static Website
- Application Type: Static Website
- Traffic: Low
- Storage: 50 GB
- Database: No
- Operational Effort: Low
- Budget: $20
**Expected**: S3 + CloudFront + IAM

### Test Scenario 2: Backend API
- Application Type: Backend API
- Traffic: Medium
- Storage: 100 GB
- Database: Yes
- Operational Effort: Low
- Budget: $100
**Expected**: Lambda + API Gateway + DynamoDB/RDS + CloudWatch + IAM

### Test Scenario 3: Full-Stack Application
- Application Type: Full-Stack Web Application
- Traffic: High
- Storage: 500 GB
- Database: Yes
- Operational Effort: Medium
- Budget: $200
**Expected**: ECS + RDS + S3 + CloudFront + CloudWatch + IAM

## 📁 Project Structure

```
awsP/
├── backend/            # Spring Boot Application
├── frontend/           # React Application
├── terraform/          # IaC Definitions (Design-only)
├── .github/workflows/  # CI Configurations
├── Dockerfile          # Multi-stage build
└── README.md           # Documentation
```

## 🔧 API Endpoints

### POST /api/recommend
Get AWS service recommendations.

**Request Body**:
```json
{
  "applicationType": "backend-api",
  "traffic": "medium",
  "storageGB": 100,
  "databaseNeeded": true,
  "operationalEffort": "low",
  "monthlyBudget": 100
}
```

### GET /api/services
Get all supported AWS services.

## 🧮 Decision Engine Logic

### Scoring Algorithm
```
Total Score = (Cost Match × 0.4) + (Scalability Match × 0.3) + 
              (Operational Match × 0.2) + (Use Case Match × 0.1)
```

## 📊 Supported AWS Services (17 total)
- **Compute**: EC2, Lambda, ECS, Elastic Beanstalk
- **Storage**: S3, EBS, EFS
- **Database**: RDS, DynamoDB, Aurora
- **Networking**: CloudFront, Route 53, API Gateway
- **Messaging**: SQS, SNS
- **Monitoring**: CloudWatch
- **Security**: IAM

## ⚠️ Limitations
- **Educational Scope**: Designed for portfolio demonstration.
- **No Real AWS Provisioning**: Terraform is for design; no bills are incurred.
- **Approximate Pricing**: Educational estimates, not actual AWS pricing.

## 🛠️ Technology Stack
- **Backend**: Java 17, Spring Boot 3.2.1, Maven
- **Frontend**: React 18, Vite, React Router
- **DevOps**: Docker, GitHub Actions, Terraform
- **Cloud**: Render (Hosting), AWS (Architecture Design)

## 📝 License
Educational project - not for production use.

---
**Note**: This tool is not affiliated with Amazon Web Services. All AWS service names and trademarks belong to Amazon.
