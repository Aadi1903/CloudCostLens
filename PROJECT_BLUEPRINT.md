# Project Blueprint: CloudCostLens — DevSecOps Platform

This document serves as the comprehensive technical "Source of Truth" for the CloudCostLens platform. It details the architecture, core logic, and implementation details for future maintenance or AI-assisted development.

---

## 1. Project Overview
**CloudCostLens** is a DevSecOps platform that helps teams determine the most cost-effective AWS architecture based on technical requirements (Application Type, Traffic, Budget, etc.). It generates a validated recommendation, provides a Terraform plan, and allows for secure, 30-minute transient deployments with real-time process monitoring and resource inspection.

---

## 2. Technical Stack
- **Frontend**: React 18, Vite, React Router, Recharts, Context API.
- **Backend**: Java 21+, Spring Boot 3.2, Spring Security (JWT-based), JPA/Hibernate.
- **Database**: **Supabase (PostgreSQL)** (Production-grade, cloud-hosted persistence. Replaced local SQLite to ensure data persistence across different environments and containerized deployments).
- **Automation**: Terraform CLI (Process management via Java `ProcessBuilder` with active process tracking).
- **Security**: JJWT (Tokens), BCrypt (Hashing), Custom JWT Interceptors (Redirection/Expiry handling).

---

## 3. Core Logic & Algorithms

### A. Decision Engine (`DecisionEngineService`)
Uses a weighted scoring algorithm to select the best AWS services:
- **Filtering**: Filters by `applicationType` and `operationalEffort`.
- **Weightage**: Cost (40%), Scalability (30%), Ops Preference (20%), Use Case (10%).
- **Validation**: Enforces a $1 minimum budget and validates against available cloud instance tiers.

### B. Cost Estimation (`CostEstimationService`)
Calculates monthly AWS billing estimates based on pricing data in the `knowledgeBase`.
- **Budget Guardrails**: Proactively flags recommendations exceeding the user's budget.
- **Alternatives**: Automatically suggests cost-optimized alternatives if the primary architecture is too expensive.

### C. Terraform Automation (`TerraformService`)
- **Workspace Isolation**: Creates unique directories in `terraform/workspaces/` for every deployment ID.
- **Pre-flight Checks**: Proactively verifies that `terraform` binary is installed and AWS credentials are valid before starting.
- **Process Management**: 
    - Registers every active deployment in an `activeProcesses` Map.
    - Supports **Forced Termination** (Stop Button) to kill running CLI processes safely.
- **Resource Parsing**: Queries `terraform.tfstate` post-deployment to list specific AWS provisioned resources (IDs, IPs, DNS).

---

## 4. Security & Error Handling

### A. Authentication & RBAC
- **Guest**: Public access to recommendations, history, and status polling.
- **Admin**: Exclusive access to `POST /api/deploy/**` (Start, Stop, and Destroy actions).
- **JWT Expire Handling**: Frontend `handleResponse` interceptor detects `401 Unauthorized`, clears local storage, and redirects to `/login?expired=true`.

### B. Global Exception Handling
- **Structured Errors**: `GlobalExceptionHandler` ensures all backend failures (validation errors, terraform faults) return a consistent JSON object: `{ "error": "Clear message here..." }`.

---

## 5. UI/UX Features

### A. Log Monitor (`LogViewer`)
- **Smart Scrolling**: Implements "Sticky Scroll" logic—it auto-scrolls to the bottom ONLY if the user is already at the bottom. Allows users to manually scroll up and inspect past logs without being "pulled" down by new entries.

### B. Resource Inspector
- **Post-Deploy**: Primary button to "Inspect Running Resources" with smooth-scroll navigation.
- **History View**: Historical "Audit Eye" (🔍) button in the deployment table that live-fetches resource lists for past deployments.

### C. Safety (Auto-Destroy)
- **Mechanism**: `TaskScheduler` queues a `runDestroy` task exactly **30 minutes** after a successful `terraform apply`.

---

## 6. Project Structure

### Backend: `com.awsplanner`
- `.config`: Security, JWT, CORS, Scheduling, and Documentation (Swagger).
- `.controller`: Auth, Recommendation, and Deployment management.
- `.service`: The "Brain" (Decision Engine, Cost, Terraform Automation).
- `.model`: Persistence entities and Validation DTOs (e.g., `LoginRequest`).

### Frontend: `src/`
- `/api`: Standardized API wrappers for all cloud operations.
- `/context`: Centralized Auth state.
- `/pages`: Logic-heavy views (Requirements, Dashboard, Status).
- `/components`: Visual cards, diagrams, and terminal viewers.

---

## 7. Logic Flow for Future Modifications
- **Change Rules**: Edit `DecisionEngineService.scoreServices`.
- **Update Pricing**: Update the `knowledgeBase.json` or `CostEstimationService`.
- **New Cloud Modules**: Add Terraform `.tf` files to `terraform/environments/dynamic/` and map them in `TerraformService.resolveModuleType`.

---
*Created for the CloudCostLens DevSecOps Project. Final Polish: 2026-04-11.*
