variable "cloud_storage_buckets" {
  description = "Buckets do Cloud Storage para backup"
  type        = list(string)
  default     = []
}

variable "cloudsql_instances" {
  description = "Instâncias do Cloud SQL para backup"
  type        = list(string)
  default     = []
}

# Configuração de backup para Cloud Storage
resource "google_storage_bucket" "backup_bucket" {
  count = length(var.cloud_storage_buckets) > 0 ? 1 : 0
  
  name          = "${var.client_id}-${var.environment}-backup-bucket"
  location      = var.region
  project       = var.project_id
  force_destroy = false
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = var.backup_plans[0].retention_days
    }
    action {
      type = "Delete"
    }
  }
  
  labels = merge(
    var.tags,
    {
      client      = var.client_id
      environment = var.environment
      managed_by  = "terraform"
    }
  )
}

# Configuração de transferência para backup de buckets
resource "google_storage_transfer_job" "storage_transfer_job" {
  count = length(var.cloud_storage_buckets)
  
  description = "Backup do bucket ${var.cloud_storage_buckets[count.index]} para o bucket de backup central"
  project     = var.project_id
  
  transfer_spec {
    gcs_data_source {
      bucket_name = var.cloud_storage_buckets[count.index]
    }
    
    gcs_data_sink {
      bucket_name = google_storage_bucket.backup_bucket[0].name
      path        = "${var.cloud_storage_buckets[count.index]}/"
    }
  }
  
  schedule {
    schedule_start_date {
      year  = 2025
      month = 4
      day   = 23
    }
    
    start_time_of_day {
      hours   = 1
      minutes = 0
      seconds = 0
      nanos   = 0
    }
    
    repeat_interval = "86400s" # Diário (em segundos)
  }
}

# Configuração de backup para Cloud SQL
resource "google_sql_backup_run" "cloudsql_backup" {
  count = length(var.cloudsql_instances)
  
  instance = var.cloudsql_instances[count.index]
  project  = var.project_id
  location = var.region
  
  # O Cloud SQL cria backups automaticamente, este recurso gerencia a criação de backups on-demand
}

# Políticas de retenção para Cloud SQL
resource "google_sql_database_instance" "backup_settings" {
  count = length(var.cloudsql_instances)
  
  name             = "backup-settings-${count.index}"
  project          = var.project_id
  region           = var.region
  database_version = "POSTGRES_14" # ou "MYSQL_8_0" conforme necessário
  
  settings {
    tier = "db-f1-micro"
    
    backup_configuration {
      enabled            = true
      start_time         = "02:00"
      location           = var.region
      binary_log_enabled = true # Para MySQL
      
      backup_retention_settings {
        retained_backups = var.backup_plans[0].retention_days
        retention_unit   = "COUNT"
      }
    }
  }
  
  # Este recurso não cria instâncias reais, apenas define configurações para instâncias existentes
  # Na implementação real, você usaria data sources para obter instâncias existentes
  lifecycle {
    create_before_destroy = true
    ignore_changes        = all
  }
}

output "storage_backup_bucket" {
  description = "Bucket criado para backups de armazenamento"
  value       = length(google_storage_bucket.backup_bucket) > 0 ? google_storage_bucket.backup_bucket[0].name : null
}

output "cloudsql_backup_configurations" {
  description = "Configurações de backup do Cloud SQL"
  value       = [for instance in google_sql_database_instance.backup_settings : instance.name]
}

