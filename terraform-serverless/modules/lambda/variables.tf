variable "environment" {
  description = "Environment name"
  type        = string
}

variable "dynamodb_users_table" {
  description = "DynamoDB users table name"
  type        = string
}

variable "dynamodb_messages_table" {
  description = "DynamoDB messages table name"
  type        = string
}

variable "dynamodb_conversations_table" {
  description = "DynamoDB conversations table name"
  type        = string
}

variable "dynamodb_table_arns" {
  description = "List of DynamoDB table ARNs"
  type        = list(string)
}

variable "jwt_secret" {
  description = "JWT secret"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh secret"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL"
  type        = string
}
