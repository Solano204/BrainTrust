###############################################################################
# BrainTrust Platform — Terraform Root
# Provisions: VPC, Security Group, EC2 (t3.micro), Elastic IP
###############################################################################

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to store state remotely (recommended once you have an S3 bucket)
  # backend "s3" {
  #   bucket = "braintrust-terraform-state"
  #   key    = "prod/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "BrainTrust"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

###############################################################################
# NETWORKING
###############################################################################
module "networking" {
  source = "./modules/networking"

  project     = var.project
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  az          = var.availability_zone
}

###############################################################################
# SECURITY GROUPS
###############################################################################
module "security" {
  source = "./modules/security"

  project     = var.project
  environment = var.environment
  vpc_id      = module.networking.vpc_id
  my_ip_cidr  = var.my_ip_cidr
}

###############################################################################
# EC2 INSTANCE (Spring Boot + PostgreSQL via Docker Compose)
###############################################################################
module "ec2" {
  source = "./modules/ec2"

  project            = var.project
  environment        = var.environment
  instance_type      = var.instance_type
  key_pair_name      = var.key_pair_name
  subnet_id          = module.networking.public_subnet_id
  security_group_ids = [module.security.ec2_sg_id]

  # App config passed to user_data bootstrap script
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  jwt_secret  = var.jwt_secret
  aws_region  = var.aws_region
}
