variable "client_id" {
  description = "Identificador único do cliente"
  type        = string
}

variable "environment" {
  description = "Ambiente (prod, dev, staging)"
  type        = string
}

variable "resource_group_name" {
  description = "Nome do grupo de recursos do Azure onde os recursos serão criados"
  type        = string
}

variable "location" {
  description = "Localização Azure para implantar o Recovery Vault"
  type        = string
  default     = "eastus"
}

variable "tags" {
  description = "Tags para recursos Azure"
  type        = map(string)
  default     = {}
}

variable "retention_daily_count" {
  description = "Número de dias para retenção dos backups diários"
  type        = number
  default     = 7
}

variable "retention_weekly_count" {
  description = "Número de semanas para retenção dos backups semanais"
  type        = number
  default     = 4
}

variable "retention_monthly_count" {
  description = "Número de meses para retenção dos backups mensais"
  type        = number
  default     = 12
}

resource "azurerm_recovery_services_vault" "vault" {
  name                = "${var.client_id}-${var.environment}-recovery-vault"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "Standard"
  soft_delete_enabled = true
  
  tags = merge(
    var.tags,
    {
      Name        = "${var.client_id}-${var.environment}-recovery-vault"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  )
}

resource "azurerm_backup_policy_vm" "backup_policy" {
  name                = "${var.client_id}-${var.environment}-vm-policy"
  resource_group_name = var.resource_group_name
  recovery_vault_name = azurerm_recovery_services_vault.vault.name
  
  timezone = "UTC"
  
  backup {
    frequency = "Daily"
    time      = "23:00"
  }
  
  retention_daily {
    count = var.retention_daily_count
  }
  
  retention_weekly {
    count    = var.retention_weekly_count
    weekdays = ["Sunday"]
  }
  
  retention_monthly {
    count    = var.retention_monthly_count
    weekdays = ["Sunday"]
    weeks    = ["First"]
  }
}

output "recovery_vault_id" {
  description = "ID do Recovery Vault criado no Azure"
  value       = azurerm_recovery_services_vault.vault.id
}

output "recovery_vault_name" {
  description = "Nome do Recovery Vault criado no Azure"
  value       = azurerm_recovery_services_vault.vault.name
}

output "backup_policy_id" {
  description = "ID da política de backup criada"
  value       = azurerm_backup_policy_vm.backup_policy.id
}

