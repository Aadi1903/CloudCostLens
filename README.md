# AWS Service Recommendation & Cost Planning System

A deterministic, rule-based web application that recommends AWS services based on application requirements and budget constraints.

## 🎯 Project Overview

This system helps users choose appropriate AWS services by:
- Accepting application requirements (type, traffic, storage, budget)
- Using deterministic filtering and scoring algorithms
- Providing cost estimates and budget validation
- Suggesting alternative architectures

**Key Principle**: No AI/LLM-based decisions - all recommendations are rule-based, explainable, and repeatable.

## 🏗️ Architecture

```
Frontend (React) ←→ Backend (Spring Boot) ←→ Service Knowledge Base (JSON)
```

### Backend Services
- **Requirement Service**: Validates and normalizes user input
- **Decision Engine Service**: Filters, scores, and ranks AWS services
- **Cost Estimation Service**: Calculates costs and suggests alternatives
- **Service Knowledge Base**: Loads AWS service metadata and pricing

### Frontend Pages
- **Landing Page**: Hero section and problem/solution overview
- **How It Works**: Visual explanation of decision process
- **Requirement Form**: User input collection
- **Recommendation Page**: Display recommended architecture
- **About Page**: Project information and limitations

## 📋 Prerequisites

### Backend
- Java 17 or higher
- Maven 3.6+ (or use included Maven wrapper)

### Frontend
- Node.js 16+ and npm

## 🚀 Getting Started

### 1. Start the Backend

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
├── backend/
│   ├── src/main/java/com/awsplanner/
│   │   ├── AwsPlannerApplication.java
│   │   ├── controller/
│   │   │   └── RecommendationController.java
│   │   ├── service/
│   │   │   ├── RequirementService.java
│   │   │   ├── DecisionEngineService.java
│   │   │   └── CostEstimationService.java
│   │   ├── model/
│   │   │   ├── UserRequirement.java
│   │   │   ├── AwsService.java
│   │   │   ├── ServiceScore.java
│   │   │   ├── Recommendation.java
│   │   │   └── ...
│   │   ├── repository/
│   │   │   └── ServiceKnowledgeBase.java
│   │   └── config/
│   │       └── CorsConfig.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── data/
│   │       ├── aws-services.json
│   │       └── pricing-table.json
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── HowItWorksPage.jsx
│   │   │   ├── RequirementFormPage.jsx
│   │   │   ├── RecommendationPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   └── CostBreakdown.jsx
│   │   └── api/
│   │       └── recommendationApi.js
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### POST /api/recommend
Get AWS service recommendations

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

**Response**:
```json
{
  "architecture": [
    {
      "service": "AWS Lambda",
      "category": "compute",
      "reason": "Serverless, low operational effort",
      "estimatedCost": 15.0
    }
  ],
  "totalCost": 65.0,
  "budget": 100.0,
  "withinBudget": true,
  "alternatives": [],
  "message": "Architecture fits within your budget!"
}
```

### GET /api/services
Get all supported AWS services

### GET /api/use-cases
Get supported use cases

### GET /api/health
Health check endpoint

## 🎨 Design System

The frontend uses a modern design system with:
- **Fonts**: Inter (body), Poppins (headings)
- **Colors**: Primary (#FF6B35), Secondary (#004E89)
- **Components**: Cards, buttons, forms with consistent styling
- **Responsive**: Mobile-friendly grid layouts

## 🧮 Decision Engine Logic

### Scoring Algorithm
```
Total Score = (Cost Match × 0.4) + (Scalability Match × 0.3) + 
              (Operational Match × 0.2) + (Use Case Match × 0.1)
```

### Decision Flow
1. **Filter**: Remove services that don't match use case or constraints
2. **Score**: Rate each eligible service (0-100 scale)
3. **Rank**: Sort by score and select top service per category
4. **Estimate**: Calculate costs and validate budget

## 📊 Supported AWS Services (17 total)

- **Compute**: EC2, Lambda, ECS, Elastic Beanstalk
- **Storage**: S3, EBS, EFS
- **Database**: RDS, DynamoDB, Aurora
- **Networking**: CloudFront, Route 53, API Gateway
- **Messaging**: SQS, SNS
- **Monitoring**: CloudWatch
- **Security**: IAM

## ⚠️ Limitations

- **Approximate Pricing**: Educational estimates, not actual AWS pricing
- **No Real Provisioning**: Does not deploy actual AWS resources
- **Limited Services**: 17 services, not full AWS catalog
- **Target Audience**: Small to medium workloads
- **Deterministic Only**: Rule-based logic may not cover all edge cases

## 🛠️ Technology Stack

- **Backend**: Java 17, Spring Boot 3.2.1, Maven
- **Frontend**: React 18, Vite, React Router
- **Data**: JSON-based service metadata and pricing

## 📝 License

Educational project - not for production use

## 🤝 Contributing

This is an educational project demonstrating deterministic decision-making for AWS service selection.

---

**Note**: This tool is not affiliated with Amazon Web Services. All AWS service names and trademarks belong to Amazon.
