# Variables for Serverless Chat Application

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

# Domain Configuration (Optional - leave empty to use AWS default URLs)
variable "domain_name" {
  description = "Root domain name (e.g., example.com). Leave empty to skip custom domain setup."
  type        = string
  default     = ""
}

variable "frontend_domain_name" {
  description = "Frontend domain name (e.g., app.example.com or example.com). Leave empty to use CloudFront URL."
  type        = string
  default     = ""
}

variable "api_domain_name" {
  description = "API domain name (e.g., api.example.com). Leave empty to use API Gateway URL."
  type        = string
  default     = ""
}

# SSL Certificate (Optional - only needed if using custom domains)
variable "certificate_arn" {
  description = "ARN of ACM certificate for HTTPS (must be in us-east-1 for CloudFront). Leave empty if not using custom domains."
  type        = string
  default     = ""
}

# Application Configuration
variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh token secret"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL for CORS configuration"
  type        = string
}

# Lambda Configuration
variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
