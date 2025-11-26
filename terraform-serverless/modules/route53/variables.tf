variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
}

variable "frontend_domain_name" {
  description = "Frontend domain name"
  type        = string
}

variable "api_domain_name" {
  description = "API domain name"
  type        = string
}

variable "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  type        = string
}

variable "api_gateway_domain" {
  description = "API Gateway custom domain name"
  type        = string
}

variable "api_gateway_zone_id" {
  description = "API Gateway custom domain hosted zone ID"
  type        = string
}
