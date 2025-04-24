variable "create_iam_role" {
  description = "Define se deve criar a função IAM para o AWS Backup"
  type        = bool
  default     = true
}

resource "aws_iam_role" "backup_role" {
  count = var.create_iam_role ? 1 : 0
  
  name = "${var.client_id}_${var.environment}_backup_role"
  
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
  
  tags = merge(
    var.tags,
    {
      Name        = "${var.client_id}_${var.environment}_backup_role"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  )
}

resource "aws_iam_role_policy_attachment" "backup_policy_attachment" {
  count = var.create_iam_role ? 1 : 0
  
  role       = aws_iam_role.backup_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_iam_role_policy_attachment" "restore_policy_attachment" {
  count = var.create_iam_role ? 1 : 0
  
  role       = aws_iam_role.backup_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Política adicional para restauração entre contas, se necessário
resource "aws_iam_role_policy" "cross_account_policy" {
  count = var.create_iam_role ? 1 : 0
  
  name = "${var.client_id}_${var.environment}_cross_account_backup_policy"
  role = aws_iam_role.backup_role[0].id
  
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "backup:CopyIntoBackupVault"
        ],
        Resource = "*"
      }
    ]
  })
}

output "backup_role_arn" {
  description = "ARN da função IAM para backup"
  value       = var.create_iam_role ? aws_iam_role.backup_role[0].arn : var.backup_role_arn
}

