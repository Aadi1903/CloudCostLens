# ☁️ CloudCostLens

**An Intelligent AWS Architecture Advisor with Automated Provisioning, Built on a Full DevSecOps Pipeline.**

CloudCostLens isn't just another cloud calculator. It's a decision-support platform that recommends optimized AWS architectures based on your traffic, budget, and operational needs — and then provisions them for you with a single click. The entire project is wrapped in a production-grade DevSecOps lifecycle, from automated security scanning to real-time observability.

---

## 🎯 What This Project Does

At its core, CloudCostLens solves a common problem: **choosing the right AWS architecture is hard.** There are dozens of services, pricing models, and scaling strategies. This platform takes your requirements as input and outputs a scored, cost-estimated architecture recommendation. If you approve it, the platform will provision the infrastructure on AWS using Terraform — no manual console clicks required.

### Key Capabilities

| Feature | Description |
|---|---|
| **Intelligent Recommendations** | A rule-based decision engine scores AWS services based on cost, scalability, and operational effort. |
| **One-Click Provisioning** | Generates and executes Terraform configurations in real-time (`Init → Plan → Apply → Destroy`). |
| **Auto-Destroy Safety Net** | A background scheduler automatically tears down provisioned resources after 2 hours to prevent surprise bills. |
| **Budget Guardrails** | Validates designs against your financial limits before any infrastructure is created. |
| **Resource Inspector** | Post-deployment visibility into provisioned AWS resources (IDs, IPs, ARNs). |
| **JWT Authentication** | Role-based access control ensuring only authorized users can trigger cloud changes. |

---

## 🏗️ Technology Stack

This project is intentionally built with a diverse, industry-standard stack to demonstrate real-world engineering practices.

### Application Layer
| Component | Technology | Purpose |
|---|---|---|
| Frontend | React 18, Vite, CSS3 | Interactive dashboard and pipeline visualizer |
| Backend | Spring Boot 3.2, Java 21, Maven | REST API, decision engine, and Terraform orchestrator |
| Database | Supabase (PostgreSQL) | Cloud-hosted persistence for auth and deployment history |
| IaC Engine | Terraform CLI | Automated cloud provisioning via `ProcessBuilder` |

### DevSecOps & Infrastructure Layer
| Component | Technology | Purpose |
|---|---|---|
| CI/CD | Jenkins (Dockerized) | Automated build, test, scan, and deploy pipeline |
| Container Registry | Docker Hub | Versioned image storage and distribution |
| Orchestration | Kubernetes (Minikube) | Container orchestration with self-healing and scaling |
| Monitoring | Prometheus + Grafana | Real-time metrics collection and visualization |
| Config Management | Ansible | Automated server provisioning and security hardening |

### Security Scanning (Integrated in Pipeline)
| Tool | Type | What It Checks |
|---|---|---|
| Semgrep | SAST | Source code for security anti-patterns |
| OWASP Dependency-Check | SCA (Backend) | Java dependencies for known CVEs |
| npm audit | SCA (Frontend) | Node.js packages for known vulnerabilities |
| Checkov | IaC Scan | Terraform files for misconfigurations |
| Trivy | Container Scan | Docker images for OS and library vulnerabilities |
| OWASP ZAP | DAST | Running application for injection and XSS flaws |

---

## 🚀 Getting Started

### Prerequisites
- **Docker Desktop** (Required — runs Jenkins, Minikube, and the app containers)
- **kubectl** (For Kubernetes management)
- **Minikube** (Local Kubernetes cluster)
- **AWS Credentials**: IAM User with programmatic access keys

### Configuration

Create a `.env` file in the project root:
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

### Quick Start

**1. Start the Application Stack (Docker Compose):**
```bash
docker compose up --build -d
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080`
- **Swagger Docs**: `http://localhost:8080/swagger-ui/index.html`

**2. Start the Kubernetes Environment:**
```bash
minikube start
kubectl apply -f k8s/
```

**3. Start Jenkins CI/CD:**
```bash
docker-compose up -d
```
- **Jenkins**: `http://localhost:8082`

**4. Access Monitoring Dashboards:**
```bash
minikube service grafana-service -n cloudcostlens --url
minikube service prometheus-service -n cloudcostlens --url
```
- **Grafana Login**: `admin / admin`
- Navigate to **Dashboards → CloudCostLens → JVM Monitoring**

---

## 📂 Project Structure

```
CloudCostLens/
│
├── backend/                          # Spring Boot Application
│   └── src/main/java/com/awsplanner/
│       ├── auth/                     # JWT authentication & login
│       ├── recommendation/           # Decision engine, cost estimation, scoring
│       ├── deployment/               # Terraform lifecycle management
│       ├── config/                   # Security filters, CORS, JWT utilities
│       └── web/                      # SPA route forwarding
│
├── frontend/                         # React + Vite Dashboard
│
├── terraform/                        # Infrastructure as Code
│   ├── modules/
│   │   ├── scalable_app/             # ALB + ASG (high-traffic)
│   │   ├── web_app/                  # Standalone EC2 (low-traffic)
│   │   └── storage_app/             # S3 bucket (static assets)
│   └── environments/                 # Dynamic variable templates
│
├── k8s/                              # Kubernetes Manifests
│   ├── deployment.yaml               # Application deployment
│   ├── service.yaml                  # ClusterIP/NodePort services
│   ├── configmap.yaml                # Environment configuration
│   ├── secret.yaml                   # Sensitive credentials
│   ├── prometheus.yaml               # Prometheus server + scrape config
│   └── grafana.yaml                  # Grafana + auto-provisioned dashboards
│
├── ansible/                          # Configuration Management
│   ├── inventory.ini                 # Target server definitions
│   ├── playbook.yml                  # Main orchestration playbook
│   └── roles/
│       ├── common/                   # OS updates, timezone, basic tools
│       ├── docker/                   # Docker & Docker Compose installation
│       └── security/                 # UFW firewall hardening
│
├── Jenkinsfile                       # Full CI/CD pipeline definition
├── Dockerfile                        # Multi-stage application image
├── Jenkins.Dockerfile                # Custom Jenkins agent with tools
├── docker-compose.yml                # Local development orchestration
└── ARCHITECTURE.md                   # Detailed system design document
```

---

## 🔄 CI/CD Pipeline

The Jenkins pipeline automates the entire software delivery lifecycle. Every commit triggers the following stages:

```
Checkout → SAST (Semgrep) → Build Backend → SCA (Dependency-Check) →
Build Frontend → SCA (npm audit) → Terraform Validate → IaC Scan (Checkov) →
Docker Build → Push to Registry → Container Scan (Trivy) →
Deploy to Kubernetes → DAST (OWASP ZAP)
```

### Branching Strategy
| Branch | Purpose | Pipeline Behavior |
|---|---|---|
| `main` | Production-ready code | Full pipeline + Kubernetes deployment |
| `dev` | Integration testing | Full pipeline + DAST scanning |
| `feature/*` | Active development | Created from `dev`, merged via PR |

---

## 📊 Monitoring & Observability

The platform uses a **Prometheus → Grafana** observability stack deployed within the Kubernetes cluster.

### What We Monitor
| Metric Category | Examples |
|---|---|
| **JVM Health** | Heap/Non-heap memory, garbage collection, loaded classes |
| **Application Performance** | HTTP request rate, error rate (4xx/5xx), response times |
| **System Resources** | CPU usage (process vs. system), thread states |
| **Database Connections** | HikariCP pool (active, idle, pending connections) |

### How It Works
1. **Spring Boot Actuator** exposes metrics at `/actuator/prometheus` using Micrometer.
2. **Prometheus** scrapes these metrics every 15 seconds from within the cluster.
3. **Grafana** visualizes them on an auto-provisioned dashboard (no manual setup needed).

---

## 🔧 Infrastructure Automation (Ansible)

Ansible automates the setup of production servers. Instead of manually installing Docker, configuring firewalls, and setting up environments on every new server, a single command handles everything:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

### Roles
| Role | What It Does |
|---|---|
| `common` | Updates packages, installs essential tools (git, curl, htop), sets timezone |
| `docker` | Installs Docker Engine and Docker Compose from official repositories |
| `security` | Configures UFW firewall — allows only SSH, HTTP, HTTPS, and Grafana |

---

## ⚡ Performance & Scalability

CloudCostLens is engineered for high-concurrency cloud environments. We use **k6** to validate system stability under stress.

### Load Testing Summary
| Metric | Result |
|---|---|
| **Peak Throughput** | ~1,216 requests/second |
| **Max Concurrent Users** | 1,000 VUs (Stable) |
| **Average Latency** | ~791ms (under load) |
| **Failure Rate** | < 1.4% at peak |

The system demonstrated stable performance for up to 1,000 concurrent users on Render-hosted infrastructure. Detailed stress test reports and bottleneck analysis can be found in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🛡️ Security Considerations

- **Actuator endpoints** are whitelisted in `SecurityConfig.java` for Prometheus scraping but are not exposed externally.
- **JWT tokens** are required for all mutation operations (deployments, configuration changes).
- **Terraform state** is stored locally in persistent volumes — not committed to version control.
- **Docker images** are scanned for vulnerabilities before being pushed to the registry.
- **.env files** containing credentials are excluded from Git via `.gitignore`.

---

## 📝 Notes

- **Database**: This project uses **Supabase (PostgreSQL)** as its primary database for cloud-persistent history.
- **Cost Warning**: This application provisions **real AWS resources**. Always ensure your `AWS_REGION` is set correctly and allow the Auto-Destroy scheduler to run to completion.
- **Local Development**: Ensure Docker Desktop is running before starting Minikube or any containerized services.

---

**Disclaimer**: CloudCostLens is not affiliated with Amazon Web Services. All AWS service names and trademarks are the property of Amazon.com, Inc.
