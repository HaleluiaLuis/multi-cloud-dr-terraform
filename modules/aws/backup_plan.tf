variable "backup_schedule" {
  description = "Expressão cron para agendamento de backups (padrão: diário às 00:00)"
  type        = string
  default     = "cron(0 0 * * ? *)"
}

variable "retention_days" {
  description = "Número de dias para reter os backups"
  type        = number
  default     = 30
}

variable "backup_vault_name" {
  description = "Nome do vault de backup a ser utilizado"
  type        = string
}

variable "backup_resources" {
  description = "Lista de ARNs dos recursos para backup"
  type        = list(string)
  default     = []
}

variable "backup_role_arn" {
  description = "ARN da função IAM com permissões para realizar o backup"
  type        = string
}

variable "backup_types" {
  description = "Tipos de backup a serem criados"
  type        = list(object({
    name             = string
    schedule         = string
    retention_days   = number
    enable_continuous = bool
  }))
  default = [
    {
      name             = "daily"
      schedule         = "cron(0 0 * * ? *)"
      retention_days   = 7
      enable_continuous = false
    },
    {
      name             = "weekly"
      schedule         = "cron(0 0 ? * 1 *)"
      retention_days   = 30
      enable_continuous = false
    },
    {
      name             = "monthly"
      schedule         = "cron(0 0 1 * ? *)"
      retention_days   = 90
      enable_continuous = false
    }
  ]
}

resource "aws_backup_plan" "client_backup_plan" {
  name = "${var.client_id}_${var.environment}_backup_plan"

  dynamic "rule" {
    for_each = var.backup_types
    content {
      rule_name           = "${var.client_id}_${var.environment}_${rule.value.name}"
      target_vault_name   = var.backup_vault_name
      schedule            = rule.value.schedule
      
      lifecycle {
        delete_after = rule.value.retention_days
      }
      
      # Habilita backup contínuo para suporte point-in-time recovery
      dynamic "continuous_backup" {
        for_each = rule.value.enable_continuous ? [1] : []
        content {
          enable = true
        }
      }
    }
  }

  tags = merge(
    var.tags,
    {
      Name        = "${var.client_id}_${var.environment}_backup_plan"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  )
}

resource "aws_backup_selection" "client_backup_selection" {
  name          = "${var.client_id}_${var.environment}_backup_selection"
  plan_id       = aws_backup_plan.client_backup_plan.id
  iam_role_arn  = var.backup_role_arn
  resources     = var.backup_resources
}

output "backup_plan_id" {
  description = "ID do plano de backup"
  value       = aws_backup_plan.client_backup_plan.id
}

output "backup_plan_version" {
  description = "Versão do plano de backup"
  value       = aws_backup_plan.client_backup_plan.version
}

output "backup_selection_id" {
  description = "ID da seleção de backup"
  value       = aws_backup_selection.client_backup_selection.id
}

