/**
 * Módulo Terraform para restauração de backups no GCP
 * Este módulo implementa a restauração de recursos do GCP a partir de pontos de recuperação
 */

variable "client_id" {
  description = "Identificador único do cliente"
  type        = string
}

variable "environment" {
  description = "Ambiente para restauração"
  type        = string
}

variable "backup_ids" {
  description = "IDs dos backups a serem restaurados"
  type        = list(string)
  default     = []
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

variable "zone" {
  description = "Zona para restauração das VMs"
  type        = string
  default     = "us-central1-a"
}

variable "labels" {
  description = "Labels para recursos restaurados"
  type        = map(string)
  default     = {}
}

# Sufixo para nomes de recursos na restauração isolada
locals {
  name_suffix = var.is_isolated ? "-dr-restore" : ""
}

# Restauração de instância Compute Engine
resource "google_compute_instance_from_machine_image" "vm_restore" {
  count        = length(var.backup_ids) > 0 ? 1 : 0
  
  name         = "${var.client_id}-${var.environment}${local.name_suffix}"
  zone         = var.zone
  
  source_machine_image = var.backup_ids[0]
  
  # Se estiver restaurando para uma rede diferente
  dynamic "network_interface" {
    for_each = var.target_network != "" ? [1] : []
    content {
      network = var.target_network
    }
  }
  
  labels = var.labels
}

# Restauração de banco de dados Cloud SQL
resource "google_sql_database_instance" "db_restore" {
  count            = length(var.backup_ids) > 1 ? 1 : 0
  
  name             = "${var.client_id}-${var.environment}${local.name_suffix}"
  database_version = "MYSQL_8_0" # Ajustar conforme necessário
  region           = "us-central1"
  
  restore_backup_context {
    backup_run_id = var.backup_ids[1]
    instance_id   = data.google_sql_database_instance.source_instance[0].instance_id
    project       = data.google_sql_database_instance.source_instance[0].project
  }
  
  settings {
    tier = "db-f1-micro"
    backup_configuration {
      enabled = var.is_isolated ? false : true
    }
  }
}

# Restauração de bucket de armazenamento
resource "google_storage_bucket" "bucket_restore" {
  count        = length(var.backup_ids) > 2 ? 1 : 0
  
  name         = "${var.client_id}-${var.environment}${local.name_suffix}"
  location     = "US"
  force_destroy = var.is_isolated # Permitir exclusão fácil em ambiente de teste
  
  labels = var.labels
}

# Transferência de dados para o bucket restaurado
resource "google_storage_bucket_object" "transfer_data" {
  count   = length(var.backup_ids) > 2 ? 1 : 0
  
  name    = "restored-data"
  bucket  = google_storage_bucket.bucket_restore[0].name
  content = "Placeholder para restauração de dados. Na implementação real, utilizaria comandos do gsutil para copiar."
}

# Data source para obter informações da instância do SQL de origem
data "google_sql_database_instance" "source_instance" {
  count = length(var.backup_ids) > 1 ? 1 : 0
  name  = "${var.client_id}-${var.environment}-db"
}

# Outputs de informação sobre os recursos restaurados
output "restored_resources" {
  description = "Recursos restaurados no GCP"
  value = concat(
    google_compute_instance_from_machine_image.vm_restore[*].id,
    google_sql_database_instance.db_restore[*].id,
    google_storage_bucket.bucket_restore[*].id
  )
}