output "app_instance_name" {
  value = aws_instance.cloudcostlens_app.tags["Name"]
}

output "billing_bucket_name" {
  value = aws_s3_bucket.billing_data.bucket
}
