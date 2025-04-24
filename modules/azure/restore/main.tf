/**
 * Módulo Terraform para restauração de backups no Azure
 * Este módulo implementa a restauração de recursos do Azure a partir de pontos de recuperação
 */

variable "client_id" {
  description = "Identificador único do cliente"
  type        = string
}

variable "environment" {
  description = "Ambiente para restauração"
  type        = string
}

variable "location" {
  description = "Localização Azure para restauração"
  type        = string
}

variable "resource_group_name" {
  description = "Nome do grupo de recursos para restauração"
  type        = string
}

variable "recovery_point_id" {
  description = "ID do ponto de recuperação a ser restaurado"
  type        = string
  default     = ""
}

variable "is_isolated" {
  description = "Indica se a restauração deve ser feita em ambiente isolado"
  type        = bool
  default     = true
}

variable "target_network" {
  description = "ID da rede virtual alvo para restauração (se diferente da original)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags para recursos restaurados"
  type        = map(string)
  default     = {}
}

# Sufixo para nomes de recursos na restauração isolada
locals {
  name_suffix = var.is_isolated ? "-dr-restore" : ""
  restore_rg_name = var.is_isolated ? "${var.resource_group_name}${local.name_suffix}" : var.resource_group_name
}

# Criar novo grupo de recursos para restauração isolada
resource "azurerm_resource_group" "restore_rg" {
  count    = var.is_isolated ? 1 : 0
  name     = local.restore_rg_name
  location = var.location
  tags     = var.tags
}

# Restauração de VM do Azure
resource "azurerm_recovery_services_protected_vm_restore" "vm_restore" {
  count                  = var.recovery_point_id != "" ? 1 : 0
  resource_group_name    = var.is_isolated ? azurerm_resource_group.restore_rg[0].name : var.resource_group_name
  recovery_vault_name    = "${var.client_id}_${var.environment}_vault"
  source_recovery_point_id = var.recovery_point_id
  target_resource_group_id = var.is_isolated ? azurerm_resource_group.restore_rg[0].id : data.azurerm_resource_group.original_rg[0].id
  storage_account_id     = azurerm_storage_account.restore_storage[0].id
  restore_to_alternative_location = var.is_isolated
  
  virtual_network_id     = var.target_network != "" ? var.target_network : null
}

# Restauração de storage account
resource "azurerm_storage_account" "restore_storage" {
  count                 = 1
  name                  = "${lower(var.client_id)}${lower(var.environment)}restore"
  resource_group_name   = var.is_isolated ? azurerm_resource_group.restore_rg[0].name : var.resource_group_name
  location              = var.location
  account_tier          = "Standard"
  account_replication_type = "LRS"
  
  tags = var.tags
}

# Restauração de compartilhamento de arquivos
resource "azurerm_recovery_services_protected_file_share_restore" "file_share_restore" {
  count                     = var.recovery_point_id != "" ? 1 : 0
  resource_group_name       = var.is_isolated ? azurerm_resource_group.restore_rg[0].name : var.resource_group_name
  recovery_vault_name       = "${var.client_id}_${var.environment}_vault"
  source_storage_account_id = data.azurerm_recovery_services_protected_file_share.source_file_share[0].source_storage_account_id
  source_file_share_name    = data.azurerm_recovery_services_protected_file_share.source_file_share[0].source_file_share_name
  source_recovery_point_id  = var.recovery_point_id
  target_storage_account_id = azurerm_storage_account.restore_storage[0].id
  target_file_share_name    = "${data.azurerm_recovery_services_protected_file_share.source_file_share[0].source_file_share_name}${local.name_suffix}"
  restore_to_original_location = !var.is_isolated
}

# Obter dados do grupo de recursos original
data "azurerm_resource_group" "original_rg" {
  count = 1
  name  = var.resource_group_name
}

# Obter dados do compartilhamento de arquivos original
data "azurerm_recovery_services_protected_file_share" "source_file_share" {
  count               = var.recovery_point_id != "" ? 1 : 0
  name                = "${var.client_id}-${var.environment}-file-share"
  resource_group_name = var.resource_group_name
  recovery_vault_name = "${var.client_id}_${var.environment}_vault"
}

# Outputs de informação sobre os recursos restaurados
output "restored_resources" {
  description = "Recursos restaurados no Azure"
  value = concat(
    azurerm_recovery_services_protected_vm_restore.vm_restore[*].id,
    azurerm_recovery_services_protected_file_share_restore.file_share_restore[*].id,
    [azurerm_storage_account.restore_storage[0].id]
  )
}