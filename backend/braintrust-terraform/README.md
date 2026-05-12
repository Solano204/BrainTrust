# BrainTrust — Terraform Infrastructure

Provisions the full AWS infrastructure for BrainTrust:
**EC2 (t3.micro) + S3 + VPC + Security Groups + Elastic IP + IAM Role**

## What Gets Created

| Resource | Details |
|---|---|
| VPC | 10.0.0.0/16 with public subnet |
| EC2 t3.micro | Amazon Linux 2023, 30GB gp3 encrypted |
| Elastic IP | Static IP that survives reboots |
| Security Group | SSH (your IP only), HTTP/HTTPS/8080 public |
| S3 Bucket | Versioning + SSE + CORS enabled |
| IAM Role | EC2 → S3 access (no hardcoded credentials) |

## Prerequisites

1. [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.6
2. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configured (`aws configure`)
3. An existing EC2 Key Pair in AWS Console → EC2 → Key Pairs

## Usage

### 1. Copy and fill in tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Fill in your values
```

Get your IP for SSH access:
```bash
curl -s ifconfig.me
# Paste result as: my_ip_cidr = "X.X.X.X/32"
```

### 2. Initialize and deploy

```bash
terraform init
terraform plan     # Review what will be created
terraform apply    # Type 'yes' to confirm
```

### 3. After apply — note the outputs

```
ec2_public_ip    = "X.X.X.X"         ← your server IP
ssh_command      = "ssh -i ..."       ← ready to run
scp_jar_command  = "scp -i ..."       ← ready to run
s3_bucket_name   = "braintrust-..."  ← use in NEXT_PUBLIC_*
health_check_url = "http://..."       ← test after deploy
```

### 4. Upload and start the app

```bash
# Build JAR
mvn clean package -DskipTests -pl container-app -am

# Upload (use scp_jar_command from terraform output)
scp -i braintrust-key.pem target/braintrust-container-app-0.0.1-SNAPSHOT.jar ec2-user@<IP>:/home/ec2-user/

# SSH in (wait 3 min for bootstrap to finish first)
ssh -i braintrust-key.pem ec2-user@<IP>

# Start everything
docker-compose up -d
docker-compose logs -f app
```

### 5. Add SSL (once you have a domain)

```bash
# Point your domain A record to the Elastic IP first, then:
sudo certbot --nginx -d api.yourdomain.com

# Update CORS in .env:
nano /home/ec2-user/.env
# CORS_ALLOWED_ORIGINS=https://your-app.vercel.app

docker-compose restart app
```

## Teardown

```bash
terraform destroy  # Destroys ALL resources — including data!
```

> ⚠️ This deletes your S3 bucket, EC2 instance, and Elastic IP. Make backups first.
