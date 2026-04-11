##############################################################
# Outputs — expose module outputs to backend parsing
##############################################################

output "public_ip" {
  description = "Public IP or DNS of deployed resource"
  value = (
    var.module_type == "web_app"      ? (length(module.web_app) > 0 ? module.web_app[0].public_ip : "") :
    var.module_type == "scalable_app" ? (length(module.scalable_app) > 0 ? module.scalable_app[0].public_ip : "") :
    var.module_type == "storage_app"  ? (length(module.storage_app) > 0 ? module.storage_app[0].public_ip : "") :
    ""
  )
}

output "endpoint_url" {
  description = "Accessible endpoint URL"
  value = (
    var.module_type == "web_app"      ? (length(module.web_app) > 0 ? module.web_app[0].endpoint_url : "") :
    var.module_type == "scalable_app" ? (length(module.scalable_app) > 0 ? module.scalable_app[0].endpoint_url : "") :
    var.module_type == "storage_app"  ? (length(module.storage_app) > 0 ? module.storage_app[0].endpoint_url : "") :
    ""
  )
}

output "module_type" {
  description = "The deployed module type"
  value       = var.module_type
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "aws_region" {
  description = "Deployed region"
  value       = var.aws_region
}
