variable "project_name" {
  description = "Project name used for tagging resources"
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
  description = "AMI ID for the EC2 instance (Amazon Linux 2)"
  type        = string
  default     = "ami-0c02fb55956c7d316" # us-east-1 Amazon Linux 2
}
