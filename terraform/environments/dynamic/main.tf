##############################################################
# Dynamic Environment Entry Point
# Called by backend TerraformService for each deployment
##############################################################

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  # Credentials from environment variables:
  # AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN (optional)
}

##############################################################
# Module selection based on module_type variable
##############################################################

module "web_app" {
  count        = var.module_type == "web_app" ? 1 : 0
  source       = "../../modules/web_app"
  project_name = var.project_name
  environment  = var.environment
  instance_type = var.instance_type
  ami_id       = var.ami_id
}

module "scalable_app" {
  count            = var.module_type == "scalable_app" ? 1 : 0
  source           = "../../modules/scalable_app"
  project_name     = var.project_name
  environment      = var.environment
  instance_type    = var.instance_type
  ami_id           = var.ami_id
  min_size         = var.min_instances
  max_size         = var.max_instances
  desired_capacity = var.desired_instances
}

module "storage_app" {
  count             = var.module_type == "storage_app" ? 1 : 0
  source            = "../../modules/storage_app"
  project_name      = var.project_name
  environment       = var.environment
  enable_cloudfront = var.enable_cloudfront
}
