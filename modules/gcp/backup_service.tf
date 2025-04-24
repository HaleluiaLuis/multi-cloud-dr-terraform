variable "client_id" {
  description = "Identificador único do cliente"
  type        = string
}

variable "environment" {
  description = "Ambiente (prod, dev, staging)"
  type        = string
}

variable "project_id" {
  description = "ID do projeto GCP"
  type        = string
}

variable "region" {
  description = "Região GCP para os recursos de backup"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zona GCP para recursos zonais"
  type        = string
  default     = "us-central1-a"
}

variable "tags" {
  description = "Tags para recursos GCP"
  type        = map(string)
  default     = {}
}

# Configuração de políticas de backup
variable "backup_plans" {
  description = "Planos de backup para configurar"
  type = list(object({
    name                   = string
    region                 = string
    retention_days         = number
    daily_recurrence       = string # Formato "HH:MM" em UTC
    weekly_day_of_weeks    = list(string) # e.g., ["MONDAY", "THURSDAY"]
    monthly_days_of_month  = list(number) # e.g., [1, 15]
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

# Recursos para backup
variable "compute_instances" {
  description = "Instâncias de computação para backup"
  type        = list(string)
  default     = []
}

variable "databases" {
  description = "Bancos de dados para backup"
  type        = list(string)
  default     = []
}

# Política de backup
resource "google_gcp_backup_backup_plan" "backup_plan" {
  for_each = { for plan in var.backup_plans : plan.name => plan }

  name     = "${var.client_id}-${var.environment}-${each.key}"
  region   = each.value.region
  project  = var.project_id
  
  retention_policy {
    retention_period {
      days = each.value.retention_days
    }
  }
  
  # Configuração de agendamento diário
  dynamic "schedule" {
    for_each = each.value.daily_recurrence != "" ? [1] : []
    content {
      daily_recurrence {
        time = each.value.daily_recurrence # Formato: "HH:MM"
      }
    }
  }
  
  # Configuração de agendamento semanal
  dynamic "schedule" {
    for_each = length(each.value.weekly_day_of_weeks) > 0 ? [1] : []
    content {
      weekly_recurrence {
        day_of_weeks {
          dynamic "day" {
            for_each = toset(each.value.weekly_day_of_weeks)
            content {
              day = day.value # e.g., "MONDAY", "TUESDAY"
            }
          }
        }
      }
    }
  }
  
  # Configuração de agendamento mensal
  dynamic "schedule" {
    for_each = length(each.value.monthly_days_of_month) > 0 ? [1] : []
    content {
      monthly_recurrence {
        days_of_month = each.value.monthly_days_of_month
      }
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

# Proteção de recursos de computação (VMs)
resource "google_gcp_backup_backup_protected_resource" "protected_vm" {
  count = length(var.compute_instances)
  
  name     = "${var.client_id}-${var.environment}-vm-${count.index}"
  project  = var.project_id
  backup_plan = google_gcp_backup_backup_plan.backup_plan["daily-backup"].id
  resource_id = var.compute_instances[count.index]
}

# Proteção de bancos de dados
resource "google_gcp_backup_backup_protected_resource" "protected_db" {
  count = length(var.databases)
  
  name     = "${var.client_id}-${var.environment}-db-${count.index}"
  project  = var.project_id
  backup_plan = google_gcp_backup_backup_plan.backup_plan["daily-backup"].id
  resource_id = var.databases[count.index]
}

# Outputs
output "backup_plan_ids" {
  description = "IDs dos planos de backup criados"
  value = { for key, plan in google_gcp_backup_backup_plan.backup_plan : key => plan.id }
}

output "protected_resources" {
  description = "Recursos protegidos por backup"
  value = concat(
    [for vm in google_gcp_backup_backup_protected_resource.protected_vm : vm.resource_id],
    [for db in google_gcp_backup_backup_protected_resource.protected_db : db.resource_id]
  )
}

