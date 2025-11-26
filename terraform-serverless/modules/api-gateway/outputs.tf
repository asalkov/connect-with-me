output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}

output "api_gateway_url" {
  description = "API Gateway default URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "api_gateway_domain_name" {
  description = "API Gateway custom domain name"
  value       = length(aws_apigatewayv2_domain_name.main) > 0 ? aws_apigatewayv2_domain_name.main[0].domain_name_configuration[0].target_domain_name : ""
}

output "api_gateway_zone_id" {
  description = "API Gateway custom domain hosted zone ID"
  value       = length(aws_apigatewayv2_domain_name.main) > 0 ? aws_apigatewayv2_domain_name.main[0].domain_name_configuration[0].hosted_zone_id : ""
}
