/**
 * Configurações globais da aplicação
 */

module.exports = {
  env: process.env.NODE_ENV || 'development',
  
  // Configuração do banco de dados
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/backup-saas',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // Configuração JWT para autenticação
  jwt: {
    secret: process.env.JWT_SECRET || 'backup-dr-saas-secret-key',
    expiresIn: process.env.JWT_EXPIRES || '1d'
  },
  
  // Configuração de caminhos do Terraform
  terraform: {
    rootPath: process.env.TERRAFORM_ROOT || 'c:/Users/Aleluia-X/Desktop/terraform',
    statePath: process.env.TERRAFORM_STATE_DIR || 'terraform-states',
    logPath: process.env.TERRAFORM_LOG_DIR || 'terraform-logs'
  },
  
  // Configuração de provedores de nuvem
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  
  azure: {
    subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  },
  
  gcp: {
    projectId: process.env.GCP_PROJECT_ID,
    credentials: process.env.GCP_CREDENTIALS_FILE
  },
  
  // Configuração de logging
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'app.log'
  }
};

