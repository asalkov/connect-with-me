# Lambda Function Module

# IAM Role for Lambda
resource "aws_iam_role" "lambda" {
  name_prefix = "${var.environment}-chat-lambda-role-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.environment}-chat-lambda-role"
  }
}

# DynamoDB Access Policy
resource "aws_iam_role_policy" "dynamodb_access" {
  name_prefix = "${var.environment}-dynamodb-access-"
  role        = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = concat(
          var.dynamodb_table_arns,
          [for arn in var.dynamodb_table_arns : "${arn}/index/*"]
        )
      }
    ]
  })
}

# CloudWatch Logs Policy
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Placeholder Lambda function (will be updated with actual code)
data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/lambda_placeholder.zip"

  source {
    content  = <<-EOT
      exports.handler = async (event) => {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            message: 'Chat API - Deploy your backend code to activate',
            timestamp: new Date().toISOString()
          })
        };
      };
    EOT
    filename = "index.js"
  }
}

# Lambda Function
resource "aws_lambda_function" "api" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.environment}-chat-api"
  role            = aws_iam_role.lambda.arn
  handler         = "dist/lambda.handler"
  source_code_hash = data.archive_file.lambda_placeholder.output_base64sha256
  runtime         = "nodejs18.x"
  memory_size     = 512
  timeout         = 30

  environment {
    variables = {
      NODE_ENV                     = "production"
      JWT_SECRET                   = var.jwt_secret
      JWT_EXPIRES_IN               = "7d"
      JWT_REFRESH_SECRET           = var.jwt_refresh_secret
      JWT_REFRESH_EXPIRES_IN       = "30d"
      FRONTEND_URL                 = var.frontend_url
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
      DYNAMODB_USERS_TABLE         = var.dynamodb_users_table
      DYNAMODB_MESSAGES_TABLE      = var.dynamodb_messages_table
      DYNAMODB_CONVERSATIONS_TABLE = var.dynamodb_conversations_table
    }
  }

  tags = {
    Name = "${var.environment}-chat-api"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.environment}-chat-lambda-logs"
  }
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*/*/*/*"
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
