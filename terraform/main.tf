##############################################################
# Root Terraform Configuration
# Used for: terraform validate in CI/CD (Jenkinsfile)
# NOT used for actual deployments — those use
# terraform/environments/dynamic/ (via TerraformService.java)
##############################################################

terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Provider configured via env vars:
#   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION
provider "aws" {
  region = var.aws_region
}
