variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "module_type" {
  description = "Which module to deploy: web_app, scalable_app, storage_app"
  type        = string
  validation {
    condition     = contains(["web_app", "scalable_app", "storage_app"], var.module_type)
    error_message = "module_type must be one of: web_app, scalable_app, storage_app"
  }
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "cloudcostlens"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID to use for EC2 instances"
  type        = string
  default     = "ami-0c02fb55956c7d316"
}

variable "min_instances" {
  description = "Minimum instances for ASG"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum instances for ASG"
  type        = number
  default     = 4
}

variable "desired_instances" {
  description = "Desired instances for ASG"
  type        = number
  default     = 2
}

variable "enable_cloudfront" {
  description = "Enable CloudFront for storage module"
  type        = bool
  default     = false
}
