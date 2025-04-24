variable "client_id" {
  description = "Identificador único do cliente"
  type        = string
}

variable "environment" {
  description = "Ambiente (prod, dev, staging)"
  type        = string
}

variable "region" {
  description = "Região AWS para implantar o backup vault"
  type        = string
  default     = "us-east-1"
}

variable "kms_key_arn" {
  description = "ARN da chave KMS para criptografia (opcional)"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags para recursos AWS"
  type        = map(string)
  default     = {}
}

resource "aws_backup_vault" "client_vault" {
  name        = "${var.client_id}_${var.environment}_vault"
  kms_key_arn = var.kms_key_arn
  tags        = merge(
    var.tags,
    {
      Name        = "${var.client_id}_${var.environment}_vault"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  )
}

output "backup_vault_id" {
  description = "ID do AWS Backup Vault criado"
  value       = aws_backup_vault.client_vault.id
}

output "backup_vault_arn" {
  description = "ARN do AWS Backup Vault criado"
  value       = aws_backup_vault.client_vault.arn
}

output "backup_vault_name" {
  description = "Nome do AWS Backup Vault criado"
  value       = aws_backup_vault.client_vault.name
}

