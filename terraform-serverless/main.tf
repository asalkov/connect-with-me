# Serverless Terraform Configuration for Chat Application
# Cost-optimized for small user bases (5-100 users)

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  # Uncomment to use S3 backend for state management
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "chat-app-serverless/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ChatApp"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "Serverless"
    }
  }
}

# Modules
module "dynamodb" {
  source = "./modules/dynamodb"

  environment = var.environment
}

module "lambda" {
  source = "./modules/lambda"

  environment                  = var.environment
  dynamodb_users_table         = module.dynamodb.users_table_name
  dynamodb_messages_table      = module.dynamodb.messages_table_name
  dynamodb_conversations_table = module.dynamodb.conversations_table_name
  dynamodb_table_arns          = module.dynamodb.table_arns
  jwt_secret                   = var.jwt_secret
  jwt_refresh_secret           = var.jwt_refresh_secret
  frontend_url                 = var.frontend_url
}

module "api_gateway" {
  source = "./modules/api-gateway"

  environment          = var.environment
  lambda_invoke_arn    = module.lambda.function_invoke_arn
  lambda_function_name = module.lambda.function_name
  certificate_arn      = var.certificate_arn
  api_domain_name      = var.api_domain_name
}

module "s3_cloudfront" {
  source = "./modules/s3-cloudfront"

  environment     = var.environment
  domain_name     = var.frontend_domain_name
  certificate_arn = var.certificate_arn
}

module "route53" {
  source = "./modules/route53"
  count  = var.domain_name != "" ? 1 : 0

  environment              = var.environment
  domain_name              = var.domain_name
  frontend_domain_name     = var.frontend_domain_name
  api_domain_name          = var.api_domain_name
  cloudfront_domain        = module.s3_cloudfront.cloudfront_domain_name
  cloudfront_zone_id       = module.s3_cloudfront.cloudfront_zone_id
  api_gateway_domain       = module.api_gateway.api_gateway_domain_name
  api_gateway_zone_id      = module.api_gateway.api_gateway_zone_id
}

# Outputs
output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api_gateway.api_gateway_url
}

output "api_gateway_custom_domain" {
  description = "API Gateway custom domain"
  value       = module.api_gateway.api_gateway_domain_name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.lambda.function_name
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.s3_cloudfront.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.s3_cloudfront.cloudfront_distribution_id
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = module.s3_cloudfront.s3_bucket_name
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    users         = module.dynamodb.users_table_name
    messages      = module.dynamodb.messages_table_name
    conversations = module.dynamodb.conversations_table_name
  }
}

output "deployment_instructions" {
  description = "Next steps for deployment"
  value = <<-EOT
    
    ✅ Serverless infrastructure deployed successfully!
    
    📋 Next Steps:
    
    1. Build and Deploy Backend Lambda:
       cd backend
       npm run build
       zip -r function.zip dist/ node_modules/ package.json
       aws lambda update-function-code \
         --function-name ${module.lambda.function_name} \
         --zip-file fileb://function.zip
    
    2. Deploy Frontend:
       cd frontend
       VITE_API_URL=https://${var.api_domain_name} npm run build
       aws s3 sync dist/ s3://${module.s3_cloudfront.s3_bucket_name}
       aws cloudfront create-invalidation \
         --distribution-id ${module.s3_cloudfront.cloudfront_distribution_id} \
         --paths "/*"
    
    3. Test Endpoints:
       - Frontend: https://${var.frontend_domain_name}
       - API: https://${var.api_domain_name}/health
       - API Gateway: ${module.api_gateway.api_gateway_url}
    
    4. Monitor:
       - Lambda logs: aws logs tail /aws/lambda/${module.lambda.function_name} --follow
       - API Gateway logs: CloudWatch Logs
    
    💰 Estimated Cost: $1-5/month for 5-100 users
    
  EOT
}

output "cost_estimate" {
  description = "Monthly cost estimate"
  value = <<-EOT
    
    💰 Monthly Cost Estimate (5 users):
    
    - API Gateway:     $0.50  (~1,500 requests)
    - Lambda:          $0.20  (minimal compute)
    - DynamoDB:        $0.01  (on-demand)
    - S3 + CloudFront: $0.10  (static hosting)
    - Route53:         $0.50  (hosted zone)
    ─────────────────────────────────────────
    TOTAL:            ~$1.31/month
    
    Scaling estimates:
    - 10 users:   ~$2.50/month
    - 50 users:   ~$10/month
    - 100 users:  ~$18/month
    - 500 users:  ~$75/month
    
  EOT
}
