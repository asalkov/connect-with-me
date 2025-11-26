output "frontend_record_name" {
  description = "Frontend DNS record name"
  value       = aws_route53_record.frontend.name
}

output "api_record_name" {
  description = "API DNS record name"
  value       = aws_route53_record.api.name
}

output "hosted_zone_id" {
  description = "Route53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}
