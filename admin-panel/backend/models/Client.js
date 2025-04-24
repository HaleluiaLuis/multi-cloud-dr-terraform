/**
 * Modelo para clientes do SaaS de Backup Multi-Cloud
 * Gerencia os dados dos clientes e suas configurações de backup
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Esquema de configuração AWS
const awsConfigSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  region: {
    type: String,
    default: 'us-east-1'
  },
  resources: {
    type: [String],
    default: []
  },
  backupVaultName: {
    type: String
  }
}, { _id: false });

// Esquema de configuração Azure
const azureConfigSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    default: 'eastus'
  },
  resourceGroupName: {
    type: String
  },
  vmIds: {
    type: [String],
    default: []
  },
  storageAccountIds: {
    type: [String],
    default: []
  },
  fileShareNames: {
    type: [String],
    default: []
  }
}, { _id: false });

// Esquema de configuração GCP
const gcpConfigSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  projectId: {
    type: String
  },
  region: {
    type: String,
    default: 'us-central1'
  },
  zone: {
    type: String,
    default: 'us-central1-a'
  },
  computeInstances: {
    type: [String],
    default: []
  },
  cloudsqlInstances: {
    type: [String],
    default: []
  },
  storageBuckets: {
    type: [String],
    default: []
  },
  backupPlans: {
    type: [{
      name: String,
      region: String,
      retention_days: Number,
      daily_recurrence: String,
      weekly_day_of_weeks: [String],
      monthly_days_of_month: [Number]
    }],
    default: []
  }
}, { _id: false });

// Esquema de configuração de backup
const backupConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Completo', 'Incremental', 'Diferencial'],
    default: 'Incremental'
  },
  frequency: {
    type: String,
    enum: ['Diário', 'Semanal', 'Mensal'],
    default: 'Diário'
  },
  retention: {
    type: Number,
    default: 30 // dias
  },
  startTime: {
    type: String,
    default: '01:00'
  },
  drTestFrequency: {
    type: String,
    enum: ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual', null],
    default: 'Mensal'
  },
  environment: {
    type: String,
    default: 'prod'
  },
  recoveryPointObjective: {
    type: String,
    default: '24h' // RPO - Objetivo de Ponto de Recuperação
  },
  recoveryTimeObjective: {
    type: String,
    default: '4h' // RTO - Objetivo de Tempo de Recuperação
  },
  aws: {
    type: awsConfigSchema,
    default: () => ({})
  },
  azure: {
    type: azureConfigSchema,
    default: () => ({})
  },
  gcp: {
    type: gcpConfigSchema,
    default: () => ({})
  }
}, { _id: false });

// Esquema principal do cliente
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do cliente é obrigatório'],
    trim: true
  },
  environment: {
    type: String,
    enum: ['dev', 'staging', 'prod'],
    default: 'prod'
  },
  status: {
    type: String,
    enum: ['Ativo', 'Pausado', 'Suspenso', 'Inativo'],
    default: 'Ativo'
  },
  email: {
    type: String,
    required: [true, 'Email de contato é obrigatório'],
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  phone: {
    type: String,
    trim: true
  },
  contactName: {
    type: String,
    trim: true
  },
  awsEnabled: {
    type: Boolean,
    default: false
  },
  azureEnabled: {
    type: Boolean,
    default: false
  },
  gcpEnabled: {
    type: Boolean,
    default: false
  },
  providers: {
    type: [String],
    enum: ['aws', 'azure', 'gcp'],
    default: []
  },
  backupConfig: {
    type: backupConfigSchema,
    default: () => ({})
  },
  terraformState: {
    type: String,
    enum: ['NotInitialized', 'Initializing', 'Initialized', 'Failed'],
    default: 'NotInitialized'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar a data de modificação
clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Adicionar plugin de paginação
clientSchema.plugin(mongoosePaginate);

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;