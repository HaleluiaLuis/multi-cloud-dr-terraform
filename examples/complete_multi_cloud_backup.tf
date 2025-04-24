###################################################
# Exemplo: Backup Multi-Cloud Completo (AWS, Azure e GCP)
# Este exemplo demonstra como configurar o SaaS para proteger
# recursos nas três principais plataformas de nuvem
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
}

# Configuração dos provedores
provider "aws" {
  region = "us-east-1"
  # Não inclua credenciais no código - use variáveis de ambiente ou outros métodos seguros
}

provider "azurerm" {
  features {}
  # Não inclua credenciais no código - use variáveis de ambiente ou outros métodos seguros
}

provider "google" {
  project = var.gcp_project_id
  region  = "us-central1"
  # Não inclua credenciais no código - use variáveis de ambiente ou outros métodos seguros
}

# Variáveis para o exemplo
variable "cliente_exemplo" {
  description = "Nome do cliente de exemplo"
  type        = string
  default     = "cliente-completo"
}

variable "ambiente_exemplo" {
  description = "Ambiente do exemplo"
  type        = string
  default     = "dev"
}

variable "gcp_project_id" {
  description = "ID do projeto GCP"
  type        = string
  # Defina um valor padrão para facilitar os testes ou use uma variável de ambiente
  default     = "meu-projeto-gcp"
}

# === AWS: Recursos de exemplo para backup ===

# Instância EC2 de exemplo
resource "aws_instance" "exemplo_ec2" {
  ami           = "ami-0c55b159cbfafe1f0" # Amazon Linux 2 AMI (ajuste conforme necessário)
  instance_type = "t2.micro"
  
  tags = {
    Name   = "exemplo-servidor-aplicacao"
    Backup = "true"
  }
}

# Banco de dados RDS de exemplo
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
    Name   = "exemplo-banco-dados"
    Backup = "true"
  }
}

# === AZURE: Recursos de exemplo para backup ===

# Grupo de recursos Azure
resource "azurerm_resource_group" "exemplo_rg" {
  name     = "${var.cliente_exemplo}-${var.ambiente_exemplo}-rg"
  location = "eastus"
}

# Rede virtual Azure
resource "azurerm_virtual_network" "exemplo_vnet" {
  name                = "${var.cliente_exemplo}-${var.ambiente_exemplo}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.exemplo_rg.location
  resource_group_name = azurerm_resource_group.exemplo_rg.name
}

# Subnet Azure
resource "azurerm_subnet" "exemplo_subnet" {
  name                 = "internal"
  resource_group_name  = azurerm_resource_group.exemplo_rg.name
  virtual_network_name = azurerm_virtual_network.exemplo_vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}

# Interface de rede Azure
resource "azurerm_network_interface" "exemplo_nic" {
  name                = "${var.cliente_exemplo}-${var.ambiente_exemplo}-nic"
  location            = azurerm_resource_group.exemplo_rg.location
  resource_group_name = azurerm_resource_group.exemplo_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.exemplo_subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

# VM Azure de exemplo
resource "azurerm_linux_virtual_machine" "exemplo_vm" {
  name                = "${var.cliente_exemplo}-${var.ambiente_exemplo}-vm"
  resource_group_name = azurerm_resource_group.exemplo_rg.name
  location            = azurerm_resource_group.exemplo_rg.location
  size                = "Standard_B1s"
  admin_username      = "adminuser"
  
  admin_ssh_key {
    username   = "adminuser"
    public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDJxGw" # Esta é apenas uma chave parcial de exemplo
  }
  
  network_interface_ids = [
    azurerm_network_interface.exemplo_nic.id,
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
  
  tags = {
    Environment = var.ambiente_exemplo
    Backup      = "true"
  }
}

# Conta de armazenamento Azure
resource "azurerm_storage_account" "exemplo_storage" {
  name                     = "${var.cliente_exemplo}${var.ambiente_exemplo}stor"
  resource_group_name      = azurerm_resource_group.exemplo_rg.name
  location                 = azurerm_resource_group.exemplo_rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Compartilhamento de arquivos Azure
resource "azurerm_storage_share" "exemplo_file_share" {
  name                 = "dados-aplicacao"
  storage_account_name = azurerm_storage_account.exemplo_storage.name
  quota                = 50
}

# === GCP: Recursos de exemplo para backup ===

# Rede VPC no GCP
resource "google_compute_network" "exemplo_vpc" {
  name                    = "${var.cliente_exemplo}-${var.ambiente_exemplo}-vpc"
  project                 = var.gcp_project_id
  auto_create_subnetworks = false
}

# Subnet no GCP
resource "google_compute_subnetwork" "exemplo_subnet" {
  name          = "${var.cliente_exemplo}-${var.ambiente_exemplo}-subnet"
  project       = var.gcp_project_id
  ip_cidr_range = "10.2.0.0/16"
  region        = "us-central1"
  network       = google_compute_network.exemplo_vpc.id
}

# Instância de VM no GCP
resource "google_compute_instance" "exemplo_vm" {
  name         = "${var.cliente_exemplo}-${var.ambiente_exemplo}-vm"
  project      = var.gcp_project_id
  machine_type = "e2-micro"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-10"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.exemplo_subnet.id
  }

  labels = {
    environment = var.ambiente_exemplo
    backup      = "true"
  }
}

# Instância de Cloud SQL no GCP
resource "google_sql_database_instance" "exemplo_cloudsql" {
  name             = "${var.cliente_exemplo}-${var.ambiente_exemplo}-db"
  project          = var.gcp_project_id
  database_version = "MYSQL_8_0"
  region           = "us-central1"
  
  settings {
    tier = "db-f1-micro"
    
    backup_configuration {
      enabled            = true
      start_time         = "02:00"
      binary_log_enabled = true
    }
  }
}

# Bucket de armazenamento no GCP
resource "google_storage_bucket" "exemplo_bucket" {
  name          = "${var.cliente_exemplo}-${var.ambiente_exemplo}-bucket"
  project       = var.gcp_project_id
  location      = "US"
  force_destroy = true
  
  versioning {
    enabled = true
  }
  
  labels = {
    environment = var.ambiente_exemplo
    backup      = "true"
  }
}

# === ORQUESTRADOR DE BACKUP: Configuração do SaaS ===

module "backup_dr_saas" {
  source = "../core"
  
  client_id     = var.cliente_exemplo
  environment   = var.ambiente_exemplo
  
  # Habilitar todos os provedores
  aws_enabled   = true
  azure_enabled = true
  gcp_enabled   = true
  
  # Configuração AWS
  aws_region = "us-east-1"
  aws_resources = [
    aws_instance.exemplo_ec2.arn,
    aws_db_instance.exemplo_rds.arn
  ]
  
  # Configuração Azure
  azure_resource_group_name = azurerm_resource_group.exemplo_rg.name
  azure_location = azurerm_resource_group.exemplo_rg.location
  azure_vm_ids = [
    azurerm_linux_virtual_machine.exemplo_vm.id
  ]
  azure_storage_account_ids = [
    azurerm_storage_account.exemplo_storage.id
  ]
  azure_file_share_names = [
    azurerm_storage_share.exemplo_file_share.name
  ]
  
  # Configuração GCP
  gcp_project_id = var.gcp_project_id
  gcp_region     = "us-central1"
  gcp_zone       = "us-central1-a"
  
  gcp_compute_instances = [
    google_compute_instance.exemplo_vm.id
  ]
  
  gcp_cloudsql_instances = [
    google_sql_database_instance.exemplo_cloudsql.name
  ]
  
  gcp_storage_buckets = [
    google_storage_bucket.exemplo_bucket.name
  ]
  
  # Configuração de planos de backup para GCP
  gcp_backup_plans = [
    {
      name                  = "daily-backup"
      region                = "us-central1"
      retention_days        = 7
      daily_recurrence      = "00:00"
      weekly_day_of_weeks   = []
      monthly_days_of_month = []
    },
    {
      name                  = "weekly-backup"
      region                = "us-central1"
      retention_days        = 30
      daily_recurrence      = ""
      weekly_day_of_weeks   = ["SUNDAY"]
      monthly_days_of_month = []
    }
  ]
}

# Outputs para visualizar informações importantes
output "aws_backup_vault_arn" {
  description = "ARN do Vault de Backup na AWS"
  value       = module.backup_dr_saas.aws_backup_vault_arn
}

output "azure_recovery_vault_id" {
  description = "ID do Recovery Vault no Azure"
  value       = module.backup_dr_saas.azure_recovery_vault_id
}

output "gcp_backup_plan_ids" {
  description = "IDs dos planos de backup no GCP"
  value       = module.backup_dr_saas.gcp_backup_plan_ids
}

output "recursos_protegidos_aws" {
  description = "Recursos AWS protegidos pelo plano de backup"
  value = {
    "EC2 Instance" = aws_instance.exemplo_ec2.id
    "RDS Database" = aws_db_instance.exemplo_rds.id
  }
}

output "recursos_protegidos_azure" {
  description = "Recursos Azure protegidos pelo plano de backup"
  value = {
    "Virtual Machine"  = azurerm_linux_virtual_machine.exemplo_vm.id
    "File Share"       = "${azurerm_storage_account.exemplo_storage.name}/${azurerm_storage_share.exemplo_file_share.name}"
  }
}

output "recursos_protegidos_gcp" {
  description = "Recursos GCP protegidos pelo plano de backup"
  value = {
    "Compute Instance" = google_compute_instance.exemplo_vm.id
    "Cloud SQL"        = google_sql_database_instance.exemplo_cloudsql.name
    "Storage Bucket"   = google_storage_bucket.exemplo_bucket.name
  }
}

# Instruções de uso:
# 1. Ajuste as configurações conforme necessário
# 2. Configure as credenciais para AWS, Azure e GCP usando variáveis de ambiente ou arquivos de credenciais
# 3. Execute 'terraform init' e 'terraform apply'
# 4. Verifique nos respectivos consoles os recursos protegidos
# 5. O backup ocorrerá automaticamente conforme as políticas definidas

