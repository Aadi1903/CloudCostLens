output "bucket_name" {
  description = "Name of the created S3 bucket"
  value       = aws_s3_bucket.main.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.main.arn
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain (if enabled)"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.main[0].domain_name : ""
}

output "endpoint_url" {
  description = "Accessible URL (CloudFront or S3 bucket name)"
  value       = var.enable_cloudfront ? "https://${aws_cloudfront_distribution.main[0].domain_name}" : "s3://${aws_s3_bucket.main.id}"
}

output "public_ip" {
  description = "Not applicable for storage; returns bucket name"
  value       = aws_s3_bucket.main.id
}
