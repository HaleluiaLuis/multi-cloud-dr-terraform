###################################################
# Exemplo: Backup de instâncias EC2 e bancos de dados RDS na AWS
# Este exemplo demonstra como configurar o SaaS para proteger
# recursos comuns na AWS
###################################################

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.0.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  # Não inclua credenciais no código - use variáveis de ambiente ou outros métodos seguros
}

# Variáveis para o exemplo
variable "cliente_exemplo" {
  description = "Nome do cliente de exemplo"
  type        = string
  default     = "cliente-demo"
}

variable "ambiente_exemplo" {
  description = "Ambiente do exemplo"
  type        = string
  default     = "dev"
}

# Criação de recursos de exemplo (EC2 e RDS) para demonstração
resource "aws_instance" "exemplo_ec2" {
  ami           = "ami-0c55b159cbfafe1f0" # Amazon Linux 2 AMI (ajuste conforme necessário)
  instance_type = "t2.micro"
  
  tags = {
    Name = "exemplo-servidor-aplicacao"
    Backup = "true"
  }
}

resource "aws_db_instance" "exemplo_rds" {
  allocated_storage    = 10
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t3.micro"
  db_name              = "exemplobd"
  username             = "admin"
  password             = "senha_segura_demo" # Não use senhas fixas em produção!
  parameter_group_name = "default.mysql5.7"
  skip_final_snapshot  = true
  
  tags = {
    Name = "exemplo-banco-dados"
    Backup = "true"
  }
}

# Uso do módulo principal definindo os recursos específicos para backup
module "backup_dr_saas" {
  source = "../core"
  
  client_id     = var.cliente_exemplo
  environment   = var.ambiente_exemplo
  aws_enabled   = true
  azure_enabled = false
  gcp_enabled   = false
  
  aws_region = "us-east-1"
  
  # Lista de recursos para backup
  aws_resources = [
    aws_instance.exemplo_ec2.arn,
    aws_db_instance.exemplo_rds.arn
  ]
}

# Outputs para visualizar informações importantes
output "backup_vault_arn" {
  description = "ARN do Vault de Backup criado"
  value       = module.backup_dr_saas.aws_backup_vault_arn
}

output "backup_plan_id" {
  description = "ID do Plano de Backup"
  value       = module.backup_dr_saas.aws_backup_plan_id
}

output "recursos_protegidos" {
  description = "Recursos protegidos pelo plano de backup"
  value = {
    "EC2 Instance" = aws_instance.exemplo_ec2.id
    "RDS Database" = aws_db_instance.exemplo_rds.id
  }
}

# Instruções de uso:
# 1. Ajuste as configurações conforme necessário
# 2. Execute 'terraform init' e 'terraform apply'
# 3. Verifique no console AWS Backup os recursos protegidos
# 4. Para testar a recuperação, use o console AWS Backup ou implemente
#    um módulo de restauração usando o recurso aws_backup_recovery_point

