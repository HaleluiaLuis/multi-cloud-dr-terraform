/**
 * Módulo Terraform para restauração de backups na AWS
 * Este módulo implementa a restauração de recursos da AWS a partir de pontos de recuperação
 */

variable "client_id" {
  description = "Identificador único do cliente"
  type        = string
}

variable "environment" {
  description = "Ambiente para restauração"
  type        = string
}

variable "recovery_point_arn" {
  description = "ARN do ponto de recuperação a ser restaurado"
  type        = string
}

variable "restore_all" {
  description = "Restaurar todos os recursos ou apenas específicos"
  type        = bool
  default     = true
}

variable "resources_to_restore" {
  description = "Lista de recursos específicos para restaurar (se não restaurar todos)"
  type        = list(string)
  default     = []
}

variable "is_isolated" {
  description = "Indica se a restauração deve ser feita em ambiente isolado"
  type        = bool
  default     = true
}

variable "target_vpc" {
  description = "ID da VPC alvo para restauração (se diferente da original)"
  type        = string
  default     = ""
}

variable "target_subnet" {
  description = "ID da subnet alvo para restauração (se diferente da original)"
  type        = string
  default     = ""
}

variable "point_in_time" {
  description = "Timestamp para point-in-time recovery (para bancos de dados RDS)"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags para recursos restaurados"
  type        = map(string)
  default     = {}
}

# Sufixo para nomes de recursos na restauração isolada
locals {
  name_suffix = var.is_isolated ? "-dr-restore" : ""
}

# Restauração de Instância EC2
resource "aws_backup_restore_testing" "ec2_restore" {
  count = var.recovery_point_arn != "" && (var.restore_all || contains(var.resources_to_restore, "ec2")) ? 1 : 0
  
  recovery_point_arn = var.recovery_point_arn
  resource_type      = "EC2"
  
  # Configurações de restauração para instâncias EC2
  iam_role_arn = aws_iam_role.restore_role.arn
  
  ec2_restore_configuration {
    instance_type = null # Usar o tipo de instância original
    subnet_id     = var.target_subnet != "" ? var.target_subnet : null
    vpc_id        = var.target_vpc != "" ? var.target_vpc : null
  }
}

# Restauração de Banco de Dados RDS
resource "aws_db_instance_automated_backups_replication" "rds_restore" {
  count = var.recovery_point_arn != "" && (var.restore_all || contains(var.resources_to_restore, "rds")) && var.is_isolated ? 1 : 0
  
  source_db_instance_automated_backups_arn = var.recovery_point_arn
  kms_key_id                              = null # Usar a chave KMS padrão
  
  # Em ambientes isolados, mudamos o nome para evitar conflitos
  destination_db_instance_identifier = "${var.client_id}-${var.environment}${local.name_suffix}"
}

# Restauração de RDS para Point-in-Time
resource "aws_rds_cluster" "rds_point_time_restore" {
  count = var.point_in_time != null && (var.restore_all || contains(var.resources_to_restore, "rds")) ? 1 : 0
  
  snapshot_identifier       = var.recovery_point_arn
  cluster_identifier        = "${var.client_id}-${var.environment}${local.name_suffix}"
  restore_to_point_in_time {
    restore_type             = "FULL_COPY"
    restore_to_time          = var.point_in_time
    use_latest_restorable_time = var.point_in_time == null ? true : false
  }
  
  skip_final_snapshot      = true
  apply_immediately        = true
  deletion_protection      = false
  
  tags = var.tags
}

# Função IAM com permissões necessárias para restauração
resource "aws_iam_role" "restore_role" {
  name = "${var.client_id}-${var.environment}-restore-role${local.name_suffix}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

# Política para a função de restauração
resource "aws_iam_role_policy_attachment" "restore_policy_attachment" {
  role       = aws_iam_role.restore_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Outputs de informação sobre os recursos restaurados
output "restored_resources" {
  description = "Recursos restaurados no AWS"
  value = concat(
    aws_backup_restore_testing.ec2_restore[*].id,
    aws_db_instance_automated_backups_replication.rds_restore[*].id,
    aws_rds_cluster.rds_point_time_restore[*].id
  )
}