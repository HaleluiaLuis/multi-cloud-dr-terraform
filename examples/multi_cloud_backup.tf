###################################################
# Exemplo: Backup Multi-Cloud (AWS e Azure)
# Este exemplo demonstra como configurar o SaaS para proteger
# recursos em múltiplos provedores de nuvem simultaneamente
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

# Variáveis para o exemplo
variable "cliente_exemplo" {
  description = "Nome do cliente de exemplo"
  type        = string
  default     = "cliente-multicloud"
}

variable "ambiente_exemplo" {
  description = "Ambiente do exemplo"
  type        = string
  default     = "dev"
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

# === ORQUESTRADOR DE BACKUP: Configuração do SaaS ===

module "backup_dr_saas" {
  source = "../core"
  
  client_id     = var.cliente_exemplo
  environment   = var.ambiente_exemplo
  
  # Habilitar ambos os provedores
  aws_enabled   = true
  azure_enabled = true
  
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

# Instruções de uso:
# 1. Ajuste as configurações conforme necessário
# 2. Configure as credenciais para AWS e Azure usando variáveis de ambiente ou arquivos de credenciais
# 3. Execute 'terraform init' e 'terraform apply'
# 4. Verifique nos respectivos consoles (AWS Backup e Azure Recovery Services) os recursos protegidos
# 5. O backup ocorrerá automaticamente conforme as políticas definidas

