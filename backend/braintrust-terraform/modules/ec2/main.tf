###############################################################################
# Module: ec2
# Creates: EC2 instance, Elastic IP, and user_data bootstrap script
# Bootstrap installs: Docker, Docker Compose, Nginx, Certbot
# Also writes docker-compose.yml and .env to the instance automatically
###############################################################################

variable "project"            {}
variable "environment"        {}
variable "instance_type"      {}
variable "key_pair_name"      {}
variable "subnet_id"          {}
variable "security_group_ids" { type = list(string) }
variable "db_name"            {}
variable "db_username"        {}
variable "db_password"        { sensitive = true }
variable "jwt_secret"         { sensitive = true }
variable "aws_region"         {}

# ── AMI: Amazon Linux 2023 (latest) ──────────────────────────────────────────
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ── EC2 Instance ──────────────────────────────────────────────────────────────
resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.security_group_ids

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30  # Free Tier max
    delete_on_termination = true
    encrypted             = true
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    db_name     = var.db_name
    db_username = var.db_username
    db_password = var.db_password
    jwt_secret  = var.jwt_secret
    aws_region  = var.aws_region
  }))

  # Ensure instance replaces (not just updates) if user_data changes
  user_data_replace_on_change = false

  tags = { Name = "${var.project}-${var.environment}-app-server" }
}

# ── Elastic IP ────────────────────────────────────────────────────────────────
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = { Name = "${var.project}-${var.environment}-eip" }

  depends_on = [aws_instance.app]
}

# ── Outputs ───────────────────────────────────────────────────────────────────
output "instance_id"  { value = aws_instance.app.id }
output "elastic_ip"   { value = aws_eip.app.public_ip }
output "private_ip"   { value = aws_instance.app.private_ip }
