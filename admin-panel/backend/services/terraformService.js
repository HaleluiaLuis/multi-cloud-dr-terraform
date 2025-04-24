/**
 * Serviço para operações com Terraform
 * Responsável por criar, modificar e destruir infraestrutura
 */

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { TerraformError } = require('../utils/errors');
const config = require('../config/config');

// Diretório base para os arquivos Terraform
const TERRAFORM_DIR = config.terraform?.baseDir || path.join(process.cwd(), '..', '..', 'terraform');

// Gerar configuração Terraform para um cliente
const generateTerraformConfig = async (client, options = {}) => {
  try {
    // Criar diretório do cliente se não existir
    const clientDir = path.join(TERRAFORM_DIR, 'clients', client._id.toString());
    await fs.mkdir(clientDir, { recursive: true });
    
    // Determinar quais provedores de nuvem estão habilitados
    const providers = [];
    if (client.awsEnabled || client.providers?.includes('aws')) providers.push('aws');
    if (client.azureEnabled || client.providers?.includes('azure')) providers.push('azure');
    if (client.gcpEnabled || client.providers?.includes('gcp')) providers.push('gcp');
    
    // Gerar o arquivo main.tf
    let mainConfig = `
# Terraform configuration for client: ${client.name}
# Generated on: ${new Date().toISOString()}

terraform {
  required_providers {
`;

    // Adicionar configuração de provedores
    if (providers.includes('aws')) {
      mainConfig += `    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
`;
    }
    
    if (providers.includes('azure')) {
      mainConfig += `    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
`;
    }
    
    if (providers.includes('gcp')) {
      mainConfig += `    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
`;
    }
    
    mainConfig += `  }
  
  backend "local" {
    path = "${path.join('states', `${client._id.toString()}.tfstate`)}"
  }
}

`;

    // Configuração de provedores
    if (providers.includes('aws')) {
      const awsRegion = client.backupConfig?.aws?.region || 'us-east-1';
      mainConfig += `
provider "aws" {
  region = "${awsRegion}"
`;
      
      // Se estiver em modo de desenvolvimento, usar credenciais falsas
      if (process.env.NODE_ENV === 'development') {
        mainConfig += `  
  # Development mode credentials
  access_key = "fake-access-key"
  secret_key = "fake-secret-key"
  skip_credentials_validation = true
  skip_requesting_account_id = true
  skip_metadata_api_check = true
`;
      }
      
      mainConfig += `}

`;
    }
    
    if (providers.includes('azure')) {
      mainConfig += `
provider "azurerm" {
  features {}
`;
      
      // Se estiver em modo de desenvolvimento, usar credenciais falsas
      if (process.env.NODE_ENV === 'development') {
        mainConfig += `  
  # Development mode credentials
  skip_provider_registration = true
`;
      }
      
      mainConfig += `}

`;
    }
    
    if (providers.includes('gcp')) {
      const gcpProject = client.backupConfig?.gcp?.projectId || 'my-project';
      const gcpRegion = client.backupConfig?.gcp?.region || 'us-central1';
      
      mainConfig += `
provider "google" {
  project = "${gcpProject}"
  region  = "${gcpRegion}"
`;
      
      // Se estiver em modo de desenvolvimento, usar credenciais falsas
      if (process.env.NODE_ENV === 'development') {
        mainConfig += `  
  # Development mode credentials
  credentials = {}
`;
      }
      
      mainConfig += `}

`;
    }
    
    // Incluir módulos para cada provedor
    if (providers.includes('aws')) {
      mainConfig += `
module "aws_backup" {
  source = "../../modules/aws"
  
  client_id   = "${client._id}"
  client_name = "${client.name}"
  
  backup_vault_name = "${client.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-vault"
  retention_days    = ${client.backupConfig?.retention?.days || 30}
  
  resources_to_backup = ${JSON.stringify(client.backupConfig?.aws?.resources || ["*"])}
  
  tags = {
    Environment = "${client.environment || 'production'}"
    Client      = "${client.name}"
    ManagedBy   = "terraform"
  }
}

`;
    }
    
    if (providers.includes('azure')) {
      mainConfig += `
module "azure_backup" {
  source = "../../modules/azure"
  
  client_id   = "${client._id}"
  client_name = "${client.name}"
  
  resource_group_name = "${client.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-rg"
  location            = "${client.backupConfig?.azure?.location || 'eastus'}"
  
  recovery_vault_name = "${client.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-vault"
  retention_days      = ${client.backupConfig?.retention?.days || 30}
  
  backup_frequency    = "${client.backupConfig?.frequency || 'Daily'}"
  backup_time         = "${client.backupConfig?.scheduleTime || '23:00'}"
  
  tags = {
    Environment = "${client.environment || 'production'}"
    Client      = "${client.name}"
    ManagedBy   = "terraform"
  }
}

`;
    }
    
    if (providers.includes('gcp')) {
      mainConfig += `
module "gcp_backup" {
  source = "../../modules/gcp"
  
  client_id   = "${client._id}"
  client_name = "${client.name}"
  
  project_id = "${client.backupConfig?.gcp?.projectId || 'my-project'}"
  location   = "${client.backupConfig?.gcp?.region || 'us-central1'}"
  
  backup_bucket_name = "${client.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-backup"
  retention_days     = ${client.backupConfig?.retention?.days || 30}
  
  labels = {
    environment = "${client.environment || 'production'}"
    client      = "${client.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}"
    managed_by  = "terraform"
  }
}

`;
    }
    
    // Salvar o arquivo main.tf
    await fs.writeFile(path.join(clientDir, 'main.tf'), mainConfig);
    
    // Criar arquivo variables.tf
    const variablesConfig = `
# Variables for client: ${client.name}

variable "client_id" {
  description = "The unique ID of the client"
  type        = string
  default     = "${client._id}"
}

variable "client_name" {
  description = "The name of the client"
  type        = string
  default     = "${client.name}"
}

`;
    
    await fs.writeFile(path.join(clientDir, 'variables.tf'), variablesConfig);
    
    return {
      clientDir,
      providers
    };
  } catch (error) {
    console.error('Erro ao gerar configuração Terraform:', error);
    throw new TerraformError('Falha ao gerar configuração Terraform', error.message);
  }
};

// Executar comando Terraform
const runTerraformCommand = async (clientId, command, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Obter diretório do cliente
      const clientDir = path.join(TERRAFORM_DIR, 'clients', clientId.toString());
      
      // Verificar se o diretório existe
      try {
        await fs.access(clientDir);
      } catch (err) {
        throw new TerraformError('Diretório de cliente não encontrado', clientId);
      }
      
      // Determinar o comando a ser executado
      let tfCommand = '';
      let args = [];
      
      // Em modo de desenvolvimento, podemos simular operações do Terraform
      if (process.env.NODE_ENV === 'development' && options.simulate) {
        console.log(`[Terraform Simulado] ${command} para cliente ${clientId}`);
        
        // Simulação de resposta
        setTimeout(() => {
          if (command === 'apply' || command === 'destroy') {
            resolve({
              success: true,
              output: `[Terraform Simulado] ${command} completado com sucesso para cliente ${clientId}`,
              changes: {
                added: 3,
                changed: 0,
                destroyed: 0
              }
            });
          } else if (command === 'plan') {
            resolve({
              success: true,
              output: `[Terraform Simulado] Plano gerado para cliente ${clientId}`,
              changes: {
                add: 3,
                change: 0,
                destroy: 0
              }
            });
          } else {
            resolve({
              success: true,
              output: `[Terraform Simulado] ${command} executado com sucesso`
            });
          }
        }, 1500);
        
        return;
      }
      
      // Comando real do Terraform
      switch (command) {
        case 'init':
          tfCommand = 'terraform';
          args = ['init'];
          break;
        case 'plan':
          tfCommand = 'terraform';
          args = ['plan', '-detailed-exitcode'];
          if (options.output) {
            args.push('-out', options.output);
          }
          break;
        case 'apply':
          tfCommand = 'terraform';
          args = ['apply'];
          if (options.autoApprove) {
            args.push('-auto-approve');
          }
          if (options.planFile) {
            args.push(options.planFile);
          }
          break;
        case 'destroy':
          tfCommand = 'terraform';
          args = ['destroy'];
          if (options.autoApprove) {
            args.push('-auto-approve');
          }
          break;
        case 'output':
          tfCommand = 'terraform';
          args = ['output', '-json'];
          break;
        case 'validate':
          tfCommand = 'terraform';
          args = ['validate'];
          break;
        default:
          throw new TerraformError('Comando Terraform desconhecido', command);
      }
      
      // Adicionar variáveis adicionais, se fornecidas
      if (options.vars) {
        Object.entries(options.vars).forEach(([key, value]) => {
          args.push('-var', `${key}=${value}`);
        });
      }
      
      console.log(`Executando comando Terraform: ${tfCommand} ${args.join(' ')} no diretório ${clientDir}`);
      
      // Executar o comando Terraform
      const terraformProcess = spawn(tfCommand, args, {
        cwd: clientDir,
        env: { ...process.env, TF_IN_AUTOMATION: 'true' }
      });
      
      let stdout = '';
      let stderr = '';
      
      terraformProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        if (options.onOutput) {
          options.onOutput(output);
        }
        console.log(`[Terraform] ${output}`);
      });
      
      terraformProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.error(`[Terraform Error] ${output}`);
      });
      
      terraformProcess.on('close', (code) => {
        console.log(`Terraform process exited with code ${code}`);
        
        // Para o comando 'plan', um código de saída 2 significa que há mudanças
        if (command === 'plan' && code === 2) {
          resolve({
            success: true,
            hasChanges: true,
            output: stdout
          });
          return;
        }
        
        if (code !== 0) {
          reject(new TerraformError(`Comando Terraform falhou com código ${code}`, stderr || stdout));
          return;
        }
        
        // Analisar a saída para determinar as mudanças
        let changes = null;
        if (command === 'apply' || command === 'plan') {
          // Extrair informações sobre recursos adicionados/alterados/destruídos
          // Este é um parser simples e pode precisar ser ajustado com base na saída real do Terraform
          const addMatch = stdout.match(/Plan: (\d+) to add, (\d+) to change, (\d+) to destroy/);
          if (addMatch) {
            changes = {
              added: parseInt(addMatch[1], 10),
              changed: parseInt(addMatch[2], 10),
              destroyed: parseInt(addMatch[3], 10)
            };
          }
        }
        
        resolve({
          success: true,
          output: stdout,
          changes,
          hasChanges: command === 'plan' ? code === 2 : null
        });
      });
      
      terraformProcess.on('error', (err) => {
        reject(new TerraformError('Erro ao executar comando Terraform', err.message));
      });
    } catch (error) {
      reject(new TerraformError('Erro ao executar comando Terraform', error.message));
    }
  });
};

// Inicializar o terraform para um cliente
exports.initializeTerraform = async (client) => {
  try {
    // Gerar configuração Terraform
    const { clientDir } = await generateTerraformConfig(client);
    
    // Inicializar o Terraform
    const result = await runTerraformCommand(client._id, 'init', { 
      simulate: process.env.SIMULATE_TERRAFORM === 'true'
    });
    
    return {
      success: result.success,
      message: 'Terraform inicializado com sucesso',
      output: result.output,
      clientDir
    };
  } catch (error) {
    console.error('Erro ao inicializar Terraform:', error);
    throw error;
  }
};

// Criar plano Terraform
exports.createPlan = async (client, options = {}) => {
  try {
    // Verificar se a configuração já existe, senão criar
    const clientDir = path.join(TERRAFORM_DIR, 'clients', client._id.toString());
    try {
      await fs.access(clientDir);
    } catch (err) {
      // Se não existir, inicializar
      await exports.initializeTerraform(client);
    }
    
    // Nome do arquivo de plano
    const planFile = options.planFile || `${client._id.toString()}-plan.tfplan`;
    const planPath = path.join(clientDir, planFile);
    
    // Criar plano
    const result = await runTerraformCommand(client._id, 'plan', {
      output: planFile,
      vars: options.vars,
      simulate: process.env.SIMULATE_TERRAFORM === 'true'
    });
    
    return {
      success: result.success,
      planPath,
      hasChanges: result.hasChanges,
      changes: result.changes,
      output: result.output
    };
  } catch (error) {
    console.error('Erro ao criar plano Terraform:', error);
    throw error;
  }
};

// Aplicar plano Terraform
exports.applyPlan = async (client, options = {}) => {
  try {
    // Se um plano específico for fornecido, usar
    const planFile = options.planFile;
    
    // Aplicar
    const result = await runTerraformCommand(client._id, 'apply', {
      autoApprove: options.autoApprove !== false,
      planFile,
      vars: options.vars,
      simulate: process.env.SIMULATE_TERRAFORM === 'true',
      onOutput: options.onOutput
    });
    
    return {
      success: result.success,
      changes: result.changes,
      output: result.output
    };
  } catch (error) {
    console.error('Erro ao aplicar plano Terraform:', error);
    throw error;
  }
};

// Destruir recursos Terraform
exports.destroyResources = async (client, options = {}) => {
  try {
    // Destruir recursos
    const result = await runTerraformCommand(client._id, 'destroy', {
      autoApprove: options.autoApprove !== false,
      vars: options.vars,
      simulate: process.env.SIMULATE_TERRAFORM === 'true',
      onOutput: options.onOutput
    });
    
    return {
      success: result.success,
      output: result.output
    };
  } catch (error) {
    console.error('Erro ao destruir recursos Terraform:', error);
    throw error;
  }
};

// Obter saída do Terraform
exports.getOutputs = async (client) => {
  try {
    const result = await runTerraformCommand(client._id, 'output', {
      simulate: process.env.SIMULATE_TERRAFORM === 'true'
    });
    
    // Se estiver em modo de simulação, criar saídas fictícias
    if (process.env.SIMULATE_TERRAFORM === 'true') {
      return {
        success: true,
        outputs: {
          backup_vault_id: {
            value: `arn:aws:backup:us-east-1:123456789012:backup-vault:${client._id}-vault`,
            type: "string"
          },
          backup_plan_id: {
            value: `arn:aws:backup:us-east-1:123456789012:backup-plan:${client._id}-plan`,
            type: "string"
          },
          recovery_point_arn: {
            value: `arn:aws:backup:us-east-1:123456789012:recovery-point:${client._id}-recovery-point`,
            type: "string"
          }
        }
      };
    }
    
    // Analisar a saída JSON
    let outputs = {};
    if (result.output) {
      try {
        outputs = JSON.parse(result.output);
      } catch (err) {
        console.error('Erro ao analisar saída do Terraform:', err);
      }
    }
    
    return {
      success: result.success,
      outputs
    };
  } catch (error) {
    console.error('Erro ao obter saídas do Terraform:', error);
    
    // Em caso de erro, retornar objeto vazio
    return {
      success: false,
      outputs: {},
      error: error.message
    };
  }
};

// Validar configuração Terraform
exports.validateConfig = async (client) => {
  try {
    // Verificar se a configuração existe
    const clientDir = path.join(TERRAFORM_DIR, 'clients', client._id.toString());
    try {
      await fs.access(clientDir);
    } catch (err) {
      throw new TerraformError('Configuração Terraform não encontrada para o cliente', client._id);
    }
    
    // Validar configuração
    const result = await runTerraformCommand(client._id, 'validate', {
      simulate: process.env.SIMULATE_TERRAFORM === 'true'
    });
    
    return {
      success: result.success,
      message: 'Configuração Terraform válida',
      output: result.output
    };
  } catch (error) {
    console.error('Erro ao validar configuração Terraform:', error);
    throw error;
  }
};

// Atualizar configuração Terraform para um cliente
exports.updateTerraformConfig = async (client) => {
  try {
    // Gerar novamente a configuração
    const { clientDir } = await generateTerraformConfig(client);
    
    // Inicializar novamente para garantir que tudo está atualizado
    await runTerraformCommand(client._id, 'init', {
      simulate: process.env.SIMULATE_TERRAFORM === 'true'
    });
    
    return {
      success: true,
      message: 'Configuração Terraform atualizada com sucesso',
      clientDir
    };
  } catch (error) {
    console.error('Erro ao atualizar configuração Terraform:', error);
    throw error;
  }
};

// Implementar terraform para restauração
exports.planRestore = async (client, backup, options = {}) => {
  try {
    // Verificar se a configuração existe
    const clientDir = path.join(TERRAFORM_DIR, 'clients', client._id.toString());
    
    try {
      await fs.access(clientDir);
    } catch (err) {
      // Se não existir, inicializar
      await exports.initializeTerraform(client);
    }
    
    // Preparar variáveis específicas para restauração
    const restoreVars = {
      ...options.vars,
      'restore_mode': 'true',
      'backup_id': backup._id.toString(),
      'recovery_point_arn': backup.recoveryPointArn || 'simulated-recovery-point'
    };
    
    // Criar plano de restauração
    const planFile = `${client._id.toString()}-restore-plan.tfplan`;
    
    const result = await runTerraformCommand(client._id, 'plan', {
      output: planFile,
      vars: restoreVars,
      simulate: process.env.SIMULATE_TERRAFORM === 'true'
    });
    
    return {
      success: result.success,
      planPath: path.join(clientDir, planFile),
      hasChanges: result.hasChanges,
      changes: result.changes,
      output: result.output
    };
  } catch (error) {
    console.error('Erro ao criar plano de restauração:', error);
    throw error;
  }
};

// Aplicar plano de restauração
exports.applyRestore = async (client, backup, options = {}) => {
  try {
    // Preparar variáveis específicas para restauração
    const restoreVars = {
      ...options.vars,
      'restore_mode': 'true',
      'backup_id': backup._id.toString(),
      'recovery_point_arn': backup.recoveryPointArn || 'simulated-recovery-point'
    };
    
    // Se um plano específico for fornecido, usar
    const planFile = options.planFile;
    
    // Aplicar restauração
    const result = await runTerraformCommand(client._id, 'apply', {
      autoApprove: options.autoApprove !== false,
      planFile,
      vars: restoreVars,
      simulate: process.env.SIMULATE_TERRAFORM === 'true',
      onOutput: options.onOutput
    });
    
    return {
      success: result.success,
      changes: result.changes,
      output: result.output
    };
  } catch (error) {
    console.error('Erro ao aplicar restauração:', error);
    throw error;
  }
};

// Exportar função de geração de configuração (para testes)
exports.generateTerraformConfig = generateTerraformConfig;

// Exportar função de execução de comando (para testes)
exports.runTerraformCommand = runTerraformCommand;

