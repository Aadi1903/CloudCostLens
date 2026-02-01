terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Conceptual app server
resource "aws_instance" "cloudcostlens_app" {
  ami           = "ami-0dummyvalue"
  instance_type = "t2.micro"

  tags = {
    Name = "cloudcostlens-app"
    Project = "CloudCostLens"
  }
}

# Storage for billing data
resource "aws_s3_bucket" "billing_data" {
  bucket = "cloudcostlens-billing-data-demo"

  tags = {
    Project = "CloudCostLens"
  }
}

# IAM role (read-only billing access – conceptual)
resource "aws_iam_role" "billing_read_role" {
  name = "cloudcostlens-billing-read-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}
