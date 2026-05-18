###############################################################################
# BrainTrust — Input Variables
###############################################################################

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "braintrust"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "availability_zone" {
  description = "AZ for subnet and EC2"
  type        = string
  default     = "us-east-1a"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ── EC2 ──────────────────────────────────────────────────────────────────────

variable "instance_type" {
  description = "EC2 instance type (t3.micro = Free Tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "key_pair_name" {
  description = "Name of the existing EC2 key pair (must already exist in AWS)"
  type        = string
  # No default — must be provided in terraform.tfvars
}

variable "my_ip_cidr" {
  description = "Your local machine IP in CIDR notation for SSH access (e.g. 1.2.3.4/32)"
  type        = string
  # No default — must be provided. Run: curl -s ifconfig.me
}

# ── Application Secrets ──────────────────────────────────────────────────────
# IMPORTANT: Never commit terraform.tfvars to Git — add it to .gitignore

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "braintrust_db"
}

variable "db_username" {
  description = "PostgreSQL username"
  type        = string
  default     = "braintrust_user"
}

variable "db_password" {
  description = "PostgreSQL password (keep this secret)"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret (min 256-bit / 32 chars)"
  type        = string
  sensitive   = true
}
