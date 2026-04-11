output "public_ip" {
  description = "Public IP address of the web server"
  value       = aws_instance.web.public_ip
}

output "public_dns" {
  description = "Public DNS of the web server"
  value       = aws_instance.web.public_dns
}

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.web.id
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.web_sg.id
}

output "endpoint_url" {
  description = "HTTP endpoint URL"
  value       = "http://${aws_instance.web.public_dns}"
}
