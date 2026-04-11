# ☀️ CloudCostLens: Intelligent AWS Architecture & Provisioning

**Streamlining Cloud Infrastructure with Decision Intelligence and Automated Provisioning.**

---

## 🎯 Overview
CloudCostLens is a professional-grade **DevSecOps Platform** designed to bridge the gap between architectural design and real-world provisioning. It assists architects in making data-driven decisions by recommending optimized AWS architectures based on traffic, budget, and operational constraints.

Unlike static calculators, CloudCostLens provides **Infrastructure as Code (IaC) Automation**, allowing users to provision the recommended architecture directly onto AWS with a single click, managed by a robust Terraform automation engine.

---

## ✨ Key Features

### 🧠 Intelligent Recommendation Engine
- **Rule-Based Decision Logic**: Transparent, explainable architecture scoring based on cost, scalability, and operational effort.
- **Budget Guardrails**: Proactive validation to ensure designs stay within your financial limits (including a $1 minimum safety check).
- **Service Optimization**: Automatically selects between S3 static hosting, EC2 instances, or Scalable ASG/ALB clusters based on traffic requirements.

### 🏗️ Automated Provisioning (IaC)
- **Terraform Integration**: Real-time generation and execution of Terraform configurations.
- **Process Management**: Native support for `Init → Plan → Apply → Destroy` lifecycles with a manual **Stop/Cancel** feature.
- **Resource Inspector**: Deep-visibility into provisioned AWS resources (IDs, IPs, and ARNs) immediately post-deployment.

### 🛡️ Safety & Reliability
- **Auto-Destroy Utility**: Intelligent 30-minute scheduled destruction of resources to prevent runaway cloud costs.
- **Pre-flight Checks**: Automated verification of Terraform installations and AWS credentials before provisioning starts.
- **JWT Security**: Role-based access control ensuring only authorized Admins can trigger cloud mutations.

---

## 🏗️ Architecture & Stack
The application is built using a modern **Reactive Full-Stack Architecture**:

- **Frontend**: React 18, Vite, CSS3 (Modular Design System).
- **Backend**: Spring Boot 3.2, Java 21, Maven.
- **Database**: **Supabase (PostgreSQL)** (Production-grade, cloud-hosted persistence).
- **Automation**: Terraform CLI (Process management via Java `ProcessBuilder`).
- **Orchestration**: Docker & Docker Compose.
- **Documentation**: OpenAPI 3 / Swagger UI.

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Docker & Docker Compose** (Recommended)
- **OR** Local Installation:
    - **Java 17+** (Adoptium recommended)
    - **Node.js 18+**
    - **Terraform 1.5+** (Must be in your system PATH)
- **AWS Credentials**: IAM User with programmatic access keys.

### ⚙️ Configuration (.env)
Create a `.env` file in the root directory (or update the provided one):
```env
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Database (Supabase)
SUPABASE_DB_PASSWORD=your_db_password

# Platform Security
ADMIN_PASSWORD=admin123
JWT_SECRET=your_complex_secret_here
```

### ⚡ Docker Quick Start (Recommended)
The easiest way to run the entire platform is using Docker Compose. This automatically installs Terraform inside the container for you.

1. **Build & Start**:
   ```bash
   docker compose up --build -d
   ```
2. **Access**:
   - **Frontend Dashboard**: `http://localhost:5173`
   - **Backend API**: `http://localhost:8080`
   - **API Docs**: `http://localhost:8080/swagger-ui/index.html`

### ⚡ Local Start (Alternative)
1. **Start Backend**: Double-click `start-backend.bat`.
2. **Start Frontend**: Double-click `start-frontend.bat`.

---

## 📂 Project Structure
```
CloudCostLens/
├── backend/            # Spring Boot (API & Decision Engine)
├── frontend/           # React (Dashboard & Visualizer)
├── terraform/          # Modular IaC Templates
│   ├── modules/        # AWS Application Modules
│   ├── environments/   # Dynamic templates
│   └── workspaces/     # Deployment state persistence
├── docker-compose.yml  # Stack orchestration
└── README.md           # This document
```

---

## 📝 Project Identity
- **Examiner Note**: This project uses **Supabase (PostgreSQL)** as its primary database for cloud-persistent history.
- **Infrastructure**: The platform uses a **Dockerized Terraform engine** to ensure environment consistency across all systems.
- **Cost Warning**: This application provisions **Real AWS Resources**. Always ensure your `AWS_REGION` is set correctly and the "Auto-Destroy" task is allowed to run to completion.

---
**Disclaimer**: CloudCostLens is not affiliated with Amazon Web Services. All AWS service names and trademarks are the property of Amazon.com, Inc.
