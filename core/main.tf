###################################################
# SaaS de Backup e Disaster Recovery
# Arquivo principal do orquestrador
###################################################

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.0.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0.0"
    }
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0.0"
    }
  }

  # Recomendado adicionar backend remoto para armazenamento de estado
  # backend "s3" {
  #   bucket         = "seu-bucket-terraform-state"
  #   key            = "backup-dr-saas/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-lock"
  # }
}

# Variáveis gerais
variable "aws_enabled" {
  description = "Habilita recursos AWS"
  type        = bool
  default     = true
}

variable "azure_enabled" {
  description = "Habilita recursos Azure"
  type        = bool
  default     = false
}

variable "gcp_enabled" {
  description = "Habilita recursos GCP"
  type        = bool
  default     = false
}

variable "client_id" {
  description = "ID do cliente"
  type        = string
}

variable "environment" {
  description = "Ambiente (prod, dev, staging)"
  type        = string
  default     = "prod"
}

# Variáveis AWS
variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

variable "aws_resources" {
  description = "ARNs dos recursos AWS para backup"
  type        = list(string)
  default     = []
}

# Variáveis Azure
variable "azure_location" {
  description = "Localização dos recursos no Azure"
  type        = string
  default     = "eastus"
}

variable "azure_resource_group_name" {
  description = "Nome do grupo de recursos no Azure"
  type        = string
  default     = ""
}

variable "azure_vm_ids" {
  description = "IDs das VMs Azure para backup"
  type        = list(string)
  default     = []
}

variable "azure_storage_account_ids" {
  description = "IDs das contas de armazenamento Azure para backup"
  type        = list(string)
  default     = []
}

variable "azure_file_share_names" {
  description = "Nomes dos compartilhamentos de arquivo Azure para backup"
  type        = list(string)
  default     = []
}

# Variáveis GCP
variable "gcp_project_id" {
  description = "ID do projeto GCP"
  type        = string
  default     = ""
}

variable "gcp_region" {
  description = "Região GCP para recursos"
  type        = string
  default     = "us-central1"
}

variable "gcp_zone" {
  description = "Zona GCP para recursos"
  type        = string
  default     = "us-central1-a"
}

variable "gcp_compute_instances" {
  description = "IDs das instâncias de computação GCP para backup"
  type        = list(string)
  default     = []
}

variable "gcp_databases" {
  description = "IDs de bancos de dados GCP para backup"
  type        = list(string)
  default     = []
}

variable "gcp_cloudsql_instances" {
  description = "IDs das instâncias Cloud SQL para backup"
  type        = list(string)
  default     = []
}

variable "gcp_storage_buckets" {
  description = "Nomes dos buckets do Cloud Storage para backup"
  type        = list(string)
  default     = []
}

variable "gcp_backup_plans" {
  description = "Configurações de planos de backup GCP"
  type = list(object({
    name                   = string
    region                 = string
    retention_days         = number
    daily_recurrence       = string
    weekly_day_of_weeks    = list(string)
    monthly_days_of_month  = list(number)
  }))
  default = [
    {
      name                  = "daily-backup"
      region                = "us-central1"
      retention_days        = 7
      daily_recurrence      = "00:00"
      weekly_day_of_weeks   = []
      monthly_days_of_month = []
    }
  ]
}

# Configuração dos provedores
provider "aws" {
  region = var.aws_region
}

provider "azurerm" {
  features {}
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Módulo de backup AWS
module "aws_backup" {
  count  = var.aws_enabled ? 1 : 0
  source = "../modules/aws"
  
  client_id      = var.client_id
  environment    = var.environment
  region         = var.aws_region
  backup_resources = var.aws_resources
  
  # O resto das variáveis utiliza valores padrão dos módulos
  backup_vault_name = "${var.client_id}_${var.environment}_vault"
  create_iam_role   = true
  
  tags = {
    Service     = "BackupDRSaaS"
    Environment = var.environment
    Client      = var.client_id
    ManagedBy   = "Terraform"
  }
}

# Módulo de backup Azure
module "azure_backup" {
  count  = var.azure_enabled ? 1 : 0
  source = "../modules/azure"
  
  client_id          = var.client_id
  environment        = var.environment
  location           = var.azure_location
  resource_group_name = var.azure_resource_group_name
  vm_ids             = var.azure_vm_ids
  storage_account_ids = var.azure_storage_account_ids
  file_share_names   = var.azure_file_share_names
  
  tags = {
    Service     = "BackupDRSaaS"
    Environment = var.environment
    Client      = var.client_id
    ManagedBy   = "Terraform"
  }
}

# Módulo de backup GCP
module "gcp_backup" {
  count  = var.gcp_enabled ? 1 : 0
  source = "../modules/gcp"
  
  client_id           = var.client_id
  environment         = var.environment
  project_id          = var.gcp_project_id
  region              = var.gcp_region
  zone                = var.gcp_zone
  
  # Recursos para backup
  compute_instances    = var.gcp_compute_instances
  databases            = var.gcp_databases
  cloudsql_instances   = var.gcp_cloudsql_instances
  cloud_storage_buckets = var.gcp_storage_buckets
  
  # Configurações dos planos de backup
  backup_plans = var.gcp_backup_plans
  
  tags = {
    Service     = "BackupDRSaaS"
    Environment = var.environment
    Client      = var.client_id
    ManagedBy   = "Terraform"
  }
}

# Outputs para AWS
output "aws_backup_vault_arn" {
  description = "ARN do Vault AWS criado"
  value       = var.aws_enabled ? module.aws_backup[0].backup_vault_arn : null
}

output "aws_backup_plan_id" {
  description = "ID do plano de backup na AWS"
  value       = var.aws_enabled ? module.aws_backup[0].backup_plan_id : null
}

output "aws_backup_role_arn" {
  description = "ARN da função IAM para backups na AWS"
  value       = var.aws_enabled ? module.aws_backup[0].backup_role_arn : null
}

# Outputs para Azure
output "azure_recovery_vault_id" {
  description = "ID do Recovery Vault no Azure"
  value       = var.azure_enabled ? module.azure_backup[0].recovery_vault_id : null
}

output "azure_vm_backup_policy_id" {
  description = "ID da política de backup de VMs no Azure"
  value       = var.azure_enabled ? module.azure_backup[0].backup_policy_id : null
}

output "azure_protected_vms" {
  description = "VMs protegidas no Azure"
  value       = var.azure_enabled ? module.azure_backup[0].protected_vms : null
}

# Outputs para GCP
output "gcp_backup_plan_ids" {
  description = "IDs dos planos de backup no GCP"
  value       = var.gcp_enabled ? module.gcp_backup[0].backup_plan_ids : null
}

output "gcp_protected_resources" {
  description = "Recursos protegidos no GCP"
  value       = var.gcp_enabled ? module.gcp_backup[0].protected_resources : null
}

output "gcp_storage_backup_bucket" {
  description = "Bucket de backup do GCP"
  value       = var.gcp_enabled ? module.gcp_backup[0].storage_backup_bucket : null
}

output "gcp_cloudsql_backup_configs" {
  description = "Configurações de backup do Cloud SQL"
  value       = var.gcp_enabled ? module.gcp_backup[0].cloudsql_backup_configurations : null
}

