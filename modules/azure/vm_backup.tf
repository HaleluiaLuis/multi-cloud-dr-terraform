variable "vm_ids" {
  description = "Lista de IDs de máquinas virtuais para backup"
  type        = list(string)
  default     = []
}

variable "enable_vm_backup" {
  description = "Habilita ou desabilita o backup de VMs"
  type        = bool
  default     = true
}

resource "azurerm_backup_protected_vm" "vm_backup" {
  count               = var.enable_vm_backup ? length(var.vm_ids) : 0
  resource_group_name = var.resource_group_name
  recovery_vault_name = azurerm_recovery_services_vault.vault.name
  source_vm_id        = var.vm_ids[count.index]
  backup_policy_id    = azurerm_backup_policy_vm.backup_policy.id
}

resource "azurerm_backup_policy_file_share" "file_share_policy" {
  name                = "${var.client_id}-${var.environment}-fileshare-policy"
  resource_group_name = var.resource_group_name
  recovery_vault_name = azurerm_recovery_services_vault.vault.name

  timezone = "UTC"

  backup {
    frequency = "Daily"
    time      = "01:00"
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

variable "storage_account_ids" {
  description = "IDs das contas de armazenamento para backup"
  type        = list(string)
  default     = []
}

variable "file_share_names" {
  description = "Nomes dos compartilhamentos de arquivos para backup"
  type        = list(string)
  default     = []
}

resource "azurerm_backup_container_storage_account" "storage_containers" {
  count               = length(var.storage_account_ids)
  resource_group_name = var.resource_group_name
  recovery_vault_name = azurerm_recovery_services_vault.vault.name
  storage_account_id  = var.storage_account_ids[count.index]
}

resource "azurerm_backup_protected_file_share" "protected_file_shares" {
  count                = length(var.file_share_names) > 0 ? length(var.file_share_names) : 0
  resource_group_name  = var.resource_group_name
  recovery_vault_name  = azurerm_recovery_services_vault.vault.name
  source_storage_account_id = var.storage_account_ids[0]  # Usando o primeiro da lista
  source_file_share_name    = var.file_share_names[count.index]
  backup_policy_id     = azurerm_backup_policy_file_share.file_share_policy.id
  
  depends_on = [azurerm_backup_container_storage_account.storage_containers]
}

output "protected_vms" {
  description = "IDs das VMs protegidas"
  value       = var.enable_vm_backup ? azurerm_backup_protected_vm.vm_backup[*].id : []
}

output "file_share_policy_id" {
  description = "ID da política de backup para compartilhamentos de arquivos"
  value       = azurerm_backup_policy_file_share.file_share_policy.id
}

