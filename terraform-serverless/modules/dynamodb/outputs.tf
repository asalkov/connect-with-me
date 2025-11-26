output "users_table_name" {
  description = "Users table name"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "Users table ARN"
  value       = aws_dynamodb_table.users.arn
}

output "messages_table_name" {
  description = "Messages table name"
  value       = aws_dynamodb_table.messages.name
}

output "messages_table_arn" {
  description = "Messages table ARN"
  value       = aws_dynamodb_table.messages.arn
}

output "conversations_table_name" {
  description = "Conversations table name"
  value       = aws_dynamodb_table.conversations.name
}

output "conversations_table_arn" {
  description = "Conversations table ARN"
  value       = aws_dynamodb_table.conversations.arn
}

output "table_arns" {
  description = "List of all table ARNs"
  value = [
    aws_dynamodb_table.users.arn,
    aws_dynamodb_table.messages.arn,
    aws_dynamodb_table.conversations.arn
  ]
}
