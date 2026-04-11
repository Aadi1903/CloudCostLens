variable "project_name" {
  description = "Project name"
  type        = string
  default     = "cloudcostlens"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "enable_cloudfront" {
  description = "Whether to create a CloudFront distribution in front of S3"
  type        = bool
  default     = false
}
