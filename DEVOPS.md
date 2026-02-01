## DevOps & Cloud Design – CloudCostLens
This project includes DevOps practices to demonstrate cloud deployment and automation concepts without incurring cloud costs.

### Infrastructure as Code
- Terraform is used to define AWS infrastructure such as compute, storage, and IAM roles.
- Only `terraform validate` and `terraform plan` are used to avoid provisioning resources.

### CI/CD Automation
- GitHub Actions automatically validates infrastructure code and runs cost-analysis logic on every push.

### Design Philosophy
- The setup focuses on automation and cloud design rather than paid cloud services.
