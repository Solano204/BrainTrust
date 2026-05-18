###############################################################################
# Module: security
# Creates: EC2 Security Group with minimal required ports
###############################################################################

variable "project"     {}
variable "environment" {}
variable "vpc_id"      {}
variable "my_ip_cidr"  {}

resource "aws_security_group" "ec2" {
  name        = "${var.project}-${var.environment}-ec2-sg"
  description = "BrainTrust EC2 security group"
  vpc_id      = var.vpc_id

  # SSH — only your IP
  ingress {
    description = "SSH from my IP only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
  }

  # HTTP — public (needed for Certbot HTTP-01 challenge + redirect)
  ingress {
    description = "HTTP public"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS — public
  ingress {
    description = "HTTPS public"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Spring Boot direct (useful during dev/testing, can remove in strict prod)
  ingress {
    description = "Spring Boot API direct"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound allowed (for Docker pulls, Certbot, S3, etc.)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-${var.environment}-ec2-sg" }
}

output "ec2_sg_id" { value = aws_security_group.ec2.id }
