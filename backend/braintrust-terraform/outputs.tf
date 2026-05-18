###############################################################################
# BrainTrust — Outputs
# These print to console after `terraform apply` — save them!
###############################################################################

output "ec2_public_ip" {
  description = "Elastic IP of the EC2 instance — use this everywhere"
  value       = module.ec2.elastic_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = module.ec2.instance_id
}

output "ssh_command" {
  description = "Ready-to-run SSH command"
  value       = "ssh -i ${var.key_pair_name}.pem ec2-user@${module.ec2.elastic_ip}"
}

output "scp_jar_command" {
  description = "Command to upload the Spring Boot JAR"
  value       = "scp -i ${var.key_pair_name}.pem target/braintrust-container-app-0.0.1-SNAPSHOT.jar ec2-user@${module.ec2.elastic_ip}:/home/ec2-user/"
}

output "api_base_url" {
  description = "Backend API base URL (HTTP — add your domain for HTTPS)"
  value       = "http://${module.ec2.elastic_ip}:8080"
}

output "health_check_url" {
  description = "Spring Boot actuator health endpoint"
  value       = "http://${module.ec2.elastic_ip}:8080/actuator/health"
}

output "swagger_url" {
  description = "Swagger UI URL"
  value       = "http://${module.ec2.elastic_ip}:8080/swagger-ui/index.html"
}

output "next_steps" {
  description = "What to do after terraform apply"
  value = <<-EOT

  ┌─────────────────────────────────────────────────────────────┐
  │  BrainTrust Infrastructure Created!                         │
  │                                                             │
  │  NEXT STEPS:                                                │
  │  1. Wait ~3 min for EC2 user_data bootstrap to finish      │
  │  2. Build JAR: mvn clean package -DskipTests -pl           │
  │     container-app -am                                       │
  │  3. Upload JAR using the scp_jar_command above             │
  │  4. SSH in and run: docker-compose up -d                   │
  │  5. Deploy frontend to Vercel with API URL above           │
  └─────────────────────────────────────────────────────────────┘

  EOT
}
